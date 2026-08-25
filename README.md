# El Blog de Alffa

Blog personal full-stack construido desde cero con Node.js, Express y MySQL — sin frameworks de frontend. Proyecto final del bootcamp de desarrollo web de TripleTen, pensado para ser un blog real de uso y mantenimiento continuo, no solo un ejercicio de práctica.

🔗 **Demo en producción:** [blog-nodejs-production-c272.up.railway.app](https://blog-nodejs-production-c272.up.railway.app/)

## Características

- **CRUD completo de publicaciones**, con estado de borrador y publicado
- **Editor de texto enriquecido** (TinyMCE) para dar formato al contenido: negritas, títulos, listas numeradas y con viñetas, alineación (incluido justificado), tablas, bloques de código
- **Categorías** administrables desde el panel
- **Posts privados**: visibles solo con sesión iniciada, sin necesidad de una sección separada — el mismo blog público se comporta distinto según si hay una sesión activa
- **Autenticación segura** con JWT y contraseñas hasheadas con bcrypt
- **Imágenes en la nube** vía Cloudinary (subida directa desde el navegador, sin pasar por el servidor)
- **Contador de "me gusta"** por publicación, con límite de un like por visitante (recordado vía `localStorage`)
- **Diseño responsive**, con cabecera fija (sticky) e imagen de fondo
- **Panel de administración** propio: login, listado, creación y edición de posts y categorías

## Stack técnico

| Capa                | Tecnología                                            |
| ------------------- | ----------------------------------------------------- |
| Backend             | Node.js, Express                                      |
| Base de datos       | MySQL (`mysql2`)                                      |
| Autenticación       | JWT (`jsonwebtoken`) + `bcrypt`                       |
| Imágenes            | Cloudinary (unsigned upload)                          |
| Editor de contenido | TinyMCE                                               |
| Frontend            | HTML, CSS y JavaScript puro (sin frameworks)          |
| Hosting             | Railway (servidor + base de datos MySQL administrada) |
| Despliegue          | Automático desde GitHub (push a `main`)               |
| Tests               | Vitest + jsdom                                        |

## Estructura del proyecto

```
blog/
├── config/
│   └── db.js                  # Conexión a MySQL (pool)
├── controllers/
│   ├── postsController.js     # Lógica de posts (CRUD, likes)
│   ├── authController.js      # Login
│   ├── categoriasController.js
│   └── metaController.js      # Meta tags dinámicas para compartir en redes
├── routes/
│   ├── postsRoutes.js
│   ├── authRoutes.js
│   ├── categoriasRoutes.js
│   └── configRoutes.js        # Expone config pública de Cloudinary
├── middleware/
│   ├── auth.js                # Protege rutas (obligatorio)
│   └── authOpcional.js        # Detecta sesión sin bloquear (posts privados)
├── public/
│   ├── index.html              # Home del blog
│   ├── post.html               # Detalle de un post
│   ├── admin-login.html
│   ├── admin.html              # Listado de posts (admin)
│   ├── admin-post.html         # Crear/editar post
│   ├── admin-categorias.html
│   ├── css/
│   └── js/
├── tests/
│   └── admin.test.js           # Tests del panel de administración
├── app.js
├── vitest.config.mjs
├── .env                        # Variables de entorno (no versionado)
└── package.json
```

## Modelo de datos

Tres tablas principales en MySQL: `usuarios`, `categorias` y `posts`. El post tiene, entre otros campos, `publicado` (borrador/publicado) y `visibilidad` (`publico`/`privado`), cuya combinación permite tres estados reales de contenido.

## Instalación local

```bash
git clone git@github.com:gitalffa/blog-nodejs.git
cd blog-nodejs
npm install
```

Crea un archivo `.env` en la raíz con:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=blog
JWT_SECRET=una_frase_larga_y_aleatoria
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
PORT=3000
```

Crea la base de datos y las tablas (`usuarios`, `categorias`, `posts`) en tu MySQL local, luego:

```bash
npm run dev
```

El sitio queda disponible en `http://localhost:3000`.

## Tests

El proyecto usa [Vitest](https://vitest.dev/) con `jsdom` para probar la lógica del panel de administración (`public/js/admin.js`): redirección al login sin sesión, carga y renderizado de posts, manejo de sesión expirada y borrado de posts.

```bash
npm test
```

## Despliegue

Desplegado en [Railway](https://railway.app), con auto-deploy activado desde la rama `main` de este repositorio. Cada `git push` dispara un nuevo despliegue automáticamente.

## Autor

**Fabricio Galindo Copado** — Full Stack Developer, 20+ años de experiencia técnica, retirado de CFE tras 30 años de servicio.

- LinkedIn: [fabricio-galindo-copado](https://www.linkedin.com/in/fabricio-galindo-copado/)
- GitHub: [@gitalffa](https://github.com/gitalffa)
