const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = usuarios[0];
    const passwordValido = await bcrypt.compare(
      password,
      usuario.password_hash,
    );

    if (!passwordValido) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({ token, nombre: usuario.nombre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

module.exports = { login };
