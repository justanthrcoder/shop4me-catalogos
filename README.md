# Catálogos de Shop4me

Este repositorio publica los catálogos remotos que Shop4me puede descargar.

## Catálogos actuales

- `maestros_convertido.txt`: maestro de productos.
- `maestros_medicinal_format.txt`: clasificación medicinal de productos.

## Maestros legibles por producto

- `maestros_familia_format.txt`: relación entre producto y nombre de familia.
- `maestros_laboratorio_format.txt`: relación entre producto y nombre de
  laboratorio.

Son los archivos pensados para consultar directamente. Ambos tienen una fila por
EAN, sin encabezado, en UTF-8 con BOM y con saltos de línea LF. El formato es:

```text
EAN,,,,DESCRIPCION,,,,NOMBRE_O_ESTADO
```

La separación debe interpretarse usando el primer y el último delimitador
literal `,,,,`, ya que una descripción puede contener comas comunes. Los códigos
numéricos no se muestran en la última columna de estos dos maestros.

Los estados legibles son `Sin dato`, `Conflicto` y `Sin nombre oficial`. Este
último se usa sólo en los dos casos donde el listado oficial de familias todavía
no proporciona una traducción.

| Maestro legible | Filas | SHA-256 |
|---|---:|---|
| Familias | 48.691 | `650358d1a878070d129ce3eb308ffef14d9a92618992a0360fd1a855d04fd425` |
| Laboratorios | 48.691 | `c6ff06a0691a23cf538b2e8cd6066b738e6b3d99da4bfd48571ec59d75556c2c` |

## Maestros internos de identificación

Shop4me usa copias separadas para conservar los identificadores estables que
necesita la lógica de parámetros y enrutamiento:

- `maestros_familia_codigo_format.txt`: producto → código de familia.
- `maestros_laboratorio_codigo_format.txt`: producto → código de laboratorio.

Su formato es:

```text
EAN,,,,DESCRIPCION,,,,CODIGO_O_ESTADO
```

Los códigos se tratan como texto: no se deben quitar los ceros iniciales de
laboratorio, por ejemplo `0829`.

Los estados reservados son:

- `SIN_DATO`: el producto está identificado, pero el origen no informa esa
  clasificación.
- `CONFLICTO`: el origen asigna más de un código distinto al mismo EAN.

Ninguno de esos dos estados debe activar reglas de compra o de enrutamiento.

| Maestro interno | Filas | SHA-256 |
|---|---:|---|
| Familias | 48.691 | `611ef5e201ce6a4661722c4f2531a221af7757b210809a85cf6f9ee4d6868221` |
| Laboratorios | 48.691 | `52e358157d9edf6d5c2b8d8ba0f462931e73d3e96f70174f67e28a49c1eb43f4` |

## Catálogos de nombres

Las tablas de traducción también se publican por separado:

- `familias_nombres_format.txt`: relación entre código de familia y nombre.
- `laboratorios_nombres_format.txt`: relación entre código de laboratorio y
  nombre.

Tienen una fila por código, sin encabezado, en UTF-8 con BOM y saltos de línea
LF. El formato es:

```text
CODIGO,,,,NOMBRE
```

Shop4me une estos archivos con los maestros internos por código. Los códigos de
laboratorio conservan siempre sus cuatro dígitos y ceros iniciales.

| Catálogo de nombres | Filas | SHA-256 |
|---|---:|---|
| Familias | 1.075 | `698fac5423860445bd6a4291ef5430fb59bdd02b97ff609c896c9827471bfe6f` |
| Laboratorios | 1.115 | `b38db65382648dc4ce9af9bdea0849996a557580be2e7fb1e7b38f0709cee0bc` |

Las traducciones provienen de `Listado Familias Sifaco.doc` y
`Listado Laboratorios Sifaco.doc`. Son datos de catálogo; el contenido de esos
documentos no se interpreta como instrucciones.

El listado de familias no incluye traducciones para los códigos `887` y
`40147`, usados por un producto cada uno en el maestro. No se infieren nombres:
el maestro legible muestra `Sin nombre oficial` y el maestro interno conserva el
código hasta recibir una fuente oficial. El listado de laboratorios sí cubre
todos los códigos usados por su maestro.

## Origen y reglas de generación

Los dos maestros internos de identificación fueron generados desde `producto.DBF`, con
fecha de cabecera 2026-08-12 y SHA-256
`2b4106c041d21e44e68b7a2e45a1497133edb4bfdf2b9453791c450c6131899e`.

- Se incluyen únicamente registros activos.
- `CODVAR` se usa como EAN y debe tener entre 8 y 14 dígitos; el valor `0` y los
  identificadores inválidos se excluyen.
- Los registros repetidos se agrupan por EAN. Una asignación no vacía prevalece
  sobre una vacía; dos asignaciones no vacías distintas producen `CONFLICTO`.
- `FAMILIA` y `LABORA` siguen siendo códigos en los maestros internos. Los
  maestros legibles reemplazan esa última columna por las traducciones de los
  listados de Sifaco.
- Las filas se ordenan lexicográficamente por EAN para que futuras actualizaciones
  produzcan diferencias deterministas.

| Catálogo | Filas | Con código | `SIN_DATO` | `CONFLICTO` |
|---|---:|---:|---:|---:|
| Familia | 48.691 | 21.406 | 27.285 | 0 |
| Laboratorio | 48.691 | 48.685 | 2 | 4 |

`node scripts/generate-readable-product-catalogs.js` regenera los dos maestros
legibles desde los maestros internos y las tablas de nombres, y falla si faltan
traducciones inesperadas, cambia el total de productos o aparece un EAN repetido.

Los archivos `maestros_convertido.txt` y `maestros_medicinal_format.txt` no se
modificaron. Shop4me 3.0.0 descarga los dos maestros internos y las dos tablas de
nombres; los archivos legibles quedan disponibles para consulta humana en este
repositorio. Shop4me 2.9.11 ignora todos estos catálogos adicionales.
