import { GameEngine }    from './GameEngine.js'
import { DiceAnimator }  from './DiceAnimator.js'

// ── Constants ──────────────────────────────────────────────────────────────
const TOKEN_PX   = 32    // token display size in px
const STEP_MS    = 130   // ms per square-step animation
const SLIDE_MS   = 600   // ms for snake/ladder direct-slide
const AI_DELAY   = 1100  // ms before AI auto-rolls

const PLAYER_COLORS = ['#c8900a', '#2a6db5', '#2e8b45', '#b53030']
const PLAYER_NAMES  = ['Player 1', 'Player 2', 'Player 3', 'Player 4']

const delay = ms => new Promise(r => setTimeout(r, ms))

// ── GameView ───────────────────────────────────────────────────────────────
export class GameView {
  constructor({ onBackToGallery, tokenUrls }) {
    this._onBack     = onBackToGallery
    this._tokenUrls  = tokenUrls
    this._board      = null
    this._engine     = null
    this._animator   = null
    this._busy       = false       // true while any animation is running
    this._tokens     = new Map()   // playerId → <img> element
    this._scale      = 1
    this._el         = this._buildShell()
  }

  get element() { return this._el }

  /** Called from main.js when user confirms a board in the history modal. */
  load(board) {
    this._board = board
    this._showSetup()
    this._el.style.display = 'flex'
  }

  hide() { this._el.style.display = 'none' }

  // ── Shell ────────────────────────────────────────────────────────────────

  _buildShell() {
    const el = document.createElement('div')
    el.id = 'game-view'
    el.style.cssText = 'display:none; height:100vh; flex-direction:column;'

    // Header
    el.innerHTML = `
      <header class="game-header">
        <button class="game-back-btn" id="gv-back">← Gallery</button>
        <h1 class="game-board-title" id="gv-title"></h1>
        <div style="width:100px"></div>
      </header>

      <!-- Setup panel (shown first) -->
      <div class="gv-setup" id="gv-setup">
        <div class="gv-setup-card">
          <h2 class="gv-setup-heading" id="gv-setup-board-name"></h2>
          <p class="gv-setup-sub">Choose number of players</p>
          <div class="gv-player-count-row" id="gv-count-row"></div>
          <button class="gv-start-btn" id="gv-start">Start Game</button>
        </div>
      </div>

      <!-- Game area (shown after setup) -->
      <div class="gv-game-area" id="gv-game-area" style="display:none; flex:1; overflow:hidden;">
        <div class="gv-game-main">
          <!-- Board + token layer -->
          <div class="gv-board-scroll">
            <div class="gv-board-wrap" id="gv-board-wrap">
              <img class="gv-board-img" id="gv-board-img" alt="" />
              <div class="gv-token-layer" id="gv-token-layer"></div>
            </div>
          </div>

          <!-- Right sidebar -->
          <aside class="gv-sidebar">
            <div class="gv-players-panel" id="gv-players-panel"></div>

            <div class="gv-dice-area">
              <button class="gv-roll-btn" id="gv-roll-btn" disabled>Roll</button>
              <div class="gv-roll-result" id="gv-roll-result"></div>
            </div>

            <div class="gv-log-label">Game log</div>
            <div class="gv-log" id="gv-log"></div>
          </aside>
        </div>
      </div>

      <!-- Win overlay -->
      <div class="gv-win-overlay" id="gv-win-overlay" style="display:none;">
        <div class="gv-win-card">
          <div class="gv-win-emoji">🏆</div>
          <div class="gv-win-text" id="gv-win-text"></div>
          <button class="gv-win-play-again" id="gv-play-again">Play Again</button>
          <button class="gv-win-gallery" id="gv-win-gallery">Back to Gallery</button>
        </div>
      </div>
    `

    // Back button
    el.querySelector('#gv-back').addEventListener('click', () => {
      this._cleanup()
      this._onBack()
    })

    // Setup: build player count buttons
    const countRow = el.querySelector('#gv-count-row')
    const options = [
      { label: '1 vs AI', value: '1ai' },
      { label: '2',       value: 2 },
      { label: '3',       value: 3 },
      { label: '4',       value: 4 },
    ]
    let selectedCount = '1ai'
    options.forEach(opt => {
      const btn = document.createElement('button')
      btn.className = 'gv-count-btn' + (opt.value === selectedCount ? ' selected' : '')
      btn.textContent = opt.label
      btn.addEventListener('click', () => {
        selectedCount = opt.value
        countRow.querySelectorAll('.gv-count-btn').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
      })
      countRow.appendChild(btn)
    })

    el.querySelector('#gv-start').addEventListener('click', () => {
      this._initGame(selectedCount)
    })

    // Win overlay buttons
    el.querySelector('#gv-play-again').addEventListener('click', () => {
      el.querySelector('#gv-win-overlay').style.display = 'none'
      this._showSetup()
    })
    el.querySelector('#gv-win-gallery').addEventListener('click', () => {
      this._cleanup()
      this._onBack()
    })

    return el
  }

