# PhotoBooth Boho Chic

Aplicación móvil-first construida con Laravel 12, TailwindCSS y Vite para gestionar un “photo booth” de bodas estilo boho chic. El sistema permite a invitados subir fotos editadas con stickers/canvas, capturar videos con miniatura generada en el navegador y mostrarlas en una galería optimizada para pantallas táctiles.

## Características principales

- **Galería pública**  
  - Grid con scroll infinito y carga progresiva.  
  - Miniaturas para fotos y videos (con icono de play).  
  - Lightbox que muestra imágenes o reproduce videos en pantalla completa, con navegación swipe/botones y descarga directa.

- **Editor de fotos**  
  - Canvas Konva con filtros (“Sepia”, “Blanco y Negro”, “Realce”, “Vintage”).  
  - Stickers boho: mover, girar y escalar vía gesto pinch.  
  - Textos con tipografía “Boho Script”, selección de color y borde.  
  - Exportación del lienzo en alta resolución + thumbnail para la galería.

- **Carga de videos**  
  - Vista dedicada (`/invitados/video`) para grabar o elegir MP4/MOV (hasta 256 MB).  
  - Previsualización, generación de thumbnail y barra de progreso durante la subida.  
  - Validación tanto en frontend como en backend.

- **Panel admin (Laravel Breeze)**  
  - Dashboard, moderación tipo swipe, CRUD de stickers, configuración del evento y flyer con QR.  
  - Protección por roles (`admin`/`guest`).

## Requisitos

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL/MariaDB (ver `.env.example`)

## Configuración rápida

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm install
npm run build # o npm run dev
```

Para desarrollo puedes usar:

```bash
php artisan serve
npm run dev
```

## Rutas clave

- Invitados  
  - `/invitados` – galería.  
  - `/invitados/editor` – editor de fotos.  
  - `/invitados/video` – carga de videos.
- Administración  
  - `/admin/login` – acceso administrador.  
  - `/admin` – dashboard y submódulos.

## Notas adicionales

- Los archivos se almacenan en `storage/app/public` (asegúrate de ejecutar `php artisan storage:link`).  
- El backend diferencia fotos y videos con el campo `media_type` de `photos`.  
- El límite de video es de 256 MB; ajusta `upload_max_filesize`/`post_max_size` en PHP si necesitas más.

---

Con ❤️ para bodas boho chic. Si necesitas más detalles o soporte, abre un issue o contribuye al proyecto. 
