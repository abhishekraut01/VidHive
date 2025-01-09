import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Use the Promises API for async file system operations

// Configure Cloudinary credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary.
 * @param {String} localFilePath - The path to the local file to upload.
 * @returns {Object|null} - Cloudinary response object on success, or null on failure.
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("No file path provided for Cloudinary upload.");
            return null;
        }

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Auto-detect the file type (image, video, etc.)
        });

        // console.log(`File successfully uploaded to Cloudinary: ${response.url}`);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        // Attempt to delete the local file if an error occurs
        try {
            await fs.unlink(localFilePath);
            console.log(`Local file deleted: ${localFilePath}`);
        } catch (unlinkError) {
            console.error(`Failed to delete local file: ${localFilePath}`, unlinkError);
        }

        return null;
    }
};

export default uploadOnCloudinary;
