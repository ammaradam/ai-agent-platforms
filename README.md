# Ammar Adam

Practical notes on running AI in production, each tied to public sources. Built with Astro, React islands, Tailwind and shadcn-style components.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Add a post

Create `src/content/posts/<slug>.md`. The slug becomes the URL: `/posts/<slug>`.

```yaml
---
title: "Post title"
date: 2026-10-20
themes: ["ai-platform-engineering", "observability"]   # first theme is the main one
insight: "One-line takeaway shown in lists and at the top of the post."
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:<id>/"
caveats:
  - title: "Short limitation."
    text: "One or two sentences."
sources:
  - title: "Source title"
    site: "example.com"
    url: "https://example.com/page"
related: ["other-post-slug"]
---
<h3 id="idea">The idea in brief</h3>

<p>Body as HTML or Markdown. Use h3 headings with an id so they show up in the outline.</p>
```

- Tables: wrap in `<div class="tbl">...</div>` so they scroll on phones.
- Diagrams: inline `<figure><div class="fig-scroll"><svg ...></svg></div><figcaption>...</figcaption></figure>`. Use `currentColor` and `hsl(var(--brand))` in `style` attributes so they work in light and dark mode.
- Themes live in `src/data/themes.ts`; projects in `src/data/projects.ts`.

## Deploy

1. Push this folder to a GitHub repository.
2. Import it in Vercel (framework preset: Astro). No environment variables are required.
3. Set `SITE_URL` to your final domain (used for RSS, sitemap and link previews), or edit `site` in `astro.config.mjs`.

## Components

`src/components/ui` holds shadcn components (button, badge, sheet, dialog) written from shadcn's source pattern, using its dependencies (Radix, class-variance-authority, tailwind-merge, lucide-react). To add more, run `npx shadcn@latest init` and `npx shadcn@latest add <component>`; the `@/` alias is already set in `tsconfig.json`.
