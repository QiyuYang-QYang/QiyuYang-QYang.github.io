import '../viz/index';
import { createAtlas, type AtlasData, type Mode, type TitleSource } from './atlas';
import { createPanel } from './panel';
import { createShelf } from './shelf';
import { createRouter, type Route } from './router';

const root = document.documentElement;
const data: AtlasData = JSON.parse(document.getElementById('atlas-data')!.textContent || '{"nodes":[],"edges":[]}');
const byHref = Object.fromEntries(data.nodes.map((n) => [n.id, n]));

let mode = (root.dataset.mode as Mode) || 'home';
let id = root.dataset.id || '';

const panel = createPanel();
const shelf = createShelf();
const sheet = document.getElementById('sheet') as HTMLElement;

const TYPE_LABEL: Record<string, string> = {
  question: 'Question', project: 'Work', essay: 'Essay', note: 'Note', photo: 'Photograph', past: 'Earlier',
};

function openSheet(nodeId: string) {
  const n = byHref[nodeId];
  if (!n) return;
  sheet.querySelector('.t')!.textContent = TYPE_LABEL[n.type] ?? '';
  sheet.querySelector('.title')!.textContent = n.title;
  sheet.querySelector('.s')!.textContent = n.summary;
  sheet.querySelectorAll<HTMLAnchorElement>('.sheet-link').forEach((a) => a.setAttribute('href', n.href));
  sheet.classList.add('show');
}

function closeSheet() {
  sheet.classList.remove('show');
}

const atlas = createAtlas(data, {
  open: (nodeId, source) => router.go(byHref[nodeId].href, source),
  select: (nodeId) => (nodeId ? openSheet(nodeId) : closeSheet()),
}, { mode, id });

function sourceOf(el: Element | null): TitleSource | null {
  if (!el) return null;
  const g = el.matches('[data-ghost], text') ? el : el.querySelector('[data-ghost]');
  if (!g) return null;
  const rect = g.getBoundingClientRect();
  if (!rect.width) return null;
  return { rect, fontSize: parseFloat(getComputedStyle(g).fontSize) };
}

function updateNav(path: string) {
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

async function onRoute(r: Route, sourceEl: Element | null) {
  const from = mode;
  const leaving = id;
  const src = sourceOf(sourceEl);
  document.title = r.title;
  updateNav(r.path);
  closeSheet();

  const inPanel = (m: Mode) => m === 'node' || m === 'page';
  mode = r.mode;
  id = r.id;

  if (r.mode === 'home') {
    atlas.setMode('home', '');
    if (from === 'shelf') shelf.close(atlas.point);
    if (inPanel(from)) panel.close(from === 'node' ? atlas.labelSource(leaving, true) : null);
    root.dataset.mode = 'home';
    root.dataset.id = '';
    return;
  }

  if (r.mode === 'shelf') {
    if (inPanel(from)) panel.close(null);
    atlas.setMode('shelf', r.id);
    root.dataset.mode = 'shelf';
    root.dataset.id = r.id;
    if (from === 'shelf') await shelf.swap(r.html, atlas.point);
    else shelf.open(r.html, atlas.point);
    return;
  }

  const ghostFrom = src ?? (from === 'home' && r.mode === 'node' ? atlas.labelSource(r.id) : null);
  if (from === 'shelf') shelf.close(atlas.point);
  root.dataset.mode = r.mode;
  root.dataset.id = r.id;
  if (inPanel(from)) {
    atlas.setMode(r.mode, r.id);
    await panel.swap(r.html, ghostFrom);
  } else {
    panel.open(r.html, ghostFrom);
    atlas.setMode(r.mode, r.id);
  }
}

const router = createRouter(onRoute);

addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (sheet.classList.contains('show')) atlas.select(null);
  else if (mode !== 'home') router.go('/');
});

const themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
function paintTheme() {
  const t = root.dataset.theme === 'night' ? 'night' : 'paper';
  themeBtn.querySelector('.t-label')!.textContent = t === 'night' ? 'Paper' : 'Night';
  themeMeta?.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
}
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'night' ? 'paper' : 'night';
  try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  paintTheme();
});
paintTheme();

router.start();
