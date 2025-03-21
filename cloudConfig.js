const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');  // Import the path module

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormats: ['png', 'jpg', 'jpeg'], // top-level option for allowed formats
  params: async (req, file) => {
    // Use path.parse to extract only the base name (without extension)
    const name = path.parse(file.originalname).name;
    return {
      folder: 'wanderlust_DEV',
      public_id: `${Date.now()}-${name}`, // Using the base name only
      format: file.mimetype.split('/')[1],  // Cloudinary will append the extension based on this format
    };
  }
});

module.exports = {
    cloudinary,
    storage,
}