const pool = require("../config/db");

// Listar los comentarios de un post
async function obtenerComentarios(req, res) {
  try {
    const { postId } = req.params;
    const [comentarios] = await pool.query(
      "SELECT id, autor_nombre, contenido, creado_en FROM comentarios WHERE post_id = ? ORDER BY creado_en ASC",
      [postId],
    );
    res.json(comentarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los comentarios" });
  }
}

// Crear un comentario nuevo (público, sin login)
async function crearComentario(req, res) {
  try {
    const { postId } = req.params;
    const { autor_nombre, contenido } = req.body;

    if (
      !autor_nombre ||
      !autor_nombre.trim() ||
      !contenido ||
      !contenido.trim()
    ) {
      return res
        .status(400)
        .json({ error: "Nombre y comentario son requeridos" });
    }

    if (autor_nombre.length > 100) {
      return res.status(400).json({ error: "El nombre es demasiado largo" });
    }

    if (contenido.length > 1000) {
      return res.status(400).json({
        error: "El comentario es demasiado largo (máximo 1000 caracteres)",
      });
    }

    // Confirma que el post existe y está publicado
    const [posts] = await pool.query(
      "SELECT id FROM posts WHERE id = ? AND publicado = true",
      [postId],
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const [resultado] = await pool.query(
      "INSERT INTO comentarios (post_id, autor_nombre, contenido) VALUES (?, ?, ?)",
      [postId, autor_nombre.trim(), contenido.trim()],
    );

    res.status(201).json({
      id: resultado.insertId,
      autor_nombre: autor_nombre.trim(),
      contenido: contenido.trim(),
      creado_en: new Date(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el comentario" });
  }
}

// Borrar un comentario (protegido, solo admin)
async function borrarComentario(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM comentarios WHERE id = ?", [id]);
    res.json({ mensaje: "Comentario eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar el comentario" });
  }
}

// Listar todos los comentarios de todos los posts (protegido, solo admin)
async function obtenerTodosLosComentarios(req, res) {
  try {
    const [comentarios] = await pool.query(`
      SELECT c.id, c.autor_nombre, c.contenido, c.creado_en, c.post_id,
             p.titulo AS post_titulo, p.slug AS post_slug
      FROM comentarios c
      JOIN posts p ON c.post_id = p.id
      ORDER BY c.creado_en DESC
    `);
    res.json(comentarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los comentarios" });
  }
}

module.exports = {
  obtenerComentarios,
  crearComentario,
  borrarComentario,
  obtenerTodosLosComentarios,
};
