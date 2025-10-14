const Car = require("../models/Car");

class CarService {
  async create(data) {
    return await Car.create(data);
  }

  async getAll(query) {
    return await Car.find(query).populate("brand");
  }

  async getById(id) {
    return await Car.findById(id).populate("brand");
  }

  async update(id, data) {
    return await Car.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Car.findByIdAndDelete(id);
  }
}

module.exports = new CarService();
