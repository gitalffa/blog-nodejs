const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const {
  obtenerComentarios,
  crearComentario,
  borrarComentario,
  obtenerTodosLosComentarios,
  crearRespuesta,
  darLikeComentario,
} = require("../controllers/comentariosController");

router.get("/admin/todos", verificarToken, obtenerTodosLosComentarios);
router.get("/post/:postId", obtenerComentarios);
router.post("/post/:postId", crearComentario);
router.post("/:id/responder", verificarToken, crearRespuesta);
router.post("/:id/like", darLikeComentario);
router.delete("/:id", verificarToken, borrarComentario);

module.exports = router;
