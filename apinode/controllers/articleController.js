const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlink = promisify(fs.unlink);
const Article = require('../models/Article');
const Image = require('../models/Image');

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json({
      status: 'success',
      data: articles
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener artículos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { nombre, descripcion, price, images = [] } = req.body;
    
    // Validación de campos obligatorios
    if (!nombre || !descripcion || price === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Todos los campos son obligatorios',
        requiredFields: ['nombre', 'descripcion', 'price']
      });
    }
    
    // Crear artículo
    const article = await Article.create({ nombre, descripcion, price });
    
    // Procesar imágenes si existen
    if (images.length > 0) {
      const createdImages = await Promise.all(
        images.map(image => 
          Image.create({ 
            url: image.url, 
            type: image.type || 'URL',
            imageable_type: 'Article', 
            imageable_id: article.id 
          })
        )
      );
      article.images = createdImages;
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Artículo creado correctamente',
      data: article
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Error al crear artículo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Artículo no encontrado'
      });
    }
    res.json({
      status: 'success',
      data: article
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener artículo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { nombre, descripcion, price } = req.body;
    const article = await Article.update(req.params.id, { nombre, descripcion, price });
    
    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Artículo no encontrado'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Artículo actualizado correctamente',
      data: article
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Error al actualizar artículo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.delete(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Artículo no encontrado'
      });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar artículo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.manageArticleImages = async (req, res) => {
  try {
    const { action, images = [] } = req.body;
    const articleId = req.params.id;

    // Validar acción
    const validActions = ['add', 'replace', 'remove'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        status: 'error',
        message: 'Acción no válida',
        validActions: validActions
      });
    }

    // Verificar que el artículo existe
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        status: 'error',
        message: 'Artículo no encontrado'
      });
    }

    // Procesar según la acción
    if (action === 'replace') {
      await Image.deleteByImageable('Article', articleId);
    }

    if (action !== 'remove' && images.length > 0) {
      // Validar imágenes
      const invalidImages = images.filter(img => !img.url || typeof img.url !== 'string');
      if (invalidImages.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Algunas imágenes no tienen URL válida'
        });
      }

      // Añadir nuevas imágenes
      const createdImages = await Promise.all(
        images.map(image => 
          Image.create({ 
            url: image.url, 
            type: image.type || 'URL',
            imageable_type: 'Article', 
            imageable_id: articleId 
          })
        )
      );
      article.images = createdImages;
    } else {
      article.images = await Image.findByImageable('Article', articleId);
    }

    res.json({
      status: 'success',
      message: `Imágenes ${action === 'remove' ? 'eliminadas' : 'actualizadas'} correctamente`,
      data: article
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Error al gestionar imágenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.uploadArticleImages = async (req, res) => {
  try {
    // Verificar que hay archivos subidos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        code: 'NO_FILES',
        message: 'No se recibieron archivos',
        details: 'Debe enviar al menos un archivo en el campo "images"'
      });
    }

    const articleId = req.params.id;
    const article = await Article.findById(articleId);
    
    if (!article) {
      // Eliminar archivos subidos si el artículo no existe
      await Promise.all(req.files.map(file => 
        unlink(path.join(__dirname, '../public/uploads', file.filename))
      ));
      return res.status(404).json({
        status: 'error',
        code: 'ARTICLE_NOT_FOUND',
        message: 'Artículo no encontrado'
      });
    }

    // Procesar cada imagen
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    const createdImages = await Promise.all(
      req.files.map(async (file) => {
        try {
          const image = await Image.create({
            url: `${baseUrl}${file.filename}`,
            type: 'UPLOADED',
            imageable_type: 'Article',
            imageable_id: articleId
          });
          return {
            id: image.id,
            url: image.url,
            filename: file.filename,
            size: file.size
          };
        } catch (error) {
          // Si falla la creación en BD, eliminar el archivo
          await unlink(path.join(__dirname, '../public/uploads', file.filename));
          throw error;
        }
      })
    );

    res.status(201).json({
      status: 'success',
      message: `${req.files.length} imagen(es) subida(s) correctamente`,
      data: {
        articleId,
        images: createdImages
      }
    });

  } catch (error) {
    console.error('Error en uploadArticleImages:', error);
    
    // Limpieza en caso de error
    if (req.files) {
      await Promise.all(req.files.map(file => 
        unlink(path.join(__dirname, '../public/uploads', file.filename))
          .catch(e => console.error('Error al eliminar archivo:', e))
      ));
    }
    
    res.status(500).json({
      status: 'error',
      code: 'UPLOAD_ERROR',
      message: 'Error al procesar imágenes',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
};