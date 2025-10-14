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
}

module.exports = new PinController();
