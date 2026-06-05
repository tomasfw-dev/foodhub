const express = require('express');

const config = require('./config');
const paths = require('./config/paths');
const constants = require('./config/constants');
const routes = require('./routes');
const { notFoundHandler } = require('./middlewares/notFound.middleware');
const { errorHandler } = require('./middlewares/error.middleware');
const { flashMiddleware } = require('./middlewares/flash.middleware');
const createSessionMiddleware = require('./config/session.config');
const imageHelper = require('./utils/image.helpers');

const app = express();

// Configuración de vistas EJS
app.set('view engine', 'ejs');
app.set('views', paths.viewsDir);

// Variables globales para todas las vistas
app.locals.appName = config.appName;
app.locals.whatsapp = config.whatsapp;
app.locals.site = constants.SITE;
app.locals.routes = constants.ROUTES;
app.locals.adminRoutes = constants.ADMIN_ROUTES;
app.locals.resolveProductImageUrl = imageHelper.resolveProductImageUrl;
app.locals.defaultProductImage = imageHelper.DEFAULT_PRODUCT_IMAGE;

// Middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(createSessionMiddleware());
app.use(flashMiddleware);

// Assets públicos
app.use(express.static(paths.publicDir));

// Rutas
app.use(routes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
