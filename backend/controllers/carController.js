const carService = require("../services/carService");

class CarController {
  async create(req, res) {
    try {
      const car = await carService.create(req.body);
      res.status(201).json(car);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const cars = await carService.getAll(req.query);
      res.json(cars);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const car = await carService.getById(req.params.id);
      if (!car) return res.status(404).json({ message: "Car not found" });
      res.json(car);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const car = await carService.update(req.params.id, req.body);
      if (!car) return res.status(404).json({ message: "Car not found" });
      res.json(car);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const car = await carService.delete(req.params.id);
      if (!car) return res.status(404).json({ message: "Car not found" });
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new CarController();
