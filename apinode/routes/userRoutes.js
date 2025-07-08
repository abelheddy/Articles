const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/register', userController.register);

// Rutas protegidas (requieren autenticación)
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.put('/:id/password', authMiddleware, userController.updatePassword);
router.delete('/:id', authMiddleware, userController.deleteUser);

// Ruta para imágenes de usuario
router.post('/:id/image', authMiddleware, userController.uploadUserImage);

module.exports = router;