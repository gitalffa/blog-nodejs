function fechaLarga(fecha) {
  return new Date(fecha).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function iconoCandado() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>`;
}

function iconoCorazon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>`;
}

function recorteCloudinary(url, ancho, alto) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  return url.replace("/upload/", `/upload/c_fill,g_auto,w_${ancho},h_${alto}/`);
}

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

    document.title = `${post.titulo} - El Blog de Alffa`;

    const portada = post.imagen_portada
      ? recorteCloudinary(post.imagen_portada, 1600, 700)
      : null;

    contenedor.innerHTML = `
  <div class="post-banner ${portada ? "" : "cover-fallback"}" style="${
    portada ? `background-image: url('${portada}');` : ""
  }">
    <span class="cover-mark cover-mark-lg">A</span>
  </div>
  <article class="post-header">
    ${post.categoria ? `<span class="tag">${post.categoria}</span>` : ""}
    <h1>${post.visibilidad === "privado" ? iconoCandado() + " " : ""}${post.titulo}</h1>
    <div class="post-meta">
      <span>${fechaLarga(post.creado_en)}</span>
    </div>
  </article>
  <article class="post-cuerpo-wrap">
    <div class="post-cuerpo">${post.contenido}</div>
    <button id="btn-like" class="btn-like">${iconoCorazon()} Me gusta · <span id="contador-likes">${post.likes}</span></button>
  </article>
`;

    configurarBotonLike(post.id);
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>Ocurrió un error al cargar el post.</p>";
  }
}

cargarPost();

function configurarBotonLike(postId) {
  const boton = document.getElementById("btn-like");
  const contador = document.getElementById("contador-likes");
  const likesDados = JSON.parse(localStorage.getItem("likesDados") || "[]");

  if (likesDados.includes(postId)) {
    boton.classList.add("ya-le-diste-like");
    boton.disabled = true;
  }

  boton.addEventListener("click", async () => {
    boton.disabled = true;

    try {
      const respuesta = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        boton.disabled = false;
        return;
      }

      contador.textContent = datos.likes;
      boton.classList.add("ya-le-diste-like");

      likesDados.push(postId);
      localStorage.setItem("likesDados", JSON.stringify(likesDados));
    } catch (err) {
      console.error(err);
      boton.disabled = false;
    }
  });
}
