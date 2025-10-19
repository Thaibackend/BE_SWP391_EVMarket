const User = require("../models/User");

class UserService {
  async getAllUsers() {
    return await User.find().populate("vehicles transactionHistory");
  }

  async getUserById(id) {
    return await User.findById(id).populate("vehicles transactionHistory");
  }

  async updateUser(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async toggleBanUser(id) {
    const user = await User.findById(id);
    if (!user) return null;
    user.blocked = !user.blocked;
    await user.save();
    return user;
  }
}

module.exports = new UserService();
