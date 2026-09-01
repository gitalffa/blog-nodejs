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

// Obtener los posts de una categoría específica, por su slug
async function obtenerPostsPorCategoria(req, res) {
  try {
    const { slug } = req.params;

    // Primero confirma que la categoría existe
    const [categorias] = await pool.query(
      "SELECT id, nombre FROM categorias WHERE slug = ?",
      [slug],
    );

    if (categorias.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const categoria = categorias[0];

    let query = `
      SELECT p.id, p.titulo, p.slug, p.extracto, p.imagen_portada, p.creado_en, p.visibilidad
      FROM posts p
      WHERE p.categoria_id = ? AND p.publicado = true
    `;

    if (!req.usuario) {
      query += " AND p.visibilidad = 'publico'";
    }

    query += " ORDER BY p.creado_en DESC";

    const [posts] = await pool.query(query, [categoria.id]);

    res.json({ categoria: categoria.nombre, posts });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error al obtener los posts de la categoría" });
  }
}

module.exports = {
  obtenerCategorias,
  crearCategoria,
  borrarCategoria,
  obtenerPostsPorCategoria,
};
