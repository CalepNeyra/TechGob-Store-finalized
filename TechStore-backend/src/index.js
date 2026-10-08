import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import './config/passport.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

// Definir __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesión para Passport
app.use(
  session({
    secret: process.env.JWT_SECRET || 'secret_key_default',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());

// Servir archivos estáticos del Frontend (subiendo 1 nivel desde /src)
app.use(express.static(path.join(__dirname, '../TechStore-frontend')));

// Rutas de la API
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);

// Ruta principal -> Carga directamente index.html en http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../TechStore-frontend/index.html'));
});

// Ruta para la página de Registro
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../TechStore-frontend/register.html'));
});

// Ruta para el Dashboard Principal
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../TechStore-frontend/dashboard.html'));
});

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Inicializar conexión a DB y Servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
});