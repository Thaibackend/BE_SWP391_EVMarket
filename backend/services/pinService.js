const Pin = require("../models/Pin");

class PinService {
  async create(data) {
    return await Pin.create(data);
  }
}

module.exports = new PinService();
