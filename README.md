# Qiyu Yang

Personal site. Content lives in `content/` and `media/`; the pages in `index.html`, `post.html` and `assets/` only lay it out.

## Editing

Open [app.pagescms.org](https://app.pagescms.org), sign in with GitHub and choose this repository. The editor has four sections:

- **Writing**: essays. Untick "Draft" to publish.
- **Work**: projects. "Order" sets the position.
- **Library**: links worth sharing (YouTube, articles, papers, books) with your own notes. The section appears once it has a published entry.
- **CV**: sections and entries, plus an optional PDF.
- **Site and photos**: name, links, and photos for the homepage and the Photograph section.

Every save is a commit. GitHub Actions rebuilds the site, and the change is live about a minute later.

## Files

```
content/site.json       name, links, photos
content/cv.json         CV sections
content/works/*.md      one file per project
content/writing/*.md    one file per essay
content/library/*.md    one file per link
content/generated/      built by scripts/build.mjs, do not edit
media/                  uploaded images and files
```

## Local preview

```
npm install
npm run preview
```

## One-time setup

In the repository on GitHub: Settings → Pages → Source → **GitHub Actions**.
