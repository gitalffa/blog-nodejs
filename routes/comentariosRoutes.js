const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const {
  obtenerComentarios,
  crearComentario,
  borrarComentario,
  obtenerTodosLosComentarios,
} = require("../controllers/comentariosController");

router.get("/admin/todos", verificarToken, obtenerTodosLosComentarios);
router.get("/post/:postId", obtenerComentarios);
router.post("/post/:postId", crearComentario);
router.delete("/:id", verificarToken, borrarComentario);

module.exports = router;