  // ── Setup ────────────────────────────────────────────────────────────────

  _showSetup() {
    this._el.querySelector('#gv-setup').style.display      = 'flex'
    this._el.querySelector('#gv-game-area').style.display  = 'none'
    this._el.querySelector('#gv-win-overlay').style.display = 'none'
    this._el.querySelector('#gv-title').textContent = this._board.name
    this._el.querySelector('#gv-setup-board-name').textContent = this._board.name
    // Reset selected button
    const countRow = this._el.querySelector('#gv-count-row')
    countRow.querySelectorAll('.gv-count-btn').forEach((b, i) => {
      b.classList.toggle('selected', i === 0)
    })
  }

  // ── Game init ────────────────────────────────────────────────────────────

  _initGame(countOrMode) {
    const vsAI = countOrMode === '1ai'
    const numPlayers = vsAI ? 2 : countOrMode

    // Pick tokens (random, no duplicates if possible)
    const shuffled = [...this._tokenUrls].sort(() => Math.random() - 0.5)
    const players = Array.from({ length: numPlayers }, (_, i) => ({
      id:       i,
      name:     vsAI && i === 1 ? 'AI' : PLAYER_NAMES[i],
      color:    PLAYER_COLORS[i],
      tokenUrl: shuffled[i % shuffled.length],
      position: this._board.startSquare,
      isAI:     vsAI && i === 1,
    }))

    this._engine = new GameEngine(this._board, players)
    this._busy   = false

    // Build tokens and player cards FIRST so they exist when the image loads
    this._buildTokens(players)
    this._buildPlayerCards(players)

    // DiceAnimator bound to board-wrap
    this._animator = new DiceAnimator(this._el.querySelector('#gv-board-wrap'))

    // Board image — set src after tokens are in DOM
    const boardImg = this._el.querySelector('#gv-board-img')
    boardImg.onload = () => {
      this._recalcScale()
      this._placeAllTokens()
    }
    boardImg.src = this._board.imageUrl
    // Already cached (e.g. coming back from gallery)
    if (boardImg.complete && boardImg.naturalWidth) {
      this._recalcScale()
      this._placeAllTokens()
    }

    // Log
    this._clearLog()
    this._log(`Game started — ${players.map(p => p.name).join(', ')}`)

    // Show game area
    this._el.querySelector('#gv-setup').style.display     = 'none'
    this._el.querySelector('#gv-game-area').style.display = 'block'

    // ResizeObserver to keep token positions correct
    if (this._resizeObs) this._resizeObs.disconnect()
    this._resizeObs = new ResizeObserver(() => {
      this._recalcScale()
      this._placeAllTokens()
    })
    this._resizeObs.observe(boardImg)

    this._updateUI()
    this._scheduleAIIfNeeded()
  }

  // ── Coordinate scaling ───────────────────────────────────────────────────

  _recalcScale() {
    const img = this._el.querySelector('#gv-board-img')
    if (!img.naturalWidth) return
    // img is sized with max-width/max-height; clientWidth = actual rendered width
    this._scale = img.clientWidth / img.naturalWidth
  }

  _screenPos(nativeX, nativeY) {
    return { x: nativeX * this._scale, y: nativeY * this._scale }
  }

