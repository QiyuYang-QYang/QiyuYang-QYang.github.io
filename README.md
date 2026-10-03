# Qiyu Yang: an atlas of questions

A personal site built as a map. Every node is a question, a piece of work, a piece of writing, or something earlier. Every edge is the question that connects two of them. Pages never leave the map: reading opens a panel beside it, and the map reconfigures around whatever is being read.

Built with [Astro](https://astro.build), deployed to GitHub Pages.

## Run it

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run preview:single   # after build: one self-contained file in preview/index.html
```

## Add a node

Create a Markdown file in `src/content/nodes/`. The file name becomes the id and the URL (`/n/<id>/`).

```markdown
---
title: Can smell have a shared language?
type: question            # question | project | essay | note | photo | past
shelves: [work]           # optional; which shelves it appears on (work, writing, photography)
cover: /photos/x.jpg      # optional image in public/, shown on cards and the node page
year: "2026"              # optional, shown on cards
order: 2                  # sort order inside its group on the Index page
summary: One or two sentences shown as the lead and in previews.
pos: [0.68, 0.22]         # position on wide screens, 0 to 1 in each axis
posNarrow: [0.18, 0.62]   # position on phones; optional, defaults to pos transposed
links:
  - to: q-integrate
    question: Two noses disagree. Whose smell is it?
placeholder: false        # true shows a "to be rewritten" note
hidden: false             # true removes it from the map and the build
---

Body text in Markdown.
```

A link only needs to be written on one side; it appears on both nodes. The build fails with a clear message if a link points at a node that does not exist.

Layout convention: on wide screens time runs left to right (earlier work on the left, questions in the middle, current work on the right). On phones it runs top to bottom. Keep the top-left corner of the wide layout clear for the headline.

## Shelves

The header links Work, Writing, Photography, and CV open shelves. A shelf lifts the matching nodes off the map into a flat poster layer, and the map blurs underneath. By default projects and earlier work go to Work, essays and notes to Writing, and photos to Photography; `shelves` in a node's frontmatter overrides that, so one node can sit on several shelves. Shelf names and descriptions live in `SHELVES` in `src/lib/atlas.ts`.

For a photograph, put the image in `public/photos/`, then copy `src/content/nodes/example-photo.md` and set `hidden: false`.

## Add an interactive visualization

Visualizations are custom elements, so they can be dropped into any Markdown file as a tag:

```html
<viz-compromise data-scale="1,2,3,4,5" data-sources="Model:2,Retrieval:4,Rules:3" data-alpha="0.5"></viz-compromise>
```

To make a new one:

1. Create `src/viz/<name>.ts` exporting `mount(el: HTMLElement)`, which builds the visualization inside `el` and may return a cleanup function. Read inputs from `el.dataset`, and use the CSS variables in `src/styles/tokens.css` for color so it follows the theme.
2. Register the tag in `src/viz/index.ts`.

Each visualization is loaded only when its tag appears on screen.

## Edit the pages

- About and CV: `src/content/pages/about.md`, `src/content/pages/cv.md` (the CV opens as a shelf)
- Headline on the map: `src/components/Atlas.astro`
- Colors, type, spacing: `src/styles/tokens.css`

## Deploy

1. Push this project to the `main` branch of `QiyuYang-QYang/QiyuYang-QYang.github.io`.
2. In the repository, open Settings, then Pages, and set the source to GitHub Actions.
3. Every push to `main` builds and publishes the site through `.github/workflows/deploy.yml`.

## Structure

```
src/
  content/nodes/      one Markdown file per node
  content/pages/      about, cv
  lib/atlas.ts        builds the graph at build time and validates links
  layouts/Base.astro  page shell: header, map, reading panel
  scripts/atlas.ts    map rendering, layout, motion, interaction
  scripts/panel.ts    reading panel and title transitions
  scripts/shelf.ts    shelf layer and the lift-off transition
  scripts/router.ts   in-place navigation between pages
  scripts/app.ts      wires the pieces together
  viz/                interactive visualizations
  styles/             tokens and component styles
```
