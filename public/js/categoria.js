async function cargarPostsDeCategoria() {
  const tituloEl = document.getElementById("titulo-categoria");
  const contenedor = document.getElementById("lista-posts");

  const parametros = new URLSearchParams(window.location.search);
  const slug = parametros.get("slug");

  if (!slug) {
    tituloEl.textContent = "Categoría no especificada";
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const respuesta = await fetch(`/api/categorias/${slug}/posts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (respuesta.status === 404) {
      tituloEl.textContent = "Esta categoría no existe";
      return;
    }

    if (!respuesta.ok) {
      throw new Error("Error al cargar los posts");
    }

    const datos = await respuesta.json();

    tituloEl.textContent = `Posts de ${datos.categoria}`;

    if (datos.posts.length === 0) {
      contenedor.innerHTML = "<p>Todavía no hay posts en esta categoría.</p>";
      return;
    }

    contenedor.innerHTML = datos.posts
      .map(
        (post) => `
      <article class="post-card">
        ${post.imagen_portada ? `<img src="${post.imagen_portada}" alt="${post.titulo}">` : ""}
        <h2><a href="/post.html?slug=${post.slug}">${post.visibilidad === "privado" ? "🔒 " : ""}${post.titulo}</a></h2>
        <p class="post-fecha">${new Date(post.creado_en).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</p>
        <p>${post.extracto || ""}</p>
      </article>
    `,
      )
      .join("");
  } catch (err) {
    console.error(err);
    tituloEl.textContent = "Error al cargar la categoría";
  }
}

cargarPostsDeCategoria();
