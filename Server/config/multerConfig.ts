import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 10 * 1024 * 1024,
        files: 10, 
    }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } 
        else {
            cb(null, false); // skip non-images
        }
    },
});

export default upload;