const express = require("express");
const BrandController = require("../controllers/brandController");

const router = express.Router();

router.post("/", BrandController.create);
router.get("/", BrandController.getAll);
router.get("/:id", BrandController.getById);
router.put("/:id", BrandController.update);
router.delete("/:id", BrandController.delete);

module.exports = router;
