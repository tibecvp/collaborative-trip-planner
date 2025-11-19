# Collaborative Trip Planner

A starter React + TypeScript application scaffolded with Vite. This project uses Firebase for backend services and Tailwind CSS for styling. It provides a foundation for building a collaborative trip planning web app where multiple users can plan and share trip details in real time.

> Quick overview based on repository files:
> - Vite + React + TypeScript app (src/)
> - Firebase integration (src/FirebaseConfig.ts)
> - Tailwind CSS (configured as a dependency)
> - Scripts: dev, build, preview, lint

## Tech stack
- React 19 (with TypeScript)
- Vite (build + dev)
- Firebase (client SDK)
- Tailwind CSS (v4)
- PostCSS + Autoprefixer
- ESLint + TypeScript tooling

## Features (intended / scaffolded)
- React + TypeScript app entry at `src/main.tsx`
- Main application component at `src/App.tsx`
- Firebase configuration helper at `src/FirebaseConfig.ts`
- Styling via Tailwind and local CSS files (`src/index.css`, `src/App.css`)
- `src/components/` and `src/assets/` directories available for components and static assets

## Prerequisites
- Node.js (v18+ recommended) and npm
- A Firebase project (for real-time database / authentication / storage, depending on your needs)

## Getting started

Clone the repo:
```bash
git clone https://github.com/tibecvp/collaborative-trip-planner.git
cd collaborative-trip-planner
```

Install dependencies:
```bash
npm install
```

Start the dev server:
```bash
npm run dev
```
Open http://localhost:5173 (or the port Vite shows) to view the app.

Build for production:
```bash
npm run build
```

Run a local production preview:
```bash
npm run preview
```

Lint the project:
```bash
npm run lint
```

## Firebase setup
This repository contains a `src/FirebaseConfig.ts` file to centralize Firebase initialization. Do not commit sensitive keys to the repository. Common approaches:

1. Create a Firebase project in the Firebase console.
2. Obtain your Firebase config object (apiKey, authDomain, projectId, ...).
3. Provide the configuration to `src/FirebaseConfig.ts` or wire it to environment variables (.env):

Example (recommended pattern — do not commit real values):
```ts
// src/FirebaseConfig.ts (example)
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // ...
};

const app = initializeApp(firebaseConfig);
export default app;
```

Add a `.env` file at project root (Vite uses VITE_ prefix):
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Project structure (high level)
- index.html — Vite HTML entry (mounts `#root`)
- src/
  - main.tsx — app entry point
  - App.tsx — main React component
  - FirebaseConfig.ts — Firebase initialization helper
  - index.css, App.css — global/component styles
  - components/ — place React components here
  - assets/ — place static assets here

See files in the repository for more details.

## Development notes
- Type checking and build are performed with TypeScript (`tsc -b` in build script).
- ESLint is configured (run `npm run lint`). Adjust rules in the repo as needed.
- Vite is overridden in package.json to use a `rolldown-vite` package alias — keep this in mind if you need to upgrade Vite.

## Contributing
Contributions are welcome. Typical workflow:
1. Fork and create a branch for your feature/fix.
2. Implement changes and add tests where appropriate.
3. Run linting and ensure the app builds.
4. Open a pull request describing your changes.

## Troubleshooting
- If the app fails to start, ensure Node and npm versions are compatible and that dependencies installed successfully.
- For Firebase-related errors, verify environment variables and that your Firebase project settings (API key, authDomain, etc.) are correct.

## License
No license is specified in the repository. If you'd like to add one, create a `LICENSE` file (for example, MIT) and commit it.

## Contact / Maintainer
Repository owner: @tibecvp

Acknowledgements
- Vite — fast development tooling for modern web projects
- Firebase — backend services and SDKs
- Tailwind CSS — utility-first styling