import type { Mode } from './atlas';

export interface Route {
  path: string;
  mode: Mode;
  id: string;
  title: string;
  html: string;
}

type Snapshot = Omit<Route, 'path'>;

declare global {
  interface Window {
    __ATLAS_PAGES__?: Record<string, Snapshot>;
  }
}

type Handler = (route: Route, source: Element | null) => void | Promise<void>;

const FILE = /\.[a-z0-9]+$/i;

export function normalize(path: string) {
  let p = path.replace(/index\.html$/, '');
  if (!p.startsWith('/')) p = '/' + p;
  if (!p.endsWith('/') && !FILE.test(p)) p += '/';
  return p;
}

export function createRouter(onRoute: Handler) {
  const pages = window.__ATLAS_PAGES__;
  const preview = !!pages;
  const cache = new Map<string, Promise<Route>>();
  const location_ = () => normalize(preview ? location.hash.slice(1) || '/' : location.pathname);
  let current = location_();

  async function fetchRoute(path: string): Promise<Route> {
    if (pages) {
      const snap = pages[path] ?? pages['/404/'];
      if (!snap) throw new Error(`No page for ${path}`);
      return { path, ...snap };
    }
    const res = await fetch(path, { headers: { Accept: 'text/html' } });
    if (!res.ok && res.status !== 404) throw new Error(`${res.status} for ${path}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const content = doc.querySelector('[data-route-content]');
    if (!content) throw new Error(`No panel content in ${path}`);
    const root = doc.documentElement;
    return {
      path,
      mode: (root.dataset.mode as Mode) ?? 'page',
      id: root.dataset.id ?? '',
      title: doc.title,
      html: content.innerHTML,
    };
  }

  function load(path: string) {
    let p = cache.get(path);
    if (!p) {
      p = fetchRoute(path);
      p.catch(() => cache.delete(path));
      cache.set(path, p);
    }
    return p;
  }

  async function go(href: string, source: Element | null = null, push = true) {
    const path = normalize(new URL(href, location.href).pathname);
    if (push && path === current) return;
    let route: Route;
    try {
      route = await load(path);
    } catch {
      if (!preview) location.href = href;
      return;
    }
    if (push) history.pushState(null, '', preview ? `#${path}` : path);
    current = path;
    await onRoute(route, source);
  }

  function internal(a: Element | null): string | null {
    if (!a) return null;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
    if (a.getAttribute('target') || a.hasAttribute('download')) return null;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || FILE.test(url.pathname)) return null;
    return url.pathname;
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest('a');
    const path = internal(a);
    if (!path) return;
    e.preventDefault();
    go(path, a);
  });

  const warm = (e: Event) => {
    const path = internal((e.target as Element).closest?.('a') ?? null);
    if (path) load(normalize(path)).catch(() => {});
  };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('focusin', warm);
  document.addEventListener('touchstart', warm, { passive: true });

  addEventListener('popstate', () => {
    const path = location_();
    if (path !== current) go(path, null, false);
  });

  function start() {
    if (preview && current !== '/') {
      const path = current;
      current = '/';
      go(path, null, false);
    }
  }

  return { go, start, current: () => current };
}
