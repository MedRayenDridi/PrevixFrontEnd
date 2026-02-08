# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Deploying on Render (fix 404 on /organizations, /dashboard, etc.)

This app is a single-page application (SPA). **It must be deployed as a Web Service (Node), not a Static Site**, or direct URLs and reloads will return 404.

If you currently have a **Static Site** on Render and get 404 on paths like `/organizations` or `/dashboard`:

1. In [Render Dashboard](https://dashboard.render.com), go to **New → Web Service**.
2. Connect the **same GitHub repo** (PrevixFrontEnd).
3. Configure:
   - **Name:** e.g. `previx-frontend`
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npx serve -s dist -l $PORT`
   - **Root Directory:** leave blank (or set if the app is in a subfolder)
4. Add environment variables: `VITE_API_BASE_URL`, `VITE_APP_RAGPREVIX_URL`.
5. Create the Web Service. After the first deploy, your app URL will work for all routes.
6. Optional: delete the old Static Site and point your domain to the new Web Service.

The `-s` flag in the start command enables SPA fallback (serve `index.html` for any path so React Router can handle routes).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
