const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

class UploadService {
  async uploadStreamToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

  async deleteImageFromCloudinary(publicId) {
    return await cloudinary.uploader.destroy(publicId);
  }
}

module.exports = new UploadService();
