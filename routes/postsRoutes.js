const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const verificarTokenOpcional = require("../middleware/authOpcional");
const {
  obtenerPosts,
  obtenerPostPorSlug,
  crearPost,
  editarPost,
  darLike,
  borrarPost,
  obtenerPostsAdmin,
  obtenerPostPorIdAdmin,
} = require("../controllers/postsController");

router.get("/admin/todos", verificarToken, obtenerPostsAdmin);
router.get("/admin/:id", verificarToken, obtenerPostPorIdAdmin);
router.get("/", verificarTokenOpcional, obtenerPosts);
router.get("/:slug", verificarTokenOpcional, obtenerPostPorSlug);
router.post("/", verificarToken, crearPost);
router.post("/:id/like", darLike);
router.put("/:id", verificarToken, editarPost);
router.delete("/:id", verificarToken, borrarPost);

module.exports = router;
