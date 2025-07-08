require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');
//const authRoutes = require('./routes/authRoutes'); 
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // En producción cambia esto por tu dominio o IP de la app
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Verificar conexión a la base de datos
db.query('SELECT 1')
  .then(() => console.log('Conectado a la base de datos MySQL'))
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
    process.exit(1);
  });

// Crear tablas
const createTables = async () => {
  try {
    // Tabla articles
    await db.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      )`);
    console.log('Tabla "articles" verificada/creada');

    // Tabla images
    await db.query(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        imageable_type VARCHAR(255) NOT NULL,
        imageable_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (imageable_type, imageable_id)
      )`);
    console.log('Tabla "images" verificada/creada');

    // Nueva tabla users
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,  -- Único para evitar duplicados
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
    console.log('Tabla "users" verificada/creada');

  } catch (err) {
    console.error('Error al crear tablas:', err);
  }
};

createTables();

app.use('/users', userRoutes);
// Rutas
app.use('/articles', articleRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Cambia esta línea al final del archivo:
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://10.42.0.1:${PORT}`);
  console.log(`Accesible desde dispositivos en la red en: http://10.42.0.1:${PORT}/articles`);
});