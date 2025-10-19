const userService = require("../services/userService");

class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async banToggle(req, res) {
    try {
      const updated = await userService.toggleBanUser(req.params.id);
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({
        message: updated.blocked ? "User banned" : "User unbanned",
        user: updated,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new UserController();
