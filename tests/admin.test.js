import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_JS = readFileSync(
  resolve(__dirname, "../public/js/admin.js"),
  "utf-8",
);

// admin.js is a plain browser script (no module exports) that runs its
// top-level code immediately, exactly like it does when admin.html loads it
// via <script src="js/admin.js">. Indirect eval runs it in global scope so
// its function declarations (cargarPostsAdmin, borrarPost) attach to
// globalThis and become callable/spy-able from the test.
function loadAdminScript() {
  (0, eval)(ADMIN_JS);
}

function setupDom() {
  document.body.innerHTML = `
    <header class="admin-header">
      <span id="nombre-usuario"></span>
      <button id="btn-logout">Cerrar sesión</button>
    </header>
    <main>
      <table>
        <tbody id="cuerpo-tabla">
          <tr><td colspan="4">Cargando...</td></tr>
        </tbody>
      </table>
    </main>
  `;
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  localStorage.clear();
  setupDom();

  // Prevent jsdom's "Not implemented: navigation" noise and let tests
  // observe redirects by reading window.location.href.
  delete window.location;
  window.location = { href: "" };

  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("alert", vi.fn());
  vi.stubGlobal("confirm", vi.fn(() => true));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("admin.js (public/admin.html logic)", () => {
  it("redirects to admin-login.html when there is no token", () => {
    fetch.mockResolvedValue({ status: 200, json: async () => [] });

    loadAdminScript();

    expect(window.location.href).toBe("/admin-login.html");
  });

  it("does not redirect and shows the stored username when a token exists", async () => {
    localStorage.setItem("token", "abc123");
    localStorage.setItem("nombre", "Fabricio");
    fetch.mockResolvedValue({ status: 200, json: async () => [] });

    loadAdminScript();
    await flushPromises();

    expect(window.location.href).toBe("");
    expect(document.getElementById("nombre-usuario").textContent).toBe(
      "Fabricio",
    );
  });

  it("logs out on button click: clears storage and redirects to login", () => {
    localStorage.setItem("token", "abc123");
    localStorage.setItem("nombre", "Fabricio");
    fetch.mockResolvedValue({ status: 200, json: async () => [] });

    loadAdminScript();
    document.getElementById("btn-logout").click();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("nombre")).toBeNull();
    expect(window.location.href).toBe("/admin-login.html");
  });

  it("renders the posts table on successful load", async () => {
    localStorage.setItem("token", "abc123");
    fetch.mockResolvedValue({
      status: 200,
      json: async () => [
        {
          id: 1,
          titulo: "Mi primer post",
          publicado: true,
          visibilidad: "publico",
          creado_en: "2026-01-15T00:00:00.000Z",
        },
        {
          id: 2,
          titulo: "Borrador secreto",
          publicado: false,
          visibilidad: "privado",
          creado_en: "2026-02-01T00:00:00.000Z",
        },
      ],
    });

    loadAdminScript();
    await flushPromises();

    const filas = document.querySelectorAll("#cuerpo-tabla tr");
    expect(filas).toHaveLength(2);
    expect(filas[0].textContent).toContain("Mi primer post");
    expect(filas[0].textContent).toContain("Publicado");
    expect(filas[0].textContent).toContain("🌐 Público");
    expect(filas[1].textContent).toContain("Borrador secreto");
    expect(filas[1].textContent).toContain("Borrador");
    expect(filas[1].textContent).toContain("🔒 Privado");
  });

  it("shows an empty state message when there are no posts", async () => {
    localStorage.setItem("token", "abc123");
    fetch.mockResolvedValue({ status: 200, json: async () => [] });

    loadAdminScript();
    await flushPromises();

    expect(document.getElementById("cuerpo-tabla").textContent).toContain(
      "Todavía no hay posts.",
    );
  });

  it("clears the token and redirects to login on a 401/403 response", async () => {
    localStorage.setItem("token", "expired-token");
    fetch.mockResolvedValue({ status: 401, json: async () => ({}) });

    loadAdminScript();
    await flushPromises();

    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.href).toBe("/admin-login.html");
  });

  it("shows an error message in the table when the fetch fails", async () => {
    localStorage.setItem("token", "abc123");
    fetch.mockRejectedValue(new Error("network down"));

    loadAdminScript();
    await flushPromises();

    expect(document.getElementById("cuerpo-tabla").textContent).toContain(
      "Error al cargar los posts.",
    );
  });

  it("borrarPost: asks for confirmation, deletes, and reloads the list", async () => {
    localStorage.setItem("token", "abc123");
    fetch.mockResolvedValue({ status: 200, json: async () => [] });

    loadAdminScript();
    await flushPromises();

    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: true }); // DELETE
    fetch.mockResolvedValueOnce({ status: 200, json: async () => [] }); // reload

    await borrarPost(7);

    expect(confirm).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      "/api/posts/7",
      expect.objectContaining({
        method: "DELETE",
        headers: { Authorization: "Bearer abc123" },
      }),
    );
    expect(fetch).toHaveBeenCalledTimes(2); // delete + reload
  });

  it("borrarPost: does nothing when the user cancels the confirmation", async () => {
    localStorage.setItem("token", "abc123");
    fetch.mockResolvedValue({ status: 200, json: async () => [] });

    loadAdminScript();
    await flushPromises();

    confirm.mockReturnValue(false);
    fetch.mockClear();

    await borrarPost(7);

    expect(fetch).not.toHaveBeenCalled();
  });

  it("borrarPost: alerts when the delete request fails", async () => {
    localStorage.setItem("token", "abc123");
    fetch.mockResolvedValue({ status: 200, json: async () => [] });

    loadAdminScript();
    await flushPromises();

    fetch.mockClear();
    fetch.mockResolvedValueOnce({ ok: false });

    await borrarPost(7);

    expect(alert).toHaveBeenCalledWith("No se pudo borrar el post");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