  // ── Token management ─────────────────────────────────────────────────────

  _buildTokens(players) {
    const layer = this._el.querySelector('#gv-token-layer')
    // Clear old tokens
    layer.innerHTML = ''
    this._tokens.clear()

    players.forEach(player => {
      const img = document.createElement('img')
      img.src = player.tokenUrl
      img.className = 'gv-token'
      img.style.cssText = `
        position:absolute;
        width:${TOKEN_PX}px; height:${TOKEN_PX}px;
        transform:translate(-50%,-50%);
        pointer-events:none;
        border:3px solid ${player.color};
        border-radius:50%;
        background:#fff;
        padding:2px;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
        transition:left ${STEP_MS}ms ease, top ${STEP_MS}ms ease;
        z-index:${10 + player.id};
      `
      layer.appendChild(img)
      this._tokens.set(player.id, img)
    })
  }

  _placeAllTokens() {
    for (const player of this._engine.players) {
      this._snapToken(player, player.position)
    }
  }

  _snapToken(player, sqId) {
    const sq = this._engine.squareMap.get(sqId)
    if (!sq) return
    const { x, y } = this._screenPos(sq.x, sq.y)
    const [dx, dy]  = this._stackOffset(player, sqId)
    const el = this._tokens.get(player.id)
    el.style.transition = 'none'
    el.style.left = (x + dx) + 'px'
    el.style.top  = (y + dy) + 'px'
  }

  // Small positional offset so stacked tokens on the same square don't fully overlap
  _stackOffset(player, sqId) {
    const OFFSETS = [[0,0],[16,-12],[-16,-12],[0,16]]
    const here = this._engine.players.filter(p => p.position === sqId)
    const idx  = here.indexOf(player)
    return OFFSETS[Math.min(idx < 0 ? 0 : idx, 3)]
  }

  // ── Animation helpers ─────────────────────────────────────────────────────

  async _animateSteps(player, path) {
    const el = this._tokens.get(player.id)
    el.style.transition = `left ${STEP_MS}ms ease, top ${STEP_MS}ms ease`
    for (const sqId of path) {
      const sq = this._engine.squareMap.get(sqId)
      if (!sq) continue
      const { x, y } = this._screenPos(sq.x, sq.y)
      el.style.left = x + 'px'
      el.style.top  = y + 'px'
      await delay(STEP_MS + 15)
    }
  }

  async _animateSlide(player, fromId, toId, type) {
    const sq = this._engine.squareMap.get(toId)
    if (!sq) return
    const { x, y } = this._screenPos(sq.x, sq.y)
    const el = this._tokens.get(player.id)

    // Brief pause so the player can see where they landed before sliding
    await delay(220)

    // Color flash to signal snake/ladder
    el.style.transition = 'none'
    el.style.borderColor = type === 'snake' ? '#d43030' : '#2ea84a'
    await delay(60)

    el.style.transition = `left ${SLIDE_MS}ms cubic-bezier(0.4,0,0.2,1), top ${SLIDE_MS}ms cubic-bezier(0.4,0,0.2,1)`
    el.style.left = x + 'px'
    el.style.top  = y + 'px'
    await delay(SLIDE_MS + 60)

    // Restore player border color
    el.style.borderColor = player.color
  }

  // ── Game loop ─────────────────────────────────────────────────────────────

