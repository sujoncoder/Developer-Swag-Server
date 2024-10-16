import { v2 as cloudinary } from 'cloudinary';

import { cloudinaryApi, cloudinaryName, cloudinarySecretKey } from '../secret.js';


// CONFIGURATION
cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: cloudinaryApi,
    api_secret: cloudinarySecretKey
});

export default cloudinary;