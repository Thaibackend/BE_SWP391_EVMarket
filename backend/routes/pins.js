const express = require("express");
const router = express.Router();
const pinController = require("../controllers/pinController");

router.post("/", pinController.create);
router.get("/", pinController.getAll);
router.get("/:id", pinController.getById);
router.put("/:id", pinController.update);
router.delete("/:id", pinController.delete);

module.exports = router;
