# SQL Server — Bendita-Comida

## Ejecución

1. Crear la base (opcional, descomentar en el script).
2. Ejecutar `001_schema_bendita_comida.sql` en SSMS o Azure Data Studio.
3. Opcional: `003_seed_menu_ejemplo.sql` para datos de prueba del menú.
4. Consultas de referencia del menú: `002_menu_queries.sql`.
5. Consulta del dashboard admin: `004_dashboard_queries.sql`.

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
