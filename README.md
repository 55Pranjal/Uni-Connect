# UniConnect — Frontend

## What this is

College community / chat / project-collab app for students. Live demo: <https://u-niconnect.netlify.app/>.

## Architecture

Two repos: this one is the **React + Vite frontend**; the backend lives separately at `<TODO: backend repo URL>`. Auth runs on httpOnly cookies issued by the backend (`withCredentials: true` on the axios client). Real-time chat is over Socket.IO, sharing a single connection via `SocketContext`.

## Local development

```
npm install
npm run dev
```

Backend must be running locally on `http://localhost:5000` for the frontend to be useful. See the backend repo for setup.

Required env vars (create `.env.local`):

```
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<from Google Cloud Console>
```

## Scripts

```
npm run dev       # start vite dev server
npm run build     # production build
npm run preview   # serve the build locally
npm run lint      # eslint
```

## Project layout

```
src/
  api/          axios client + per-resource modules
  assets/
  components/   reusable UI (Navbar, Footer, cards/, modals/, ...)
  context/      AuthContext, ToastContext, SocketContext
  hooks/        useQuery + domain hooks (see src/hooks/README.md)
  lib/          queryEvents (invalidate bus)
  pages/        route-level components
  utils/        avatar, levelTier
```

## CI

GitHub Actions runs lint + build on every push and PR. See `.github/workflows/ci.yml`. Backend has its own CI in the server repo; a starter workflow is in `docs/server-ci.yml.example`.

## Pre-commit hooks

Husky + lint-staged auto-format and lint staged files. Run `npm install` once to wire them up (the `prepare` script invokes `husky install`). On Windows, git may not preserve the executable bit on `.husky/pre-commit` — if hooks don't fire after install, run once:

```
git update-index --chmod=+x .husky/pre-commit
```

## Contributing

- Add new data-fetching hooks alongside the existing ones in `src/hooks/` (see the README there).
- Toast errors: routes that handle errors inline pass `suppressToast: true` on the axios config; everything else gets a default error toast via `src/api/api.js`.
- Don't restore the localStorage JWT pattern — auth is cookie-based.
