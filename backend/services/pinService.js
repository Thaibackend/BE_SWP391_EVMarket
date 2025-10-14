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
}

module.exports = new PinService();
