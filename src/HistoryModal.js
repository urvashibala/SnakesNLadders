// History modal — shown before a game begins.

export class HistoryModal {
  constructor(onBeginGame) {
    this._onBeginGame = onBeginGame
    this._board = null
    this._el = this._build()
    document.body.appendChild(this._el)
  }

  _build() {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')

    overlay.innerHTML = `
      <div class="modal-panel">
        <button class="modal-close" aria-label="Close">✕</button>
        <div class="modal-header">
          <h2 class="modal-title" id="modal-board-name"></h2>
        </div>
        <div class="modal-body">
          <img class="modal-board-thumb" id="modal-thumb" src="" alt="" />
          <p class="modal-history-text" id="modal-history-text"></p>
        </div>
        <div class="modal-footer">
          <button class="btn-begin" id="modal-begin-btn">Begin Game</button>
        </div>
      </div>
    `

    overlay.querySelector('.modal-close').addEventListener('click', () => this.hide())
    overlay.querySelector('#modal-begin-btn').addEventListener('click', () => {
      this.hide()
      if (this._board) this._onBeginGame(this._board)
    })
    overlay.addEventListener('click', e => { if (e.target === overlay) this.hide() })
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('visible')) this.hide()
    })

    return overlay
  }

  show(board) {
    this._board = board
    this._el.querySelector('#modal-board-name').textContent = board.name
    this._el.querySelector('#modal-thumb').src = board.imageUrl
    this._el.querySelector('#modal-thumb').alt = board.name
    this._el.querySelector('#modal-history-text').textContent = board.historyText || ''
    this._el.classList.add('visible')
    document.body.style.overflow = 'hidden'
  }

  hide() {
    this._el.classList.remove('visible')
    document.body.style.overflow = ''
  }
}
