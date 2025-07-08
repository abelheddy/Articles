const db = require('../config/db');
const { faker } = require('@faker-js/faker');
const axios = require('axios'); // Necesario para verificar las imágenes
const https = require('https'); // Para manejar peticiones HTTPS

// Configuración del seeder
const SEEDER_CONFIG = {
  minImagesPerArticle: 1,    // Mínimo de imágenes por artículo
  maxImagesPerArticle: 5,    // Máximo de imágenes por artículo
  imageWidth: 800,           // Ancho de las imágenes
  imageHeight: 600,          // Alto de las imágenes
  maxImageId: 1000,          // Máximo ID para picsum.photos
  maxRetries: 3,             // Máximo de intentos para encontrar una imagen válida
  timeout: 5000              // Tiempo máximo de espera para verificar una imagen (ms)
};

// Configurar axios para ignorar errores de SSL y timeout
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false // Para evitar problemas con certificados SSL
  }),
  timeout: SEEDER_CONFIG.timeout
});

async function seedImages() {
  try {
    console.log('🌱 Iniciando seeder de imágenes...');
    
    // 1. Verificar si hay artículos
    let [articles] = await db.query('SELECT id FROM articles');
    
    if (articles.length === 0) {
      console.log('⚠️ No hay artículos en la base de datos. Creando 5 artículos de prueba...');
      await createSampleArticles();
      // Obtener los artículos nuevamente
      [articles] = await db.query('SELECT id FROM articles');
    }

    // 2. Insertar imágenes para cada artículo
    let totalImagesCreated = 0;
    let totalImagesSkipped = 0;
    
    for (const article of articles) {
      const imagesCount = faker.number.int({
        min: SEEDER_CONFIG.minImagesPerArticle,
        max: SEEDER_CONFIG.maxImagesPerArticle
      });

      console.log(`📝 Procesando artículo ${article.id} (${imagesCount} imágenes)`);
      
      let imagesInserted = 0;
      let attempts = 0;
      
      while (imagesInserted < imagesCount && attempts < imagesCount * SEEDER_CONFIG.maxRetries) {
        attempts++;
        try {
          const imageUrl = await generateValidImageUrl();
          
          await db.query(
            'INSERT INTO images (url, imageable_type, imageable_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [imageUrl, 'Article', article.id]
          );
          
          console.log(`   ✅ Imagen ${imagesInserted + 1} insertada: ${imageUrl}`);
          imagesInserted++;
          totalImagesCreated++;
        } catch (error) {
          if (error.message.includes('No se pudo encontrar una imagen válida')) {
            totalImagesSkipped++;
            continue;
          }
          console.error(`   ❌ Error al insertar imagen: ${error.message}`);
        }
      }
      
      if (imagesInserted < imagesCount) {
        console.log(`   ⚠️ Solo se insertaron ${imagesInserted} de ${imagesCount} imágenes para el artículo ${article.id}`);
      }
    }
    
    console.log(`✅ Seeder completado con éxito!`);
    console.log(`📦 Artículos procesados: ${articles.length}`);
    console.log(`🖼️ Imágenes creadas: ${totalImagesCreated}`);
    console.log(`🚫 Imágenes omitidas: ${totalImagesSkipped}`);
    
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await db.end();
    process.exit(0);
  }
}

// Función para generar URLs de imágenes válidas
async function generateValidImageUrl() {
  let attempts = 0;
  
  while (attempts < SEEDER_CONFIG.maxRetries) {
    attempts++;
    const imageUrl = generateRandomImageUrl();
    
    try {
      // Verificar si la imagen existe haciendo una petición HEAD (más eficiente)
      const response = await axiosInstance.head(imageUrl);
      
      // Verificar que el content-type sea una imagen
      const contentType = response.headers['content-type'];
      if (contentType && contentType.startsWith('image/')) {
        return imageUrl;
      }
    } catch (error) {
      // Si falla, intentamos con GET para algunos servicios que no responden bien a HEAD
      try {
        const response = await axiosInstance.get(imageUrl, { responseType: 'stream' });
        if (response.headers['content-type'].startsWith('image/')) {
          return imageUrl;
        }
      } catch (innerError) {
        // Continuar con el siguiente intento
        continue;
      }
    }
  }
  
  throw new Error('No se pudo encontrar una imagen válida después de varios intentos');
}

// Función para generar URLs de imágenes aleatorias
function generateRandomImageUrl() {
  const imageId = faker.number.int({ min: 1, max: SEEDER_CONFIG.maxImageId });
  const width = SEEDER_CONFIG.imageWidth;
  const height = SEEDER_CONFIG.imageHeight;
  
  // Usar servicios más confiables
  const serviceType = faker.number.int({ min: 0, max: 3 });
  
  switch(serviceType) {
    case 0:
      // Picsum con ID específico (más confiable que el random)
      return `https://picsum.photos/id/${imageId}/${width}/${height}`;
    case 1:
      // Unsplash con categorías específicas (más confiable que totalmente random)
      const categories = ['nature', 'technology', 'food', 'architecture', 'people'];
      const category = categories[faker.number.int({ min: 0, max: categories.length - 1 })];
      return `https://source.unsplash.com/featured/${width}x${height}/?${category},${imageId}`;
    case 2:
      // Placeholder.com (siempre funciona)
      return `https://via.placeholder.com/${width}x${height}?text=Product+${imageId}`;
    case 3:
      // PlaceKitten (solo si te gustan los gatos)
      return `https://placekitten.com/${width}/${height}`;
    default:
      return `https://picsum.photos/id/${imageId}/${width}/${height}`;
  }
}

// Función para crear artículos de prueba si no existen
async function createSampleArticles() {
  const sampleArticles = [
    { nombre: 'Laptop Premium', descripcion: 'Potente laptop para trabajo y juegos', price: 1299.99 },
    { nombre: 'Smartphone Pro', descripcion: 'Último modelo con cámara profesional', price: 899.99 },
    { nombre: 'Auriculares Inalámbricos', descripcion: 'Sonido de alta calidad sin cables', price: 199.99 },
    { nombre: 'Smartwatch Deportivo', descripcion: 'Monitoriza tu actividad física', price: 249.99 },
    { nombre: 'Tablet HD', descripcion: 'Pantalla retina para multimedia', price: 349.99 }
  ];

  for (const article of sampleArticles) {
    await db.query(
      'INSERT INTO articles (nombre, descripcion, price) VALUES (?, ?, ?)',
      [article.nombre, article.descripcion, article.price]
    );
  }
}

// Ejecutar el seeder
seedImages();