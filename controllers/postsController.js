const pool = require("../config/db");

// Obtener todos los posts publicados
async function obtenerPosts(req, res) {
  try {
    let query = `
      SELECT p.id, p.titulo, p.slug, p.extracto, p.imagen_portada, p.creado_en, p.visibilidad, p.likes, c.nombre AS categoria
      FROM posts p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.publicado = true
    `;

    if (!req.usuario) {
      query += " AND p.visibilidad = 'publico'";
    }

    query += " ORDER BY p.creado_en DESC";

    const [posts] = await pool.query(query);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los posts" });
  }
}

// Obtener un post por su slug
async function obtenerPostPorSlug(req, res) {
  try {
    const { slug } = req.params;

    let query =
      "SELECT p.id, p.titulo, p.slug, p.contenido, p.imagen_portada, p.creado_en, p.visibilidad, p.likes, c.nombre AS categoria FROM posts p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.slug = ? AND p.publicado = true";

    if (!req.usuario) {
      query += " AND p.visibilidad = 'publico'";
    }

    const [posts] = await pool.query(query, [slug]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el post" });
  }
}

// Crear un post nuevo (protegido)
async function crearPost(req, res) {
  try {
    const {
      titulo,
      slug,
      extracto,
      contenido,
      imagen_portada,
      categoria_id,
      publicado,
      visibilidad,
    } = req.body;

    if (!titulo || !slug || !contenido) {
      return res
        .status(400)
        .json({ error: "Título, slug y contenido son requeridos" });
    }

    const [resultado] = await pool.query(
      "INSERT INTO posts (titulo, slug, extracto, contenido, imagen_portada, usuario_id, categoria_id, publicado, visibilidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        titulo,
        slug,
        extracto,
        contenido,
        imagen_portada,
        req.usuario.id,
        categoria_id || null,
        publicado || false,
        visibilidad || "publico",
      ],
    );

    res.status(201).json({ id: resultado.insertId, mensaje: "Post creado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el post" });
  }
}

// Editar un post existente (protegido)
async function editarPost(req, res) {
  try {
    const { id } = req.params;
    const {
      titulo,
      slug,
      extracto,
      contenido,
      imagen_portada,
      categoria_id,
      publicado,
      visibilidad,
    } = req.body;

    await pool.query(
      "UPDATE posts SET titulo = ?, slug = ?, extracto = ?, contenido = ?, imagen_portada = ?, categoria_id = ?, publicado = ?, visibilidad = ? WHERE id = ?",
      [
        titulo,
        slug,
        extracto,
        contenido,
        imagen_portada,
        categoria_id || null,
        publicado || false,
        visibilidad || "publico",
        id,
      ],
    );

    res.json({ mensaje: "Post actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el post" });
  }
}

// Borrar un post (protegido)
async function borrarPost(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM posts WHERE id = ?", [id]);
    res.json({ mensaje: "Post eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar el post" });
  }
}

// Obtener un post completo por ID, sin importar si está publicado (solo admin)
async function obtenerPostsAdmin(req, res) {
  try {
    const [posts] = await pool.query(
      "SELECT id, titulo, slug, publicado, visibilidad, creado_en FROM posts ORDER BY creado_en DESC",
    );
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los posts" });
  }
}

// Obtener un post completo por ID, sin importar si está publicado (solo admin)
async function obtenerPostPorIdAdmin(req, res) {
  try {
    const { id } = req.params;
    const [posts] = await pool.query("SELECT * FROM posts WHERE id = ?", [id]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el post" });
  }
}

// Dar like a un post (público, sin autenticación)
async function darLike(req, res) {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = ? AND publicado = true",
      [id],
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    const [posts] = await pool.query("SELECT likes FROM posts WHERE id = ?", [
      id,
    ]);

    res.json({ likes: posts[0].likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al dar like" });
  }
}

module.exports = {
  obtenerPosts,
  obtenerPostPorSlug,
  crearPost,
  editarPost,
  borrarPost,
  obtenerPostsAdmin,
  obtenerPostPorIdAdmin,
  darLike,
};
