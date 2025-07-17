require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const ip = require('ip');
const db = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP'
});

// Middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing (orden correcto)
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10kb' }));

// Validación de JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      status: 'error',
      message: 'JSON malformado',
      details: err.message
    });
  }
  next();
});

// Verificar conexión a la base de datos
const checkDatabaseConnection = async (attempts = 5) => {
  for (let i = 0; i < attempts; i++) {
    try {
      await db.query('SELECT 1');
      console.log('✅ Conectado a la base de datos MySQL');
      return true;
    } catch (err) {
      console.error(`⛔ Intento ${i + 1} de ${attempts}: Error de conexión`, err.message);
      if (i === attempts - 1) {
        console.error('❌ No se pudo conectar a la base de datos');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Crear tablas
const createTables = async () => {
  const tables = [
    {
      name: 'articles',
      query: `
        CREATE TABLE IF NOT EXISTS articles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
    },
    {
      name: 'images',
      query: `
        CREATE TABLE IF NOT EXISTS images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          url VARCHAR(255) NOT NULL,
          imageable_type VARCHAR(255) NOT NULL,
          imageable_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX (imageable_type, imageable_id)
        )`
    },
    {
      name: 'users',
      query: `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
    }
  ];

  try {
    for (const table of tables) {
      await db.query(table.query);
      console.log(`✔ Tabla "${table.name}" verificada/creada`);
    }
  } catch (err) {
    console.error('❌ Error al crear tablas:', err);
    throw err;
  }
};

// Inicialización de la aplicación
const initializeApp = async () => {
  try {
    await checkDatabaseConnection();
    await createTables();
    
    app.use('/api/articles', articleRoutes);
    app.use('/api/users', userRoutes);
    app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

    // Ruta de salud mejorada
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'API funcionando',
        timestamp: new Date().toISOString(),
        database: 'connected',
        clientIp: req.ip,
        serverIp: ip.address() // Solo la IP principal
      });
    });
    
    // Manejo de rutas no encontradas
    app.use('*', (req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada',
        requestedUrl: req.originalUrl,
        clientIp: req.ip
      });
    });
    
    // Manejo centralizado de errores
    app.use((err, req, res, next) => {
      console.error('🔥 Error:', err.stack);
      res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Error interno',
        clientIp: req.ip,
        ...(process.env.NODE_ENV === 'development' && { details: err.stack })
      });
    });
    
    // Iniciar servidor con mensaje simplificado
    const server = app.listen(PORT, () => {
      console.log(`
      🚀 Servidor corriendo en:
      - Local: http://localhost:${PORT}
      - Red: http://${ip.address()}:${PORT}
      - Entorno: ${process.env.NODE_ENV || 'development'}
      `);
    });
    
    // Manejo de cierre elegante (mantenido igual)
    process.on('SIGTERM', () => {
      console.log('🛑 Recibido SIGTERM. Cerrando servidor...');
      server.close(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      console.log('🛑 Recibido SIGINT. Cerrando servidor...');
      server.close(() => process.exit(0));
    });

    process.on('unhandledRejection', (err) => {
      console.error('⛔ Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error('⛔ Uncaught Exception:', err);
      server.close(() => process.exit(1));
    });
    
  } catch (err) {
    console.error('❌ Error al iniciar la aplicación:', err);
    process.exit(1);
  }
};

initializeApp();