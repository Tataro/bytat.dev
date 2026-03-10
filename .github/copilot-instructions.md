# bytat.dev — Portfolio Site

Personal profile/portfolio website built with **Astro 5**, **Bun**, and deployed to **Cloudflare Pages**.

## Stack

| Layer | Tool |
|-------|------|
| Framework | [Astro 5](https://astro.build) (`output: 'server'`) |
| Runtime / Package Manager | [Bun](https://bun.sh) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com) via `@astrojs/cloudflare` adapter |
| Language | TypeScript (strict) |

## Build & Dev Commands

```bash
bun install          # install dependencies
bun run dev          # start dev server (http://localhost:4321)
bun run build        # production build → dist/
bun run preview      # preview production build locally
```

> Always use `bun` — never `npm`, `yarn`, or `pnpm`.

## Architecture

```
src/
  pages/        # File-based routing (.astro, .ts endpoints)
  components/   # Reusable Astro/UI components
  layouts/      # Page shell layouts
  content/      # Content Collections (markdown/MDX)
  styles/       # Global CSS
public/         # Static assets (copied as-is)
```

- `src/pages/index.astro` is the homepage.
- API routes live in `src/pages/` as `.ts` files using Astro's [Endpoints API](https://docs.astro.build/en/guides/endpoints/).
- Use [Content Collections](https://docs.astro.build/en/guides/content-collections/) for blog posts or project entries.

## Cloudflare-specific Conventions

- The adapter targets **Cloudflare Pages** (Functions). The `wrangler.toml` or `wrangler.json` at the root configures the Worker when needed.
- Access Cloudflare bindings (KV, D1, R2, etc.) via `Astro.locals.runtime.env` in `.astro` files or `context.locals.runtime.env` in endpoints — never via `process.env` at request time.
- Environment variables for local dev go in `.dev.vars` (gitignored); for production, set them in the Cloudflare dashboard or `wrangler secret put`.
- Static assets in `public/` are served by Cloudflare CDN directly — no need for server-side handling.

## Code Conventions

- **Components**: One component per file; PascalCase filenames (`HeroSection.astro`).
- **Styles**: Scoped `<style>` blocks inside `.astro` files by default; global styles in `src/styles/global.css` imported in the root layout.
- **TypeScript**: Strict mode is on. Avoid `any`; prefer `unknown` + type narrowing at boundaries.
- **Frontmatter**: Keep component script logic minimal — extract complex logic to `src/lib/` utilities.
- **No client JS by default**: Astro ships zero JS unless a component explicitly uses a [client directive](https://docs.astro.build/en/reference/directives-reference/#client-directives) (`client:load`, `client:idle`, `client:visible`).

## Adding Integrations

```bash
bunx astro add tailwind   # e.g. add Tailwind CSS
bunx astro add react      # e.g. add React island support
```

After adding, commit the updated `astro.config.mjs` and `package.json`.
