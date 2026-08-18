async function cargarPost() {
  const contenedor = document.getElementById("post-contenido");

  const parametros = new URLSearchParams(window.location.search);
  const slug = parametros.get("slug");

  if (!slug) {
    contenedor.innerHTML = "<p>Post no especificado.</p>";
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const respuesta = await fetch(`/api/posts/${slug}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (respuesta.status === 404) {
      contenedor.innerHTML = "<p>Este post no existe.</p>";
      return;
    }

    if (!respuesta.ok) {
      throw new Error("Error al cargar el post");
    }

    const post = await respuesta.json();

    document.title = `${post.titulo} - Mi Blog`;

    document.title = `${post.titulo} - Mi Blog`;

    contenedor.innerHTML = `
  <article>
    ${post.imagen_portada ? `<img src="${post.imagen_portada}" alt="${post.titulo}">` : ""}
    <h2>${post.visibilidad === "privado" ? "🔒 " : ""}${post.titulo}</h2>
        <p class="post-fecha">
          ${new Date(post.creado_en).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
          ${post.categoria ? ` · ${post.categoria}` : ""}
        </p>
        <div class="post-cuerpo">${post.contenido}</div>
      </article>
    `;
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>Ocurrió un error al cargar el post.</p>";
  }
}

cargarPost();
