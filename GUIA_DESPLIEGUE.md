# Guía de Despliegue para Producción (React + PHP)

Este documento contiene los pasos detallados para subir el sistema **Proyectar** a tu hosting bajo el dominio `https://ambulanciasproyectar.com/proyectar`.

---

## 1. Configurar la API (PHP) para Producción

1. Ingresa a tu panel de hosting (ej. cPanel o Hostinger) y ve al **Administrador de Archivos**.
2. Navega al directorio donde vas a alojar el proyecto, en este caso sería: `public_html/proyectar`.
3. Crea una carpeta llamada `api` dentro de `proyectar`. Su ruta final debería ser `public_html/proyectar/api`.
4. Sube todos los archivos PHP que tienes en tu carpeta local `api/` hacia esa nueva carpeta `api/` en el hosting.
5. **Base de Datos:**
   * He generado el archivo **`database.sql`** en la raíz de tu proyecto local que contiene toda tu base de datos actualizada.
   * En tu hosting, entra a la sección **Bases de Datos MySQL** y crea una nueva base de datos, un usuario y asígnale todos los privilegios a ese usuario.
   * Entra a la herramienta `phpMyAdmin` de tu hosting e importa ese archivo `database.sql`.
6. **Conexión a BD:**
   En tus archivos PHP donde realizas la conexión a la base de datos (por ejemplo, `api/config/database.php` o similar), cambia los datos locales (como `root`, sin contraseña) por los datos de la base de datos de producción que acabas de crear:
   * **Host:** `localhost` (la mayoría de las veces)
   * **Usuario:** *el usuario que creaste*
   * **Contraseña:** *la contraseña del usuario*
   * **Base de datos:** *el nombre de la base de datos*

---

## 2. Compilar el Frontend (React)

En tu entorno local, antes de subir el frontend, necesitas decirle que ahora apuntará al servidor real y comprimir todo el código.

1. Abre el archivo `client/src/config.js` y asegúrate de que esté configurado para producción, comentando la URL local y descomentando la de producción:
   ```javascript
   const config = {
       // apiUrl: 'http://localhost/proyectar/api',
       apiUrl: 'https://ambulanciasproyectar.com/proyectar/api',
   };
   export default config;
   ```

2. Abre una terminal en la carpeta `client/` de tu proyecto y ejecuta el siguiente comando:
   ```bash
   npm run build
   ```
3. Esto tardará unos segundos y creará una nueva carpeta llamada `dist/` dentro de `client/`. 
   *(Nota: esta carpeta contiene todos los archivos estáticos listos y optimizados para el navegador)*.

---

## 3. Subir el Frontend al Hosting

1. Ve nuevamente al **Administrador de Archivos** de tu hosting, dentro de la carpeta `public_html/proyectar`.
2. Sube **todo el contenido** que está *adentrito* de la carpeta local `client/dist/` directamente en `public_html/proyectar`.
3. La estructura final en tu hosting debería verse similar a esto:
   ```text
   public_html/
   └── proyectar/           <-- https://ambulanciasproyectar.com/proyectar
       ├── api/             <-- (nuestros scripts PHP)
       ├── assets/          <-- (archivos creados por React)
       ├── index.html       <-- (archivo creado por React)
       └── ... (otros archivos .js, .css, etc.)
   ```

---

## 4. Archivo .htaccess (¡Muy Importante!)

Como React maneja sus propias rutas (por ejemplo, `/dashboard`, `/ambulancias`), si un usuario recarga la página en cualquier ruta que no sea la raíz, el servidor puede mostrar un error **404**. Para solucionar esto debemos decirle al hosting que siempre cargue el archivo `index.html`.

En la carpeta `public_html/proyectar` crea un nuevo archivo llamado exactamente `.htaccess` (con el punto inicial) y pega este código:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /proyectar/

  # Si la petición es hacia la carpeta api, o es un archivo existente, déjalo pasar
  RewriteRule ^api/ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Si no existe, redirigirlo a index.html (React router)
  RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>
```

> **Nota para la CORS en PHP:**
Asegúrate de que tus archivos PHP tengan las cabeceras CORS correctas si en el futuro decides separar frontend y backend en dominios distintos, pero al estar todo bajo `https://ambulanciasproyectar.com/proyectar/`, no deberías tener problemas de bloqueos de origen cruzado.

---

¡Eso es todo! Ahora al entrar a `https://ambulanciasproyectar.com/proyectar` deberías ver y poder utilizar tu aplicación React de forma completamente funcional con sus conexiones directas a tu backend en PHP.
