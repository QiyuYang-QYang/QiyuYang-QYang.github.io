import { NARROW, type TitleSource } from './atlas';

const EASE = 'cubic-bezier(.65,0,.35,1)';
const OPEN_MS = 850;
const CLOSE_MS = 700;

export function createPanel() {
  const panel = document.getElementById('panel') as HTMLElement;
  const scroll = document.getElementById('panel-scroll') as HTMLElement;
  const content = document.getElementById('panel-content') as HTMLElement;
  const grip = document.getElementById('panel-grip') as HTMLElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let running: Animation[] = [];

  content.tabIndex = -1;
  content.style.outline = 'none';

  const narrow = () => window.innerWidth < NARROW;
  const closed = () => (narrow() ? 'translateY(calc(100% + 2px))' : 'translateX(calc(100% + 2px))');
  const title = () => content.querySelector<HTMLElement>('.article-title');

  function track(a: Animation) {
    running.push(a);
    a.finished.catch(() => {}).then(() => (running = running.filter((x) => x !== a)));
    return a;
  }

  function settle() {
    for (const a of [...running]) {
      try { a.finish(); } catch { a.cancel(); }
    }
    running = [];
    document.querySelectorAll('.title-ghost').forEach((g) => g.remove());
    const h = title();
    if (h) h.style.visibility = '';
  }

  function setExpanded(v: boolean) {
    panel.classList.toggle('expanded', v);
  }

  scroll.addEventListener('scroll', () => {
    if (!narrow()) return;
    if (scroll.scrollTop > 24) setExpanded(true);
    else if (scroll.scrollTop < 4) setExpanded(false);
  }, { passive: true });

  grip.addEventListener('click', () => {
    scroll.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
    setExpanded(false);
  });

  function fill(html: string) {
    content.innerHTML = html;
    scroll.scrollTop = 0;
    setExpanded(false);
  }

  function makeGhost(h1: HTMLElement, at: DOMRect) {
    const cs = getComputedStyle(h1);
    const g = document.createElement('div');
    g.className = 'title-ghost';
    g.textContent = h1.textContent;
    Object.assign(g.style, {
      left: `${at.left}px`,
      top: `${at.top}px`,
      width: `${at.width}px`,
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      textWrap: 'balance',
    });
    document.body.append(g);
    return g;
  }

  function flyIn(from: TitleSource, h1: HTMLElement, duration: number) {
    const to = h1.getBoundingClientRect();
    const g = makeGhost(h1, to);
    const s = from.fontSize / parseFloat(getComputedStyle(h1).fontSize);
    h1.style.visibility = 'hidden';
    const a = track(g.animate(
      [
        { transform: `translate(${from.rect.left - to.left}px, ${from.rect.top - to.top}px) scale(${s})` },
        { transform: 'none' },
      ],
      { duration, easing: EASE },
    ));
    a.finished.catch(() => {}).then(() => {
      h1.style.visibility = '';
      g.remove();
    });
  }

  function flyOut(h1: HTMLElement, to: TitleSource) {
    const from = h1.getBoundingClientRect();
    const g = makeGhost(h1, from);
    const s = to.fontSize / parseFloat(getComputedStyle(h1).fontSize);
    h1.style.visibility = 'hidden';
    const a = track(g.animate(
      [
        { transform: 'none', opacity: 1 },
        { opacity: 1, offset: 0.8 },
        { transform: `translate(${to.rect.left - from.left}px, ${to.rect.top - from.top}px) scale(${s})`, opacity: 0 },
      ],
      { duration: OPEN_MS, easing: EASE },
    ));
    a.finished.catch(() => {}).then(() => {
      g.remove();
      h1.style.visibility = '';
    });
  }

  function reveal(delay: number, skipTitle: boolean) {
    const article = content.firstElementChild;
    if (!article) return;
    const parts = [...article.children].filter((c) => !(skipTitle && c.classList.contains('article-title')));
    parts.forEach((el, i) => {
      track(el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 600, delay: delay + i * 70, easing: 'ease-out', fill: 'backwards',
      }));
    });
  }

  function focusContent() {
    content.focus({ preventScroll: true });
  }

  function open(html: string, from: TitleSource | null) {
    settle();
    fill(html);
    panel.removeAttribute('inert');
    panel.classList.remove('closing');
    if (reduce.matches) return focusContent();
    const h1 = title();
    track(panel.animate([{ transform: closed() }, { transform: 'none' }], { duration: OPEN_MS, easing: EASE }));
    if (from && h1) flyIn(from, h1, OPEN_MS);
    reveal(from && h1 ? 420 : 260, !!(from && h1));
    focusContent();
  }

  async function swap(html: string, from: TitleSource | null) {
    settle();
    if (reduce.matches) {
      fill(html);
      return focusContent();
    }
    const out = content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
    await out.finished.catch(() => {});
    fill(html);
    out.cancel();
    const h1 = title();
    if (from && h1) flyIn(from, h1, 760);
    reveal(from && h1 ? 300 : 0, !!(from && h1));
    focusContent();
  }

  function close(to: TitleSource | null) {
    settle();
    panel.setAttribute('inert', '');
    if (reduce.matches) return;
    panel.classList.add('closing');
    const h1 = title();
    if (to && h1 && h1.getBoundingClientRect().width) flyOut(h1, to);
    const a = track(panel.animate([{ transform: 'none' }, { transform: closed() }], { duration: CLOSE_MS, easing: EASE }));
    a.finished.catch(() => {}).then(() => panel.classList.remove('closing'));
  }

  return { open, swap, close };
}
