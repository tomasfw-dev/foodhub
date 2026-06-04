# SQL Server — Bendita-Comida

## Ejecución

1. Crear la base (opcional, descomentar en el script).
2. Ejecutar `001_schema_bendita_comida.sql` en SSMS o Azure Data Studio.

## Modelo

```
Administradores (independiente)

Categorias 1 ──────< N Productos
```

## Convenciones

| Campo | Uso |
|-------|-----|
| `activo` | Habilita/deshabilita sin borrar el registro |
| `fecha_baja` | Soft delete (`NULL` = vigente) |
| `fecha_modificacion` | Actualizada por trigger en `UPDATE` |

## Índices

- **Administradores**: filtro por `activo` (login).
- **Categorias**: listados admin y menú por `activo` + `fecha_baja`.
- **Productos**: `categoria_id` (FK), catálogo filtrado, búsqueda por `nombre`.
