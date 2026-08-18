const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const {
  obtenerCategorias,
  crearCategoria,
  borrarCategoria,
} = require("../controllers/categoriasController");

router.get("/", obtenerCategorias);
router.post("/", verificarToken, crearCategoria);
router.delete("/:id", verificarToken, borrarCategoria);

module.exports = router;
