const Article = require('../models/Article');

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.findAll();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { nombre, descripcion, price, images } = req.body;
    
    if (!nombre || !descripcion || price === undefined) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const article = await Article.create({ nombre, descripcion, price, images });
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const { nombre, descripcion, price } = req.body;
    const article = await Article.update(req.params.id, { nombre, descripcion, price });
    
    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.delete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Nuevo método para manejar imágenes de artículos
exports.manageArticleImages = async (req, res) => {
  try {
    const { action, images } = req.body;
    const articleId = req.params.id;

    if (!['add', 'replace', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Acción no válida' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    if (action === 'replace') {
      // Eliminar todas las imágenes existentes
      await db.query(
        'DELETE FROM images WHERE imageable_type = ? AND imageable_id = ?',
        ['Article', articleId]
      );
    }

    if (action !== 'remove' && images && images.length > 0) {
      // Añadir nuevas imágenes
      await Promise.all(
        images.map(image => 
          Image.create({ ...image, imageable_type: 'Article', imageable_id: articleId })
        )
      );
    }

    const updatedArticle = await Article.findById(articleId);
    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};