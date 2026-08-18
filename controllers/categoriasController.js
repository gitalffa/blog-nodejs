const pool = require("../config/db");

// Listar todas las categorías (público, cualquiera puede verlas para filtrar el blog)
async function obtenerCategorias(req, res) {
  try {
    const [categorias] = await pool.query(
      "SELECT id, nombre, slug FROM categorias ORDER BY nombre ASC",
    );
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
}

// Crear una categoría nueva (protegido, solo tú)
async function crearCategoria(req, res) {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }

    const slug = nombre
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const [resultado] = await pool.query(
      "INSERT INTO categorias (nombre, slug) VALUES (?, ?)",
      [nombre.trim(), slug],
    );

    res
      .status(201)
      .json({ id: resultado.insertId, nombre: nombre.trim(), slug });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Ya existe una categoría con ese nombre" });
    }
    console.error(err);
    res.status(500).json({ error: "Error al crear la categoría" });
  }
}

// Borrar una categoría (protegido)
async function borrarCategoria(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categorias WHERE id = ?", [id]);
    res.json({ mensaje: "Categoría eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
}

module.exports = { obtenerCategorias, crearCategoria, borrarCategoria };
