const db = require('../config/db');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Configuración
const NUM_USERS = 10;
const SALT_ROUNDS = 10;

async function seedUsers() {
  try {
    console.log('🌱 Iniciando seeder de usuarios...');

    // Crear usuarios
    for (let i = 0; i < NUM_USERS; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const password = await bcrypt.hash('password123', SALT_ROUNDS);
      
      await db.query(
        `INSERT INTO users (name, email, password, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [name, email, password]
      );
    }

    console.log(`✅ ${NUM_USERS} usuarios creados con éxito!`);
  } catch (error) {
    console.error('❌ Error en el seeder de usuarios:', error);
  } finally {
    await db.end();
  }
}

seedUsers();