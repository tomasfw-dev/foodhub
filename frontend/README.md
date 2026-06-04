# Frontend

Todo lo que ve el usuario en el navegador.

```
frontend/
├── views/          # Plantillas EJS
│   ├── layouts/
│   ├── partials/
│   └── pages/
└── public/         # Archivos estáticos (CSS, JS, imágenes)
    ├── css/
    ├── js/
    ├── images/
    └── fonts/
```

Express sirve `public/` y renderiza las vistas desde `views/`. Las rutas de configuración están en `backend/config/paths.js`.
