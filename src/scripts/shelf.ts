type PointOf = (id: string) => { x: number; y: number } | null;

const EASE = 'cubic-bezier(.65,0,.35,1)';

export function createShelf() {
  const shelf = document.getElementById('shelf') as HTMLElement;
  const backdrop = shelf.querySelector('.shelf-backdrop') as HTMLElement;
  const scroll = document.getElementById('shelf-scroll') as HTMLElement;
  const content = document.getElementById('shelf-content') as HTMLElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let running: Animation[] = [];

  content.tabIndex = -1;
  content.style.outline = 'none';

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
  }

  const cards = () => [...content.querySelectorAll<HTMLElement>('.card[data-node]')];
  const visible = (r: DOMRect) => r.bottom > 0 && r.top < innerHeight;

  function offset(card: HTMLElement, p: { x: number; y: number } | null) {
    const r = card.getBoundingClientRect();
    if (!p) return 'translateY(24px) scale(.96)';
    return `translate(${p.x - (r.left + r.width / 2)}px, ${p.y - (r.top + r.height / 2)}px) scale(.06)`;
  }

  function lift(pointOf: PointOf, delay = 0) {
    const head = content.querySelector('.shelf-head, .shelf-prose');
    if (head) track(head.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], {
      duration: 700, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards',
    }));
    cards().forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const from = visible(r) ? offset(card, pointOf(card.dataset.node!)) : 'translateY(24px)';
      track(card.animate([{ transform: from, opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'none', opacity: 1 }], {
        duration: 950, delay: delay + 120 + i * 55, easing: EASE, fill: 'backwards',
      }));
    });
    content.querySelectorAll('.shelf-prose, .placeholder, .shelf-empty').forEach((el) => {
      track(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: delay + 250, easing: 'ease-out', fill: 'backwards' }));
    });
  }

  function open(html: string, pointOf: PointOf) {
    settle();
    content.innerHTML = html;
    scroll.scrollTop = 0;
    shelf.removeAttribute('inert');
    shelf.classList.remove('closing');
    content.focus({ preventScroll: true });
    if (reduce.matches) return;
    track(backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: EASE }));
    lift(pointOf, 80);
  }

  async function swap(html: string, pointOf: PointOf) {
    settle();
    if (reduce.matches) {
      content.innerHTML = html;
      scroll.scrollTop = 0;
      return;
    }
    const out = content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
    await out.finished.catch(() => {});
    content.innerHTML = html;
    scroll.scrollTop = 0;
    out.cancel();
    lift(pointOf);
    content.focus({ preventScroll: true });
  }

  function close(pointOf: PointOf) {
    settle();
    shelf.setAttribute('inert', '');
    if (reduce.matches) return;
    shelf.classList.add('closing');
    cards().forEach((card, i) => {
      const r = card.getBoundingClientRect();
      if (!visible(r)) return;
      track(card.animate([{ transform: 'none', opacity: 1 }, { opacity: 1, offset: 0.6 }, { transform: offset(card, pointOf(card.dataset.node!)), opacity: 0 }], {
        duration: 700, delay: i * 25, easing: EASE, fill: 'forwards',
      }));
    });
    content.querySelectorAll('.shelf-head, .shelf-prose, .placeholder, .shelf-empty').forEach((el) => {
      track(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-in', fill: 'forwards' }));
    });
    const a = track(backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, easing: EASE, fill: 'forwards' }));
    a.finished.catch(() => {}).then(() => {
      shelf.classList.remove('closing');
      for (const x of content.getAnimations({ subtree: true })) x.cancel();
      backdrop.getAnimations().forEach((x) => x.cancel());
    });
  }

  return { open, swap, close };
}
