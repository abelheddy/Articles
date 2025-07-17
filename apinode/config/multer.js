const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `img-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPEG, PNG o GIF'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Máximo 5 archivos
  },
  fileFilter: fileFilter
});

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let errorMessage = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'El tamaño del archivo excede el límite de 5MB';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      errorMessage = 'Se excedió el máximo de 5 archivos';
    }
    return res.status(400).json({ 
      status: 'error',
      code: err.code || 'UPLOAD_ERROR',
      message: errorMessage
    });
  } else if (err) {
    return res.status(400).json({ 
      status: 'error',
      message: err.message 
    });
  }
  next();
};

module.exports = { upload, handleUploadErrors };