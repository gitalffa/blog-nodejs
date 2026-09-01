function fechaLarga(fecha) {
  return new Date(fecha).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function recorteCloudinary(url, ancho, alto) {
  if (
    !url ||
    !url.includes("res.cloudinary.com") ||
    !url.includes("/upload/")
  ) {
    return url;
  }
  return url.replace("/upload/", `/upload/c_fill,g_auto,w_${ancho},h_${alto}/`);
}

function estiloPortada(post, ancho, alto) {
  return post.imagen_portada
    ? `background-image: url('${recorteCloudinary(post.imagen_portada, ancho, alto)}');`
    : "";
}

function iconoCandado() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>`;
}

function iconoCorazon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>`;
}

function tarjetaDestacada(post) {
  return `
  <div class="featured">
    <div class="featured-cover ${post.imagen_portada ? "" : "cover-fallback"}" style="${estiloPortada(post, 1000, 640)}">
      <span class="cover-mark">A</span>
    </div>
    <div class="featured-body">
      <span class="featured-label">★ Destacado${post.categoria ? ` · <a href="/categoria.html?slug=${post.categoria_slug}">${post.categoria}</a>` : ""}</span>
      <h2><a href="/post.html?slug=${post.slug}">${post.visibilidad === "privado" ? iconoCandado() + " " : ""}${post.titulo}</a></h2>
      <p class="featured-excerpt">${post.extracto || ""}</p>
      <div class="featured-meta">
        <span>${fechaLarga(post.creado_en)}</span>
        <span class="meta-likes">${iconoCorazon()} ${post.likes}</span>
      </div>
    </div>
  </div>`;
}

function tarjetaPost(post) {
  return `
  <article class="post-card">
    <div class="post-cover ${post.imagen_portada ? "" : "cover-fallback"}" style="${estiloPortada(post, 900, 500)}">
      <span class="cover-mark">A</span>
    </div>
    <div class="post-card-tags">
      ${post.categoria ? `<span class="tag"><a href="/categoria.html?slug=${post.categoria_slug}">${post.categoria}</a></span>` : ""}
      ${
        post.visibilidad === "privado"
          ? `<span class="tag-private">${iconoCandado()} Privado</span>`
          : ""
      }
    </div>
    <h4><a href="/post.html?slug=${post.slug}">${post.titulo}</a></h4>
    <p>${post.extracto || ""}</p>
    <span class="post-fecha">${fechaLarga(post.creado_en)}</span>
  </article>`;
}

async function cargarPosts() {
  const destacado = document.getElementById("post-destacado");
  const grid = document.getElementById("lista-posts");

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
      destacado.innerHTML = "";
      grid.innerHTML = "<p>Todavía no hay posts publicados.</p>";
      return;
    }

    const [primero, ...resto] = posts;
    destacado.innerHTML = tarjetaDestacada(primero);
    grid.innerHTML = resto.map(tarjetaPost).join("");
  } catch (err) {
    console.error(err);
    destacado.innerHTML = "";
    grid.innerHTML = "<p>Ocurrió un error al cargar los posts.</p>";
  }
}

cargarPosts();
