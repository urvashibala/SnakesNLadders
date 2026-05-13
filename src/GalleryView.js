// Museum gallery view — horizontal scroll, black-framed paintings.
// Auto-scrolls when cursor approaches left/right screen edges.

const EDGE_THRESHOLD = 140  // px from screen edge to trigger scroll
const MAX_SPEED      = 14   // px per animation frame at full intensity

export class GalleryView {
  constructor(boards, { onBoardClick, onRandomClick }) {
    this._boards         = boards
    this._onBoardClick   = onBoardClick
    this._onRandomClick  = onRandomClick
    this._mouseX         = -1
    this._rafId          = null
    this._el             = this._build()
    this._canvas         = this._el.querySelector('.gallery-canvas')
    this._scrollHint     = this._el.querySelector('.scroll-hint')
    this._initScrollBehaviour()
  }

  get element() { return this._el }

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId)
    document.removeEventListener('mousemove', this._onMouseMove)
    document.removeEventListener('mouseleave', this._onMouseLeave)
  }

  // ── Build DOM ──────────────────────────────────────────────

  _build() {
    const wrapper = document.createElement('div')
    wrapper.id = 'gallery-view'

    wrapper.innerHTML = `
      <header class="gallery-header">
        <div class="gallery-title-block">
          <span
            class="gallery-title"
            contenteditable="true"
            spellcheck="false"
            id="gallery-title-text"
          ></span>
          <span
            class="gallery-subtitle"
            contenteditable="true"
            spellcheck="false"
            id="gallery-subtitle-text"
          ></span>
        </div>
        <div class="header-actions">
          <button class="btn-museum" id="random-board-btn">Random Board</button>
        </div>
      </header>

      <div class="gallery-canvas" id="gallery-canvas"></div>

      <div class="scroll-hint" id="scroll-hint">Move cursor to edge to browse ›</div>
    `

    // Restore / set editable title text
    const t = wrapper.querySelector('#gallery-title-text')
    const s = wrapper.querySelector('#gallery-subtitle-text')
    // Migrate old title value
    if (localStorage.getItem('gallery-title') === 'Snakes & Ladders') localStorage.removeItem('gallery-title')
    t.textContent = localStorage.getItem('gallery-title')    ?? 'Neither Snakes Nor Ladders'
    s.textContent = localStorage.getItem('gallery-subtitle') ?? 'by Urvashi Balasubramaniam'
    t.addEventListener('blur', e => localStorage.setItem('gallery-title',    e.target.textContent.trim()))
    s.addEventListener('blur', e => localStorage.setItem('gallery-subtitle', e.target.textContent.trim()))

    wrapper.querySelector('#random-board-btn').addEventListener('click', () => this._onRandomClick())

    // Build painting cards into the canvas
    const canvas = wrapper.querySelector('#gallery-canvas')
    for (const board of this._boards) canvas.appendChild(this._buildCard(board))

    return wrapper
  }

  _buildCard(board) {
    const card = document.createElement('article')
    card.className = 'painting-card'
    card.setAttribute('role', 'button')
    card.setAttribute('tabindex', '0')
    card.setAttribute('aria-label', board.name)

    card.innerHTML = `
      <div class="painting-frame">
        <div class="painting-matte">
          <div class="painting-image-wrap">
            <img
              class="painting-image"
              src="${board.imageUrl}"
              alt="${board.name}"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div class="painting-nameplate">
        <span class="nameplate-text">${board.name}</span>
      </div>
    `

    const open = () => this._onBoardClick(board)
    card.addEventListener('click', open)
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open() })

    return card
  }

  // ── Mouse-edge scroll ─────────────────────────────────────

  _initScrollBehaviour() {
    this._onMouseMove  = e => { this._mouseX = e.clientX }
    this._onMouseLeave = () => {
      this._mouseX = -1
      document.body.classList.remove('scroll-hint-right', 'scroll-hint-left')
    }

    document.addEventListener('mousemove',  this._onMouseMove)
    document.addEventListener('mouseleave', this._onMouseLeave)

    // Dismiss scroll hint once user has scrolled
    this._canvas.addEventListener('scroll', () => {
      if (this._scrollHint) this._scrollHint.classList.add('hidden')
    }, { once: true })

    this._startRAF()
  }

  _startRAF() {
    const tick = () => {
      const x = this._mouseX
      const w = window.innerWidth

      if (x >= 0) {
        let velocity = 0

        if (x > w - EDGE_THRESHOLD) {
          const t = (x - (w - EDGE_THRESHOLD)) / EDGE_THRESHOLD
          velocity = MAX_SPEED * t * t
          document.body.classList.add('scroll-hint-right')
          document.body.classList.remove('scroll-hint-left')
        } else if (x < EDGE_THRESHOLD) {
          const t = (EDGE_THRESHOLD - x) / EDGE_THRESHOLD
          velocity = -(MAX_SPEED * t * t)
          document.body.classList.add('scroll-hint-left')
          document.body.classList.remove('scroll-hint-right')
        } else {
          document.body.classList.remove('scroll-hint-right', 'scroll-hint-left')
        }

        if (velocity !== 0) {
          this._canvas.scrollLeft += velocity
        }
      }

      this._rafId = requestAnimationFrame(tick)
    }

    this._rafId = requestAnimationFrame(tick)
  }
}
