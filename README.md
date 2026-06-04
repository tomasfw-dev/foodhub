# Comida Carito

Sitio web para emprendimiento de comidas caseras.

## Stack

- Node.js + Express
- EJS (vistas)
- CSS + jQuery (frontend)

## Estructura del proyecto

```
comida-carito/
├── backend/                 # Servidor (API, rutas, lógica)
│   ├── server.js            # Punto de entrada
│   ├── app.js               # Configuración Express
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   └── utils/
│
├── frontend/                # Cliente (lo que ve el navegador)
│   ├── views/               # Plantillas EJS
│   └── public/              # CSS, JS, imágenes, fuentes
│
├── package.json
├── .env.example
└── README.md
```

En la raíz solo quedan archivos de configuración del proyecto (`package.json`, `.env`, etc.) y `node_modules/`.

## Instalación

```bash
npm install
cp .env.example .env
```

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Rutas

| Ruta    | Descripción   |
|---------|---------------|
| `/`     | Landing page  |
| `/menu` | Menú de comidas |

## Próximas funcionalidades

- Panel administrador (`/admin`)
- Autenticación de usuarios
- Gestión de menú desde base de datos
