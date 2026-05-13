// Explainer modal for the Board Annotator tool.

export class AnnotatorModal {
  constructor() {
    this._el = this._build()
    document.body.appendChild(this._el)
  }

  _build() {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')

    overlay.innerHTML = `
      <div class="modal-panel annotator-modal-panel">
        <button class="modal-close" aria-label="Close">✕</button>
        <div class="modal-header">
          <h2 class="modal-title">Contribute a Board</h2>
        </div>
        <div class="modal-body">
          <p class="annotator-intro">
            Do you have a historical snakes &amp; ladders board — from a museum collection, a personal archive, or elsewhere — that isn't yet on this site? You can digitise it yourself using the <strong>Board Annotator</strong>, a five-step browser tool that requires no coding.
          </p>

          <div class="annotator-steps-list">
            <div class="ann-step">
              <span class="ann-step-num">1</span>
              <div>
                <strong>Upload your board image.</strong>
                The tool checks the image automatically — no account required.
              </div>
            </div>
            <div class="ann-step">
              <span class="ann-step-num">2</span>
              <div>
                <strong>Click each square</strong> in order from the starting square to the last. The tool records coordinates and labels each one live as you click.
              </div>
            </div>
            <div class="ann-step">
              <span class="ann-step-num">3</span>
              <div>
                <strong>Mark snakes and ladders</strong> by clicking a pair of connected squares. If the first is higher-numbered than the second, it's a snake; if lower, a ladder.
              </div>
            </div>
            <div class="ann-step">
              <span class="ann-step-num">4</span>
              <div>
                <strong>Fill in the board details</strong> — a short name, a brief history (max 50 words) describing the medium, date, and where the original is held.
              </div>
            </div>
            <div class="ann-step">
              <span class="ann-step-num">5</span>
              <div>
                <strong>Review and submit.</strong> Your annotated board is emailed for approval. Once approved, it goes live on the site automatically.
              </div>
            </div>
          </div>

          <p class="annotator-note">
            Your submission will be reviewed before it is published. No account, login, or technical knowledge is needed.
          </p>
        </div>
        <div class="modal-footer">
          <a class="btn-begin" href="${import.meta.env.BASE_URL}tools/annotator/index.html" target="_blank" rel="noopener">
            Open Annotator Tool →
          </a>
        </div>
      </div>
    `

    overlay.querySelector('.modal-close').addEventListener('click', () => this.hide())
    overlay.addEventListener('click', e => { if (e.target === overlay) this.hide() })
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('visible')) this.hide()
    })

    return overlay
  }

  show() {
    this._el.classList.add('visible')
    document.body.style.overflow = 'hidden'
  }

  hide() {
    this._el.classList.remove('visible')
    document.body.style.overflow = ''
  }
}
