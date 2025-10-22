const uploadService = require("../services/uploadService");

class UploadController {
  async uploadSingleImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await uploadService.uploadStreamToCloudinary(
        req.file.buffer,
        "my_app_images"
      );

      res.status(200).json({
        message: "Upload successful",
        data: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }

  async uploadMultipleImages(req, res) {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploads = req.files.map((file) =>
        uploadService.uploadStreamToCloudinary(file.buffer, "my_app_images")
      );
      const results = await Promise.all(uploads);

      res.status(200).json({
        message: "Multiple upload successful",
        count: results.length,
        data: results.map((r) => ({
          public_id: r.public_id,
          url: r.secure_url,
        })),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }

  async deleteImage(req, res) {
    try {
      const { public_id } = req.params;
      if (!public_id) {
        return res.status(400).json({ message: "public_id is required" });
      }

      const result = await uploadService.deleteImageFromCloudinary(public_id);
      res.status(200).json({ message: "Delete result", result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Delete failed", error: err.message });
    }
  }
}

module.exports = new UploadController();
