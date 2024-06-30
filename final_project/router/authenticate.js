// auth_middleware.js
const users = require("./auth_users.js").users;

const authenticate = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  req.user = user; // Attach user object to request
  next();
};

module.exports = authenticate;
