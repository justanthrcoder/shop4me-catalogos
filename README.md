# Catálogos de Shop4me

Este repositorio publica los catálogos remotos que Shop4me puede descargar.

## Catálogos actuales

- `maestros_convertido.txt`: maestro de productos.
- `maestros_medicinal_format.txt`: clasificación medicinal de productos.

## Catálogos de identificación

- `maestros_familia_format.txt`: relación entre producto y código de familia.
- `maestros_laboratorio_format.txt`: relación entre producto y código de laboratorio.

Ambos archivos tienen una fila por EAN, sin encabezado, en UTF-8 con BOM y con
saltos de línea LF. El formato es:

```text
EAN,,,,DESCRIPCION,,,,CODIGO_O_ESTADO
```

La separación debe interpretarse usando el primer y el último delimitador
literal `,,,,`, ya que una descripción puede contener comas comunes. Los códigos
son texto: no se deben quitar los ceros iniciales de laboratorio, por ejemplo
`0829`.

Los estados reservados son:

- `SIN_DATO`: el producto está identificado, pero el origen no informa esa
  clasificación.
- `CONFLICTO`: el origen asigna más de un código distinto al mismo EAN.

Ninguno de esos dos estados debe activar reglas de compra o de enrutamiento.

## Catálogos de nombres

Los códigos permanecen como identificadores estables y sus nombres se publican
en archivos separados:

- `familias_nombres_format.txt`: relación entre código de familia y nombre.
- `laboratorios_nombres_format.txt`: relación entre código de laboratorio y
  nombre.

Tienen una fila por código, sin encabezado, en UTF-8 con BOM y saltos de línea
LF. El formato es:

```text
CODIGO,,,,NOMBRE
```

Los consumidores deben unir estos archivos con los maestros por código y usar
el código como respaldo si todavía no existe una traducción. Los códigos de
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
los consumidores deben mostrar el código como respaldo hasta recibir una fuente
oficial que complete esas dos filas. El listado de laboratorios sí cubre todos
los códigos usados por su maestro.

## Origen y reglas de generación

Los dos catálogos de identificación fueron generados desde `producto.DBF`, con
fecha de cabecera 2026-08-12 y SHA-256
`2b4106c041d21e44e68b7a2e45a1497133edb4bfdf2b9453791c450c6131899e`.

- Se incluyen únicamente registros activos.
- `CODVAR` se usa como EAN y debe tener entre 8 y 14 dígitos; el valor `0` y los
  identificadores inválidos se excluyen.
- Los registros repetidos se agrupan por EAN. Una asignación no vacía prevalece
  sobre una vacía; dos asignaciones no vacías distintas producen `CONFLICTO`.
- `FAMILIA` y `LABORA` siguen siendo códigos. El DBF no incluye las traducciones;
  éstas se publican por separado a partir de los listados de Sifaco.
- Las filas se ordenan lexicográficamente por EAN para que futuras actualizaciones
  produzcan diferencias deterministas.

| Catálogo | Filas | Con código | `SIN_DATO` | `CONFLICTO` |
|---|---:|---:|---:|---:|
| Familia | 48.691 | 21.406 | 27.285 | 0 |
| Laboratorio | 48.691 | 48.685 | 2 | 4 |

Los archivos `maestros_convertido.txt` y `maestros_medicinal_format.txt` no se
modificaron al incorporar estos catálogos. Shop4me 3.0.0 puede descargar los
cuatro archivos nuevos y mostrar nombres sin reemplazar los códigos utilizados
por la lógica de identificación y enrutamiento; Shop4me 2.9.11 ignora estos
archivos adicionales.
