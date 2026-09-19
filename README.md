# Fortren

Portfolio site for Jose Adrianne Hinaut (Fortren), graphic designer, Cebu City.

Built with Vite. The output is a plain static site.

## Commands

| Command           | What it does                                         |
| ----------------- | ---------------------------------------------------- |
| `npm install`     | Install dependencies (first time only)               |
| `npm run dev`     | Local dev server with live reload                    |
| `npm run build`   | Build the site into `dist/` (images get compressed)  |
| `npm run preview` | Serve the built `dist/` locally to check it          |
| `npm run deploy`  | Build and publish to Cloudflare Pages                |

The first deploy needs a one-time `npx wrangler login`.

## Layout

- `index.html`: page markup
- `src/style.css`: all styles and colour tokens
- `src/main.js`: grain, ticker, kinetic headline, misregistration, lightbox, specimen
- `public/img/`: portfolio images, served at `/img/...`

To add a piece, drop the image in `public/img/` and copy one of the
`<button class="piece">` blocks in `index.html`.