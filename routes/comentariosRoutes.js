const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const {
  obtenerComentarios,
  crearComentario,
  borrarComentario,
} = require("../controllers/comentariosController");

router.get("/post/:postId", obtenerComentarios);
router.post("/post/:postId", crearComentario);
router.delete("/:id", verificarToken, borrarComentario);

module.exports = router;
