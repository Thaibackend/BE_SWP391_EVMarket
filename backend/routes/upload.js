const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/single", upload.single("file"), (req, res) =>
  uploadController.uploadSingleImage(req, res)
);

router.post("/multiple", upload.array("files"), (req, res) =>
  uploadController.uploadMultipleImages(req, res)
);

router.delete("/:public_id", (req, res) =>
  uploadController.deleteImage(req, res)
);

module.exports = router;
