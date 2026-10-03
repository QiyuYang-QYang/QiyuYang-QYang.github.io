type Mount = (el: HTMLElement) => void | (() => void);

const registry: Record<string, () => Promise<{ mount: Mount }>> = {
  'viz-compromise': () => import('./compromise'),
};

for (const [tag, load] of Object.entries(registry)) {
  if (customElements.get(tag)) continue;
  customElements.define(tag, class extends HTMLElement {
    private cleanup?: () => void;
    private alive = false;

    connectedCallback() {
      this.alive = true;
      load().then(({ mount }) => {
        if (this.alive && !this.cleanup) this.cleanup = mount(this) || (() => {});
      });
    }

    disconnectedCallback() {
      this.alive = false;
      this.cleanup?.();
      this.cleanup = undefined;
      this.replaceChildren();
    }
  });
}
