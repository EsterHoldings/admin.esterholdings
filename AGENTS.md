# Repository Guidelines

## Project Structure & Module Organization
- `app.vue` bootstraps layout and global providers; `error.vue` handles Nuxt error boundaries.
- Pages and routes live in `pages/`; shared shells in `layouts/`; route guards in `middleware/`.
- Reusable UI is in `components/`; composables in `composables/`; global stores in `stores/` (Pinia).
- API helpers and domain logic sit in `services/` and `utils/`; shared values in `constants/`; types in `types/`.
- Styling and media live in `assets/`; static files in `public/`; Tailwind config in `tailwind.config.ts`.
- Nuxt setup is in `nuxt.config.ts`; router overrides in `router.options.ts`; server routes/handlers under `server/`.
- This repo is the frontend; backend lives in the sibling `server/` folder next to this `client/` folder.
- All client API calls go through `useAppCore` (see `composables/useAppCore`); follow its patterns when adding or updating requests.
- Backend path from this directory ../server (Backend by Laravel)

## Build, Test, and Development Commands
```bash
yarn dev        # start local dev server at :3000
yarn build      # production build
yarn preview    # serve the production build locally
yarn generate   # generate static build
yarn format     # format with Prettier
yarn format:check  # verify formatting only
```
Prefer `yarn` (repo is pinned via `packageManager`); other package managers work but are not validated here.

## Coding Style & Naming Conventions
- Language: Nuxt 3 with TypeScript; prefer `.ts`/`.vue` with `<script setup lang="ts">`.
- Formatting: 2-space indent, Prettier defaults. Run `yarn format` before pushing.
- Styling: Tailwind-first; keep component-level styles scoped. Use semantic class groupings and avoid inline styles when utilities suffice.
- Naming: components in `PascalCase`, composables `useThing`, stores `useThingStore`, helpers in `camelCase`. Constants uppercase snake case.

## Testing Guidelines
- No automated test runner is configured yet; add focused unit/integration coverage when modifying critical logic (e.g., services, stores).
- Place new tests alongside source (e.g., `components/Button.spec.ts`) using your chosen runner, and document added commands in `package.json`.
- Until tests exist, provide clear manual QA notes in PRs (pages touched, browsers/devices used).

## Commit & Pull Request Guidelines
- Commits: prefer `type(scope): summary` (e.g., `feat(auth): add otp guard`) and keep them small and purposeful. Avoid generic “Updates” messages.
- PRs: include a concise summary, linked issue/ticket, and screenshots or clips for UI changes (desktop + mobile). Note env or migration steps explicitly.
- Keep diffs focused; follow existing folder conventions; add comments where logic is non-obvious.

## Security & Configuration Tips
- Store secrets in environment variables (e.g., `.env` loaded by Nuxt runtime); never commit keys or tokens.
- Review `server/` handlers for data exposure before merging; sanitize and validate inputs at the boundary.
