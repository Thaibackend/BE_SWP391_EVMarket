const pinService = require("../services/pinService");

class PinController {
  async create(req, res) {
    try {
      const pin = await pinService.create(req.body);
      res.status(201).json(pin);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
  async getAll(req, res) {
    try {
      const pins = await pinService.getAll(req.query);
      res.json(pins);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const pin = await pinService.getById(req.params.id);
      if (!pin) return res.status(404).json({ message: "Pin not found" });
      res.json(pin);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new PinController();
