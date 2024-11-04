const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createCloudinaryStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `instagram/${folderName}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
        },
    });
};

const uploadMultiple = (folderName) => {
    const storageMultiple = createCloudinaryStorage(folderName);
    return multer({ storage: storageMultiple }).fields([
        { name: 'images', maxCount: 10 },
    ]);
};

const uploadSingle = (folderName) => {
    const storageSingle = createCloudinaryStorage(folderName);
    return multer({ storage: storageSingle }).single('avatar');
};

module.exports = { uploadMultiple, uploadSingle };
