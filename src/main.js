import './style.css'
import { boards, tokenUrls } from './boardLoader.js'
import { GalleryView }  from './GalleryView.js'
import { HistoryModal } from './HistoryModal.js'
import { GameView }     from './game/GameView.js'

const app = document.getElementById('app')

// ── Game view ──────────────────────────────────────────────────────────────
const gameView = new GameView({
  tokenUrls,
  onBackToGallery: showGallery,
})
app.appendChild(gameView.element)

// ── Gallery view ───────────────────────────────────────────────────────────
const galleryView = new GalleryView(boards, {
  onBoardClick:  (board) => historyModal.show(board),
  onRandomClick: () => historyModal.show(boards[Math.floor(Math.random() * boards.length)]),
})
app.appendChild(galleryView.element)

// ── History modal ──────────────────────────────────────────────────────────
const historyModal = new HistoryModal((board) => openGame(board))

// ── Navigation ─────────────────────────────────────────────────────────────
function showGallery() {
  gameView.hide()
  galleryView.element.style.display = 'flex'
}

function openGame(board) {
  galleryView.element.style.display = 'none'
  gameView.load(board)
}

// Start on gallery
showGallery()
