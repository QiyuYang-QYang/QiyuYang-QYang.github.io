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

## Formulas and figures in essays

- **Display formula**: in the Text field switch to **Source** and write a fenced block whose language is `math`:

  ````
  ```math
  L(N, D) = E + \frac{A}{N^{\alpha}} + \frac{B}{D^{\beta}}
  ```
  ````

- **Inline formula**: wrap LaTeX in dollar signs inside inline code, for example `` `$2^n$` ``.
- Both are rendered with KaTeX when the site builds, so readers download no extra script. Using code blocks keeps the rich-text editor from escaping backslashes.
- **Figure with caption**: insert an image; its alt text (or title, if set) becomes the caption under it. Add `#wide` to the end of the image path to let it extend past the text column on wide screens without a table of contents.
- Essays with four or more headings get a sticky table of contents on screens wider than 1180 px.

## Large photos

The online editor rejects single files over about 4 MB (error 413). For bigger photos, upload them on GitHub instead: open the `media` folder, choose Add file → Upload files, and commit. They then appear in the editor's media picker.

Every publish resizes images to at most 2400 px and recompresses anything over 500 KB, so the live site stays fast. The originals in the repository are left untouched.

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
