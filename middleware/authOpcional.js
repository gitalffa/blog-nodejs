const jwt = require("jsonwebtoken");

function verificarTokenOpcional(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    req.usuario = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    req.usuario = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
  } catch (err) {
    req.usuario = null;
  }

  next();
}

module.exports = verificarTokenOpcional;
