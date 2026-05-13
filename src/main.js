import './style.css'
import { boards, tokenUrls } from './boardLoader.js'
import { GalleryView }    from './GalleryView.js'
import { HistoryModal }   from './HistoryModal.js'
import { GameView }       from './game/GameView.js'
import { AboutView }      from './AboutView.js'
import { AnnotatorModal } from './AnnotatorModal.js'

const app = document.getElementById('app')

// ── Views ──────────────────────────────────────────────────────────────────
const gameView = new GameView({
  tokenUrls,
  onBackToGallery: showGallery,
})
app.appendChild(gameView.element)

const galleryView = new GalleryView(boards, {
  onBoardClick:  (board) => historyModal.show(board),
  onRandomClick: () => historyModal.show(boards[Math.floor(Math.random() * boards.length)]),
})
app.appendChild(galleryView.element)

const historyModal   = new HistoryModal((board) => openGame(board))
const aboutView      = new AboutView()
const annotatorModal = new AnnotatorModal()

// ── Navigation ─────────────────────────────────────────────────────────────
function showGallery() {
  gameView.hide()
  galleryView.element.style.display = 'flex'
}

function openGame(board) {
  galleryView.element.style.display = 'none'
  gameView.load(board)
}

// ── Nav buttons injected into both headers ─────────────────────────────────
function makeNavBtn(label, title, onClick) {
  const btn = document.createElement('button')
  btn.className = 'btn-museum'
  btn.textContent = label
  btn.title = title
  btn.addEventListener('click', (e) => { e.stopPropagation(); onClick() })
  return btn
}

// Gallery header buttons
const galleryActions = galleryView.element.querySelector('.header-actions')
galleryActions.prepend(makeNavBtn('About', 'About this project', () => aboutView.show()))
galleryActions.prepend(makeNavBtn('Contribute', 'Contribute a board via the Annotator Tool', () => annotatorModal.show()))

// Music button — added to both gallery and game headers
function makeMusicBtn() {
  const btn = document.createElement('button')
  btn.className = 'btn-museum btn-music'
  btn.textContent = '♫'
  btn.title = 'Mute music'
  btn.setAttribute('data-muted', 'false')
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggleMusic() })
  return btn
}
galleryActions.appendChild(makeMusicBtn())
gameView.element.querySelector('#gv-header-actions').appendChild(makeMusicBtn())

// ── YouTube background music ───────────────────────────────────────────────
let ytPlayer      = null
let musicReady    = false
let musicMuted    = false
let unmutedOnce   = false

window.onYouTubeIframeAPIReady = () => {
  const div = document.createElement('div')
  div.id = 'yt-player-host'
  div.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;top:-2px;left:-2px;'
  document.body.appendChild(div)

  ytPlayer = new YT.Player('yt-player-host', {
    height: '1', width: '1',
    videoId: 'picGOKRr4-0',
    playerVars: {
      autoplay: 1,
      loop: 1,
      playlist: 'picGOKRr4-0',
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
    },
    events: {
      onReady: (e) => {
        musicReady = true
        e.target.mute()         // start muted to satisfy autoplay policy
        e.target.playVideo()
        // Unmute on the user's first click anywhere
        document.addEventListener('click', () => {
          if (!unmutedOnce && !musicMuted) {
            e.target.unMute()
            unmutedOnce = true
            updateMusicBtns()
          }
        }, { once: true })
      },
    },
  })
}

// Load YouTube IFrame API dynamically
;(() => {
  const s = document.createElement('script')
  s.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(s)
})()

function toggleMusic() {
  if (!musicReady) return
  musicMuted = !musicMuted
  if (musicMuted) {
    ytPlayer.mute()
  } else {
    ytPlayer.unMute()
    if (!unmutedOnce) { ytPlayer.playVideo(); unmutedOnce = true }
  }
  updateMusicBtns()
}

function updateMusicBtns() {
  document.querySelectorAll('.btn-music').forEach(btn => {
    btn.textContent = musicMuted ? '🔇' : '♫'
    btn.title       = musicMuted ? 'Unmute music' : 'Mute music'
    btn.setAttribute('data-muted', musicMuted ? 'true' : 'false')
  })
}

// Start on gallery
showGallery()
