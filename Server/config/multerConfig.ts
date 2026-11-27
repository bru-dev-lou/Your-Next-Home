import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        cb(null, file.mimetype.startsWith("image/"));
    },
});

export default upload;