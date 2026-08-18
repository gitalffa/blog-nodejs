const token = localStorage.getItem("token");

// Si no hay token, no tiene caso estar aquí
if (!token) {
  window.location.href = "/admin-login.html";
}

document.getElementById("nombre-usuario").textContent =
  localStorage.getItem("nombre") || "";

document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
  window.location.href = "/admin-login.html";
});

async function cargarPostsAdmin() {
  const cuerpoTabla = document.getElementById("cuerpo-tabla");

  try {
    const respuesta = await fetch("/api/posts/admin/todos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
      // Token inválido o expirado, regresa al login
      localStorage.removeItem("token");
      window.location.href = "/admin-login.html";
      return;
    }

    const posts = await respuesta.json();

    if (posts.length === 0) {
      cuerpoTabla.innerHTML =
        '<tr><td colspan="4">Todavía no hay posts.</td></tr>';
      return;
    }

    cuerpoTabla.innerHTML = posts
      .map(
        (post) => `
  <tr>
    <td>${post.titulo}</td>
    <td class="${post.publicado ? "estado-publicado" : "estado-borrador"}">
      ${post.publicado ? "Publicado" : "Borrador"}
    </td>
    <td>${post.visibilidad === "privado" ? "🔒 Privado" : "🌐 Público"}</td>
    <td>${new Date(post.creado_en).toLocaleDateString("es-MX")}</td>
    <td>
      <button onclick="location.href='/admin-post.html?id=${post.id}'">Editar</button>
      <button onclick="borrarPost(${post.id})">Borrar</button>
    </td>
  </tr>
`,
      )
      .join("");
  } catch (err) {
    console.error(err);
    cuerpoTabla.innerHTML =
      '<tr><td colspan="4">Error al cargar los posts.</td></tr>';
  }
}

async function borrarPost(id) {
  if (!confirm("¿Seguro que quieres borrar este post?")) return;

  try {
    const respuesta = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!respuesta.ok) {
      alert("No se pudo borrar el post");
      return;
    }

    cargarPostsAdmin();
  } catch (err) {
    console.error(err);
    alert("Error al borrar el post");
  }
}

cargarPostsAdmin();
