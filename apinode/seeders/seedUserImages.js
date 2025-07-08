const db = require('../config/db');
const { faker } = require('@faker-js/faker');

async function seedUserImages() {
  try {
    console.log('🌱 Iniciando seeder de imágenes para usuarios...');

    // Obtener todos los usuarios
    const [users] = await db.query('SELECT id FROM users');
    
    if (users.length === 0) {
      throw new Error('No hay usuarios en la base de datos. Ejecuta primero el seeder de usuarios.');
    }

    // Crear una imagen para cada usuario (relación morphOne)
    for (const user of users) {
      await db.query(
        `INSERT INTO images (url, imageable_type, imageable_id, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [
          generateUserImageUrl(),
          'User', // Tipo polimórfico
          user.id
        ]
      );
    }

    console.log(`✅ ${users.length} imágenes de usuarios creadas con éxito!`);
  } catch (error) {
    console.error('❌ Error en el seeder de imágenes para usuarios:', error);
  } finally {
    await db.end();
  }
}

function generateUserImageUrl() {
  // Usar servicio de avatares aleatorios
  const services = [
    () => `https://i.pravatar.cc/300?u=${faker.string.uuid()}`,
    () => `https://robohash.org/${faker.string.uuid()}?set=set4`,
    () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${faker.string.uuid()}`
  ];
  
  const randomService = faker.helpers.arrayElement(services);
  return randomService();
}

seedUserImages();