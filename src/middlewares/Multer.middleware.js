import multer from 'multer';
import path from 'path';

// Configure storage engine for multer
const storage = multer.diskStorage({
    // Define the destination folder for uploaded files
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'temp'); // Ensure this folder exists
        cb(null, uploadPath);
    },
    // Define the file naming convention
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname); // Get file extension
        const baseName = path.basename(file.originalname, fileExtension); // Get filename without extension
        cb(null, `${baseName}-${timestamp}${fileExtension}`);
    },
});

// Initialize multer with the configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10, // Limit file size to 10 MB
    },
});

export default upload