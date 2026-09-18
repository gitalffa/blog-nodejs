let postIdActual = null;

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
  if (
    !url ||
    !url.includes("res.cloudinary.com") ||
    !url.includes("/upload/")
  ) {
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
    cargarComentarios(post.id);
    configurarFormularioComentario(post.id);
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
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function construirArbolComentarios(comentarios) {
  const porId = {};
  comentarios.forEach((c) => {
    c.hijos = [];
    porId[c.id] = c;
  });

  const raiz = [];
  comentarios.forEach((c) => {
    if (c.parent_id && porId[c.parent_id]) {
      porId[c.parent_id].hijos.push(c);
    } else {
      raiz.push(c);
    }
  });

  return raiz;
}

function renderizarComentario(c, token) {
  const likesComentariosDados = JSON.parse(
    localStorage.getItem("likesComentariosDados") || "[]",
  );
  const yaLeDioLike = likesComentariosDados.includes(c.id);

  return `
    <div class="comentario ${c.es_admin ? "comentario-admin-reply" : ""}">
      <p class="comentario-autor">
        ${escaparHtml(c.autor_nombre)}
        ${c.es_admin ? '<span class="badge-admin">Admin</span>' : ""}
        <span class="comentario-fecha">${new Date(c.creado_en).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}</span>
      </p>
      <p class="comentario-texto">${escaparHtml(c.contenido)}</p>
      <div class="comentario-acciones">
        <button class="btn-like-comentario" data-id="${c.id}" ${yaLeDioLike ? "disabled" : ""} onclick="darLikeComentario(${c.id})">
          ${yaLeDioLike ? "❤️" : "🤍"} <span id="likes-comentario-${c.id}">${c.likes}</span>
        </button>
        ${token ? `<button class="btn-responder-comentario" onclick="mostrarFormularioRespuesta(${c.id})">Responder</button>` : ""}
        ${token ? `<button class="btn-borrar-comentario" onclick="borrarComentario(${c.id}, postIdActual)">Borrar</button>` : ""}
      </div>
      <div id="form-respuesta-${c.id}" class="form-respuesta oculto"></div>
      ${c.hijos.length > 0 ? `<div class="respuestas">${c.hijos.map((hijo) => renderizarComentario(hijo, token)).join("")}</div>` : ""}
    </div>
  `;
}

async function cargarComentarios(postId) {
  postIdActual = postId;
  const contenedor = document.getElementById("lista-comentarios");

  try {
    const respuesta = await fetch(`/api/comentarios/post/${postId}`);
    const comentarios = await respuesta.json();

    if (comentarios.length === 0) {
      contenedor.innerHTML = "<p>Sé el primero en comentar.</p>";
      return;
    }

    const token = localStorage.getItem("token");
    const arbol = construirArbolComentarios(comentarios);
    contenedor.innerHTML = arbol
      .map((c) => renderizarComentario(c, token))
      .join("");
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>Error al cargar los comentarios.</p>";
  }
}

async function borrarComentario(id, postId) {
  const token = localStorage.getItem("token");
  if (!confirm("¿Borrar este comentario?")) return;

  try {
    await fetch(`/api/comentarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    cargarComentarios(postId);
  } catch (err) {
    console.error(err);
    alert("Error al borrar el comentario");
  }
}

function configurarFormularioComentario(postId) {
  const form = document.getElementById("form-comentario");
  const mensaje = document.getElementById("mensaje-comentario");

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensaje.textContent = "";

    const autor_nombre = document.getElementById("autor_nombre").value;
    const contenido = document.getElementById("contenido_comentario").value;

    try {
      const respuesta = await fetch(`/api/comentarios/post/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autor_nombre, contenido }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        mensaje.textContent = datos.error || "Error al enviar el comentario";
        return;
      }

      form.reset();
      cargarComentarios(postId);
    } catch (err) {
      console.error(err);
      mensaje.textContent = "No se pudo conectar con el servidor";
    }
  });
}

async function darLikeComentario(id) {
  const likesComentariosDados = JSON.parse(
    localStorage.getItem("likesComentariosDados") || "[]",
  );

  if (likesComentariosDados.includes(id)) return;

  try {
    const respuesta = await fetch(`/api/comentarios/${id}/like`, {
      method: "POST",
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) return;

    const boton = document.querySelector(
      `.btn-like-comentario[data-id="${id}"]`,
    );
    if (boton) {
      boton.innerHTML = `❤️ <span id="likes-comentario-${id}">${datos.likes}</span>`;
      boton.disabled = true;
    }

    likesComentariosDados.push(id);
    localStorage.setItem(
      "likesComentariosDados",
      JSON.stringify(likesComentariosDados),
    );
  } catch (err) {
    console.error(err);
  }
}

function mostrarFormularioRespuesta(id) {
  const contenedor = document.getElementById(`form-respuesta-${id}`);
  if (!contenedor) return;

  if (contenedor.classList.contains("oculto")) {
    contenedor.classList.remove("oculto");
    contenedor.innerHTML = `
      <textarea id="texto-respuesta-${id}" rows="2" maxlength="1000" placeholder="Responder como admin..."></textarea>
      <button onclick="enviarRespuesta(${id})">Enviar</button>
    `;
  } else {
    contenedor.classList.add("oculto");
    contenedor.innerHTML = "";
  }
}

async function enviarRespuesta(id) {
  const token = localStorage.getItem("token");
  const textarea = document.getElementById(`texto-respuesta-${id}`);
  const contenido = textarea.value.trim();

  if (!contenido) return;

  try {
    const respuesta = await fetch(`/api/comentarios/${id}/responder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contenido }),
    });

    if (!respuesta.ok) {
      alert("Error al enviar la respuesta");
      return;
    }

    cargarComentarios(postIdActual);
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el servidor");
  }
}
