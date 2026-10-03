import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { build } from 'esbuild';
import { parse } from 'node-html-parser';

const dist = 'dist';

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith('.html') ? [p] : [];
  });

const pages = {};
for (const file of walk(dist)) {
  const rel = '/' + relative(dist, file).replace(/\\/g, '/');
  const path = rel === '/404.html' ? '/404/' : rel.replace(/index\.html$/, '');
  const doc = parse(readFileSync(file, 'utf8'));
  const html = doc.querySelector('html');
  pages[path] = {
    mode: html.getAttribute('data-mode'),
    id: html.getAttribute('data-id') || '',
    title: doc.querySelector('title').text,
    html: doc.querySelector('[data-route-content]').innerHTML,
  };
}

const home = parse(readFileSync(join(dist, 'index.html'), 'utf8'));

for (const link of home.querySelectorAll('link[rel="stylesheet"]')) {
  const href = link.getAttribute('href');
  if (href.startsWith('/')) link.replaceWith(`<style>${readFileSync(join(dist, href), 'utf8')}</style>`);
}
for (const s of home.querySelectorAll('script[type="module"]')) s.remove();
home.querySelector('link[rel="canonical"]')?.remove();
home.querySelector('link[rel="icon"]')?.setAttribute(
  'href',
  'data:image/svg+xml,' + encodeURIComponent(readFileSync('public/favicon.svg', 'utf8')),
);

const bundle = await build({
  entryPoints: ['src/scripts/app.ts'],
  bundle: true,
  format: 'esm',
  minify: true,
  write: false,
  target: 'es2020',
});
const code = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const data = JSON.stringify(pages).replace(/</g, '\\u003c');

home.querySelector('body').insertAdjacentHTML(
  'beforeend',
  `<script>window.__ATLAS_PAGES__=${data}</script><script type="module">${code}</script>`,
);

mkdirSync('preview', { recursive: true });
writeFileSync('preview/index.html', home.toString());
console.log(`preview/index.html written with ${Object.keys(pages).length} pages`);