  async _handleRoll() {
    if (this._busy || this._engine.gameOver) return
    this._busy = true
    this._setRollEnabled(false)

    const player = this._engine.currentPlayer
    this._log(`${player.name} is rolling…`)

    // 1. Roll dice (DiceAnimator shows cowrie shell animation)
    const roll = await this._animator.rollDice()
    this._setRollResult(roll)
    this._log(`${player.name} rolled ${roll}`)

    // 2. Calculate
    const result = this._engine.calculateMove(roll)

    if (result.noMove) {
      this._log(`${player.name} cannot move — needs exact roll to reach the end`)
      await delay(400)
      this._engine.advanceTurn()
      this._busy = false
      this._updateUI()
      this._scheduleAIIfNeeded()
      return
    }

    // 3. Step-by-step walk
    await this._animateSteps(player, result.path)

    // 4. Snake / Ladder
    if (result.transition) {
      const t = result.transition
      const verb = t.type === 'snake' ? '🐍 Snake! Slides down' : '🪜 Ladder! Climbs up'
      this._log(`${verb} — ${player.name} goes from ${t.from} → ${t.to}`)
      await this._animateSlide(player, t.from, t.to, t.type)
    }

    // 5. Commit to engine state
    this._engine.applyMove(result)
    this._placeAllTokens()

    // 6. Win check
    if (result.won) {
      this._log(`🏆 ${player.name} wins!`)
      await delay(600)
      this._showWin(player)
      this._busy = false
      return
    }

    // 7. Advance turn
    this._engine.advanceTurn()
    this._busy = false
    this._updateUI()
    this._scheduleAIIfNeeded()
  }

  _scheduleAIIfNeeded() {
    if (!this._engine.gameOver && this._engine.currentPlayer.isAI) {
      this._setRollEnabled(false)
      setTimeout(() => this._handleRoll(), AI_DELAY)
    }
  }

  // ── UI updates ─────────────────────────────────────────────────────────────

  _buildPlayerCards(players) {
    const panel = this._el.querySelector('#gv-players-panel')
    panel.innerHTML = ''
    for (const p of players) {
      const card = document.createElement('div')
      card.className = 'gv-player-card'
      card.id = `gv-pcard-${p.id}`
      card.innerHTML = `
        <img class="gv-pcard-token" src="${p.tokenUrl}" style="border-color:${p.color}" />
        <div class="gv-pcard-info">
          <span class="gv-pcard-name">${p.name}</span>
          <span class="gv-pcard-pos" id="gv-ppos-${p.id}">Square ${p.position}</span>
        </div>
        <span class="gv-pcard-indicator" id="gv-pind-${p.id}"></span>
      `
      panel.appendChild(card)
    }
  }

  _updateUI() {
    const current = this._engine.currentPlayer
    for (const p of this._engine.players) {
      const card = this._el.querySelector(`#gv-pcard-${p.id}`)
      const pos  = this._el.querySelector(`#gv-ppos-${p.id}`)
      const ind  = this._el.querySelector(`#gv-pind-${p.id}`)
      if (!card) continue
      card.classList.toggle('active', p.id === current.id)
      pos.textContent = `Square ${p.position}`
      ind.textContent = p.id === current.id ? '▶' : ''
    }

    const isHumanTurn = !this._engine.currentPlayer.isAI && !this._engine.gameOver
    this._setRollEnabled(isHumanTurn && !this._busy)
    this._setRollResult('')
  }

  _setRollEnabled(enabled) {
    const btn = this._el.querySelector('#gv-roll-btn')
    btn.disabled = !enabled
    btn.textContent = enabled ? 'Roll' : this._engine?.currentPlayer?.isAI ? 'AI rolling…' : 'Roll'

    if (!btn._listenerAdded) {
      btn.addEventListener('click', () => this._handleRoll())
      btn._listenerAdded = true
    }
  }

  _setRollResult(text) {
    this._el.querySelector('#gv-roll-result').textContent = text ? `Rolled: ${text}` : ''
  }

  // ── Game log ───────────────────────────────────────────────────────────────

  _log(msg) {
    const log = this._el.querySelector('#gv-log')
    const entry = document.createElement('div')
    entry.className = 'gv-log-entry'
    entry.textContent = msg
    log.appendChild(entry)
    log.scrollTop = log.scrollHeight
  }

  _clearLog() {
    this._el.querySelector('#gv-log').innerHTML = ''
    this._setRollResult('')
  }

  // ── Win screen ─────────────────────────────────────────────────────────────

  _showWin(player) {
    const overlay = this._el.querySelector('#gv-win-overlay')
    this._el.querySelector('#gv-win-text').textContent = `${player.name} wins!`
    overlay.style.display = 'flex'
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  _cleanup() {
    if (this._resizeObs) { this._resizeObs.disconnect(); this._resizeObs = null }
    this._engine   = null
    this._animator = null
    this._busy     = false
    this.hide()
  }
}
