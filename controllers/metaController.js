const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

function imagenParaCompartir(url) {
  if (
    !url ||
    !url.includes("res.cloudinary.com") ||
    !url.includes("/upload/")
  ) {
    return url;
  }
  return url.replace(
    "/upload/",
    "/upload/w_1200,h_630,c_fill,g_auto,q_auto,f_jpg/",
  );
}

function escaparHtml(texto) {
  if (!texto) return "";
  return texto
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, " ");
}

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
    const url = `https://${req.get("host")}${req.originalUrl}`;

    const metaTags = `
  <meta property="og:title" content="${escaparHtml(post.titulo)}">
  <meta property="og:description" content="${escaparHtml(post.extracto || "Lee esta publicación en Mi Blog")}">
  <meta property="og:image" content="${escaparHtml(imagenParaCompartir(post.imagen_portada) || "")}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:url" content="${escaparHtml(url)}">
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
