const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/admin-login.html";
}

const parametros = new URLSearchParams(window.location.search);
const postId = parametros.get("id");
const esEdicion = postId !== null;

const form = document.getElementById("form-post");

let editorTinyMCE = null;

const editorListoPromise = tinymce
  .init({
    selector: "#editor-contenido",
    height: 400,
    menubar: false,
    plugins: "lists link image table code",
    toolbar:
      "undo redo | blocks | bold italic underline | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist | blockquote link image table | code",
    content_style:
      "body { font-family: system-ui, sans-serif; font-size: 1rem; }",
  })
  .then((editores) => {
    editorTinyMCE = editores[0];
  });
const mensaje = document.getElementById("mensaje");

let cloudinaryConfig = null;
const categoriasListasPromise = cargarCategoriasEnSelect();

// Traer la configuración de Cloudinary al cargar la página
fetch("/api/config/cloudinary")
  .then((res) => res.json())
  .then((config) => {
    cloudinaryConfig = config;
  });

document
  .getElementById("imagen_portada_archivo")
  .addEventListener("change", async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const mensajeSubida = document.getElementById("mensaje-subida");
    mensajeSubida.textContent = "Subiendo imagen...";

    if (!cloudinaryConfig) {
      mensajeSubida.textContent =
        "Configuración de Cloudinary no disponible aún, intenta de nuevo.";
      return;
    }

    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);

    try {
      const respuesta = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        mensajeSubida.textContent = "Error al subir la imagen";
        console.error(datos);
        return;
      }

      document.getElementById("imagen_portada").value = datos.secure_url;

      const preview = document.getElementById("preview-imagen");
      preview.src = datos.secure_url;
      preview.style.display = "block";

      mensajeSubida.textContent = "Imagen subida correctamente";
    } catch (err) {
      console.error(err);
      mensajeSubida.textContent = "Error al conectar con Cloudinary";
    }
  });

// Generar el slug automáticamente a partir del título (solo si el usuario no lo ha tocado a mano)
let slugTocadoManualmente = false;

document.getElementById("slug").addEventListener("input", () => {
  slugTocadoManualmente = true;
});

document.getElementById("titulo").addEventListener("input", (evento) => {
  if (slugTocadoManualmente) return;

  const slugGenerado = evento.target.value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9\s-]/g, "") // quita caracteres raros
    .replace(/\s+/g, "-"); // espacios a guiones

  document.getElementById("slug").value = slugGenerado;
});

// Si estamos editando, cargar los datos del post existente
async function cargarPostExistente() {
  document.getElementById("titulo-pagina").textContent = "Editar post";

  try {
    const respuesta = await fetch(`/api/posts/admin/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!respuesta.ok) {
      mensaje.textContent = "Post no encontrado";
      return;
    }

    const post = await respuesta.json();

    document.getElementById("titulo").value = post.titulo;
    document.getElementById("slug").value = post.slug;
    document.getElementById("extracto").value = post.extracto || "";
    await editorListoPromise;
    editorTinyMCE.setContent(post.contenido || "");
    document.getElementById("imagen_portada").value = post.imagen_portada || "";

    if (post.imagen_portada) {
      const preview = document.getElementById("preview-imagen");
      preview.src = post.imagen_portada;
      preview.style.display = "block";
    }

    document.getElementById("publicado").checked = post.publicado === 1;
    document.getElementById("visibilidad").value =
      post.visibilidad || "publico";
    slugTocadoManualmente = true;

    // Esperar a que las categorías ya estén cargadas en el select antes de seleccionar
    await categoriasListasPromise;
    document.getElementById("categoria_id").value = post.categoria_id || "";
  } catch (err) {
    console.error(err);
    mensaje.textContent = "Error al cargar el post";
  }
}

if (esEdicion) {
  cargarPostExistente();
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensaje.textContent = "";
  if (editorTinyMCE.getContent({ format: "text" }).trim().length === 0) {
    mensaje.textContent = "El contenido no puede estar vacío";
    return;
  }
  const datosPost = {
    titulo: document.getElementById("titulo").value,
    slug: document.getElementById("slug").value,
    extracto: document.getElementById("extracto").value,
    contenido: editorTinyMCE.getContent(),
    imagen_portada: document.getElementById("imagen_portada").value || null,
    categoria_id: document.getElementById("categoria_id").value || null,
    publicado: document.getElementById("publicado").checked,
    visibilidad: document.getElementById("visibilidad").value,
  };

  const url = esEdicion ? `/api/posts/${postId}` : "/api/posts";
  const metodo = esEdicion ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datosPost),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.error || "Error al guardar el post";
      return;
    }

    window.location.href = "/admin.html";
  } catch (err) {
    console.error(err);
    mensaje.textContent = "No se pudo conectar con el servidor";
  }
});

async function cargarCategoriasEnSelect() {
  const select = document.getElementById("categoria_id");

  try {
    const respuesta = await fetch("/api/categorias");
    const categorias = await respuesta.json();

    categorias.forEach((cat) => {
      const opcion = document.createElement("option");
      opcion.value = cat.id;
      opcion.textContent = cat.nombre;
      select.appendChild(opcion);
    });

    // Si estamos editando, seleccionar la categoría actual del post
    if (esEdicion) {
      // Espera a que cargarPostExistente ya haya corrido y sepamos categoria_id del post
    }
  } catch (err) {
    console.error(err);
  }
}
