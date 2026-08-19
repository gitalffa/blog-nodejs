const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para que Express entienda JSON en el body de las peticiones
app.use(express.json());

const { renderizarPost } = require("./controllers/metaController");
app.get("/post.html", renderizarPost);

app.use(express.static("public"));

// Sirve los archivos estáticos del frontend (HTML, CSS, JS del navegador)
app.use(express.static("public"));

const postsRoutes = require("./routes/postsRoutes");
app.use("/api/posts", postsRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const configRoutes = require("./routes/configRoutes");
app.use("/api/config", configRoutes);

// Ruta de prueba
app.get("/api/ping", (req, res) => {
  res.json({ mensaje: "El servidor está funcionando" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const categoriasRoutes = require("./routes/categoriasRoutes");
app.use("/api/categorias", categoriasRoutes);
