const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'marketplace',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' }
        ]
    }
});

// Check if Cloudinary is in demo mode
const isDemoMode = process.env.CLOUDINARY_API_KEY === 'demo';

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
        }
    }
});

// Middleware for single image upload
const uploadSingle = (fieldName = 'image') => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    };
};

// Middleware for multiple images upload
const uploadMultiple = (fieldName = 'images', maxCount = 10) => {
    return (req, res, next) => {
        // In demo mode, still parse form data but skip file upload
        if (isDemoMode) {
            // Use multer memory storage for demo mode to parse form data
            const multer = require('multer');
            const memoryStorage = multer.memoryStorage();
            const memoryUpload = multer({ storage: memoryStorage });
            
            memoryUpload.array(fieldName, maxCount)(req, res, (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                req.files = []; // Empty files array for demo
                next();
            });
        } else {
            upload.array(fieldName, maxCount)(req, res, (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
                next();
            });
        }
    };
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
};

// Helper function to delete multiple images
const deleteImages = async (publicIds) => {
    try {
        const results = await Promise.all(
            publicIds.map(publicId => deleteImage(publicId))
        );
        return results.every(result => result);
    } catch (error) {
        console.error('Error deleting images:', error);
        return false;
    }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    return `marketplace/${publicId}`;
};

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    deleteImage,
    deleteImages,
    extractPublicIdFromUrl
};
