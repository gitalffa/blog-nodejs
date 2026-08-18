async function cargarPosts() {
  const contenedor = document.getElementById("lista-posts");

  try {
    const token = localStorage.getItem("token");

    const respuesta = await fetch("/api/posts", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los posts");
    }

    const posts = await respuesta.json();

    if (posts.length === 0) {
      contenedor.innerHTML = "<p>Todavía no hay posts publicados.</p>";
      return;
    }

    contenedor.innerHTML = posts
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
    contenedor.innerHTML = "<p>Ocurrió un error al cargar los posts.</p>";
  }
}

cargarPosts();
