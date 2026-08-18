const form = document.getElementById("form-login");
const mensajeError = document.getElementById("mensaje-error");

// Si ya hay un token guardado, no tiene caso mostrar el login de nuevo
if (localStorage.getItem("token")) {
  window.location.href = "/admin.html";
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensajeError.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const respuesta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensajeError.textContent = datos.error || "Error al iniciar sesión";
      return;
    }

    localStorage.setItem("token", datos.token);
    localStorage.setItem("nombre", datos.nombre);
    window.location.href = "/admin.html";
  } catch (err) {
    console.error(err);
    mensajeError.textContent = "No se pudo conectar con el servidor";
  }
});
