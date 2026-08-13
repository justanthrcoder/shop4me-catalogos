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

## Origen y reglas de generación

Los dos catálogos de identificación fueron generados desde `producto.DBF`, con
fecha de cabecera 2026-08-12 y SHA-256
`2b4106c041d21e44e68b7a2e45a1497133edb4bfdf2b9453791c450c6131899e`.

- Se incluyen únicamente registros activos.
- `CODVAR` se usa como EAN y debe tener entre 8 y 14 dígitos; el valor `0` y los
  identificadores inválidos se excluyen.
- Los registros repetidos se agrupan por EAN. Una asignación no vacía prevalece
  sobre una vacía; dos asignaciones no vacías distintas producen `CONFLICTO`.
- `FAMILIA` y `LABORA` son códigos, no nombres. El DBF entregado no contiene las
  tablas que traducen esos códigos a nombres descriptivos.
- Las filas se ordenan lexicográficamente por EAN para que futuras actualizaciones
  produzcan diferencias deterministas.

| Catálogo | Filas | Con código | `SIN_DATO` | `CONFLICTO` |
|---|---:|---:|---:|---:|
| Familia | 48.691 | 21.406 | 27.285 | 0 |
| Laboratorio | 48.691 | 48.685 | 2 | 4 |

Los archivos `maestros_convertido.txt` y `maestros_medicinal_format.txt` no se
modificaron al incorporar estos catálogos. La versión actual de Shop4me todavía
no descarga ni consume los dos archivos nuevos; su integración se realizará por
separado.
