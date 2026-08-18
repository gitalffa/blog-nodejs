const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/admin-login.html";
}

const form = document.getElementById("form-categoria");
const mensaje = document.getElementById("mensaje");

async function cargarCategorias() {
  const cuerpoTabla = document.getElementById("cuerpo-tabla");

  try {
    const respuesta = await fetch("/api/categorias");
    const categorias = await respuesta.json();

    if (categorias.length === 0) {
      cuerpoTabla.innerHTML =
        '<tr><td colspan="3">Todavía no hay categorías.</td></tr>';
      return;
    }

    cuerpoTabla.innerHTML = categorias
      .map(
        (cat) => `
      <tr>
        <td>${cat.nombre}</td>
        <td>${cat.slug}</td>
        <td><button onclick="borrarCategoria(${cat.id})">Borrar</button></td>
      </tr>
    `,
      )
      .join("");
  } catch (err) {
    console.error(err);
    cuerpoTabla.innerHTML =
      '<tr><td colspan="3">Error al cargar las categorías.</td></tr>';
  }
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensaje.textContent = "";

  const nombre = document.getElementById("nombre").value;

  try {
    const respuesta = await fetch("/api/categorias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensaje.textContent = datos.error || "Error al crear la categoría";
      return;
    }

    document.getElementById("nombre").value = "";
    cargarCategorias();
  } catch (err) {
    console.error(err);
    mensaje.textContent = "No se pudo conectar con el servidor";
  }
});

async function borrarCategoria(id) {
  if (!confirm("¿Seguro que quieres borrar esta categoría?")) return;

  try {
    const respuesta = await fetch(`/api/categorias/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!respuesta.ok) {
      alert("No se pudo borrar (puede que haya posts usando esta categoría)");
      return;
    }

    cargarCategorias();
  } catch (err) {
    console.error(err);
    alert("Error al borrar la categoría");
  }
}

cargarCategorias();
