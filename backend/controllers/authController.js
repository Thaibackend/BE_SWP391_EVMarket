const authService = require("../services/authService");

class AuthController {
  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ message: "Register success", user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { user, token } = await authService.login(req.body);
      res.json({ message: "Login success", token, user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();
