'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DELIMITER = ',,,,';
const EXPECTED_ROWS = 48691;
const EXPECTED_UNNAMED_FAMILIES = new Set(['887', '40147']);

const CATALOGS = [
  {
    kind: 'familia',
    displayFile: 'maestros_familia_format.txt',
    codeFile: 'maestros_familia_codigo_format.txt',
    namesFile: 'familias_nombres_format.txt',
    allowedUnnamedCodes: EXPECTED_UNNAMED_FAMILIES,
  },
  {
    kind: 'laboratorio',
    displayFile: 'maestros_laboratorio_format.txt',
    codeFile: 'maestros_laboratorio_codigo_format.txt',
    namesFile: 'laboratorios_nombres_format.txt',
    allowedUnnamedCodes: new Set(),
  },
];

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
}

function parseLine(line, fileName, lineNumber) {
  const first = line.indexOf(DELIMITER);
  const last = line.lastIndexOf(DELIMITER);
  if (first <= 0 || last <= first) {
    throw new Error(`${fileName}:${lineNumber} no tiene el formato esperado`);
  }
  return {
    left: line.slice(0, first),
    middle: line.slice(first + DELIMITER.length, last),
    right: line.slice(last + DELIMITER.length),
  };
}

function loadNames(fileName) {
  const names = new Map();
  readLines(path.join(ROOT, fileName)).forEach((line, index) => {
    const separator = line.indexOf(DELIMITER);
    if (separator <= 0 || separator !== line.lastIndexOf(DELIMITER)) {
      throw new Error(`${fileName}:${index + 1} no tiene el formato código→nombre esperado`);
    }
    const code = line.slice(0, separator).trim();
    const name = line.slice(separator + DELIMITER.length).trim();
    if (!code || !name || names.has(code)) {
      throw new Error(`${fileName}:${index + 1} contiene un código/nombre inválido o repetido`);
    }
    names.set(code, name);
  });
  return names;
}

function ensureInternalCodeCatalog(config) {
  const displayPath = path.join(ROOT, config.displayFile);
  const codePath = path.join(ROOT, config.codeFile);
  if (!fs.existsSync(codePath)) {
    fs.copyFileSync(displayPath, codePath);
  }
  return codePath;
}

function renderReadableCatalog(config) {
  const codePath = ensureInternalCodeCatalog(config);
  const names = loadNames(config.namesFile);
  const seenEans = new Set();
  const missingCodes = new Set();
  let sinDato = 0;
  let conflicto = 0;
  const rendered = readLines(codePath).map((line, index) => {
    const record = parseLine(line, config.codeFile, index + 1);
    const ean = record.left.trim();
    const code = record.right.trim();
    if (!/^\d{8,14}$/.test(ean) || !record.middle.trim() || seenEans.has(ean)) {
      throw new Error(`${config.codeFile}:${index + 1} contiene un EAN, descripción o duplicado inválido`);
    }
    seenEans.add(ean);

    let readableName;
    if (code === 'SIN_DATO') {
      readableName = 'Sin dato';
      sinDato += 1;
    } else if (code === 'CONFLICTO') {
      readableName = 'Conflicto';
      conflicto += 1;
    } else {
      readableName = names.get(code);
      if (!readableName) {
        missingCodes.add(code);
        if (!config.allowedUnnamedCodes.has(code)) {
          throw new Error(`${config.namesFile} no contiene el código usado ${code}`);
        }
        readableName = 'Sin nombre oficial';
      }
    }
    return `${record.left}${DELIMITER}${record.middle}${DELIMITER}${readableName}`;
  });

  if (rendered.length !== EXPECTED_ROWS) {
    throw new Error(`${config.codeFile} tiene ${rendered.length} filas; se esperaban ${EXPECTED_ROWS}`);
  }
  const unexpectedAllowed = [...config.allowedUnnamedCodes].filter((code) => !missingCodes.has(code));
  if (unexpectedAllowed.length) {
    throw new Error(`Los códigos sin nombre esperados ya no están pendientes: ${unexpectedAllowed.join(', ')}`);
  }

  const output = Buffer.from(`\uFEFF${rendered.join('\n')}\n`, 'utf8');
  fs.writeFileSync(path.join(ROOT, config.displayFile), output);
  return {
    kind: config.kind,
    rows: rendered.length,
    sinDato,
    conflicto,
    unnamedCodes: [...missingCodes],
    codeSha256: sha256(fs.readFileSync(codePath)),
    displaySha256: sha256(output),
  };
}

for (const config of CATALOGS) {
  const result = renderReadableCatalog(config);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
