const express = require('express');
const router = express.Router();
const { upload, handleUploadErrors } = require('../config/multer');
const articleController = require('../controllers/articleController');
const { param } = require('express-validator');

router.post(
  '/:id/upload-images',
  [
    param('id').isInt({ gt: 0 }).withMessage('ID debe ser un entero positivo')
  ],
  (req, res, next) => {
    // Middleware de diagnóstico
    console.log('=== INICIO DE SOLICITUD ===');
    console.log('Headers recibidos:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Contenido recibido:', req.body);
    next();
  },
  upload.array('images', 5),
  (req, res, next) => {
    // Verificar archivos recibidos
    console.log('Archivos recibidos:', req.files ? req.files.map(f => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size
    })) : 'No hay archivos');
    next();
  },
  handleUploadErrors,
  articleController.uploadArticleImages
);

// Otras rutas...
router.get('/', articleController.getAllArticles);
router.post('/', articleController.createArticle);
router.get('/:id', articleController.getArticleById);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);
router.post('/:id/images', articleController.manageArticleImages);

module.exports = router;