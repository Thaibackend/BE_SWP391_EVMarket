const Pin = require("../models/Pin");

class PinService {
  async create(data) {
    return await Pin.create(data);
  }
  async getAll(query) {
    return await Pin.find(query).populate("brand owner");
  }

  async getById(id) {
    return await Pin.findById(id).populate("brand owner");
  }

  async update(id, data) {
    return await Pin.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Pin.findByIdAndDelete(id);
  }
}

module.exports = new PinService();
