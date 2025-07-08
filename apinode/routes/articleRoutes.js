const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// CRUD Routes
router.get('/', articleController.getAllArticles);
router.post('/', articleController.createArticle);
router.get('/:id', articleController.getArticleById);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

// Ruta para manejar imágenes de artículos
router.post('/:id/images', articleController.manageArticleImages);

module.exports = router;