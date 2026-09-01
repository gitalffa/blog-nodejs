const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const verificarTokenOpcional = require("../middleware/authOpcional");
const {
  obtenerCategorias,
  crearCategoria,
  borrarCategoria,
  obtenerPostsPorCategoria,
} = require("../controllers/categoriasController");

router.get("/", obtenerCategorias);
router.get("/:slug/posts", verificarTokenOpcional, obtenerPostsPorCategoria);
router.post("/", verificarToken, crearCategoria);
router.delete("/:id", verificarToken, borrarCategoria);

module.exports = router;
