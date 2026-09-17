const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/admin-login.html";
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

async function cargarTodosLosComentarios() {
  const contenedor = document.getElementById("lista-comentarios-admin");

  try {
    const respuesta = await fetch("/api/comentarios/admin/todos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/admin-login.html";
      return;
    }

    const comentarios = await respuesta.json();

    if (comentarios.length === 0) {
      contenedor.innerHTML = "<p>Todavía no hay comentarios.</p>";
      return;
    }

    contenedor.innerHTML = comentarios
      .map(
        (c) => `
      <div class="comentario-admin">
        <p class="comentario-admin-post">
          En: <a href="/post.html?slug=${c.post_slug}" target="_blank">${escaparHtml(c.post_titulo)}</a>
        </p>
        <p class="comentario-autor">${escaparHtml(c.autor_nombre)}
          <span class="comentario-fecha">${new Date(c.creado_en).toLocaleString("es-MX", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </p>
        <p class="comentario-texto">${escaparHtml(c.contenido)}</p>
        <button class="btn-borrar-comentario" onclick="borrarComentarioAdmin(${c.id})">Borrar</button>
      </div>
    `,
      )
      .join("");

    // Marca este momento como "revisado"
    localStorage.setItem("comentariosRevisadosEn", new Date().toISOString());
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>Error al cargar los comentarios.</p>";
  }
}

async function borrarComentarioAdmin(id) {
  if (!confirm("¿Borrar este comentario?")) return;

  try {
    await fetch(`/api/comentarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    cargarTodosLosComentarios();
  } catch (err) {
    console.error(err);
    alert("Error al borrar el comentario");
  }
}

cargarTodosLosComentarios();
