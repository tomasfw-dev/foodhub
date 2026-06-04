# Backend

Servidor Express. No contiene vistas ni assets estáticos; eso vive en `../frontend/`.

## Carpetas

| Carpeta        | Rol                                      |
|----------------|------------------------------------------|
| `config/`      | Variables de entorno, rutas, constantes  |
| `routes/`      | Definición de URLs                       |
| `controllers/` | Request → response / render              |
| `services/`    | Lógica de negocio                        |
| `middlewares/` | Errores, auth (futuro), etc.             |
| `utils/`       | Helpers reutilizables                    |
