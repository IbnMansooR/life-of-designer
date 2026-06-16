// Kichik DOM yordamchilari — UI ni qisqa va toza yozish uchun.

export interface ElOpts {
  class?: string
  id?: string
  text?: string
  html?: string
  attrs?: Record<string, string>
  style?: Partial<CSSStyleDeclaration>
  on?: Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (opts.class) node.className = opts.class
  if (opts.id) node.id = opts.id
  if (opts.text !== undefined) node.textContent = opts.text
  if (opts.html !== undefined) node.innerHTML = opts.html
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v)
  if (opts.style) Object.assign(node.style, opts.style)
  if (opts.on) {
    for (const [evt, fn] of Object.entries(opts.on)) {
      node.addEventListener(evt, fn as EventListener)
    }
  }
  for (const c of children) node.append(c)
  return node
}

let toastTimer = 0
let toastEl: HTMLDivElement | null = null

/** Qisqa xabar (toast) ko'rsatadi. */
export function showToast(message: string): void {
  if (!toastEl) {
    toastEl = el('div', { class: 'toast' })
    document.body.appendChild(toastEl)
  }
  toastEl.textContent = message
  toastEl.classList.add('show')
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => toastEl?.classList.remove('show'), 2200)
}
