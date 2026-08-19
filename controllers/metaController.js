const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

async function renderizarPost(req, res) {
  try {
    const { slug } = req.query;

    const rutaHtml = path.join(__dirname, "../public/post.html");
    let html = fs.readFileSync(rutaHtml, "utf-8");

    if (!slug) {
      return res.send(html);
    }

    const [posts] = await pool.query(
      "SELECT titulo, extracto, imagen_portada FROM posts WHERE slug = ? AND publicado = true AND visibilidad = 'publico'",
      [slug],
    );

    if (posts.length === 0) {
      return res.send(html);
    }

    const post = posts[0];
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const metaTags = `
      <meta property="og:title" content="${post.titulo}">
      <meta property="og:description" content="${post.extracto || "Lee esta publicación en Mi Blog"}">
      <meta property="og:image" content="${post.imagen_portada || ""}">
      <meta property="og:url" content="${url}">
      <meta property="og:type" content="article">
    `;

    html = html.replace("</head>", `${metaTags}</head>`);

    res.send(html);
  } catch (err) {
    console.error(err);
    res.sendFile(path.join(__dirname, "../public/post.html"));
  }
}

module.exports = { renderizarPost };
