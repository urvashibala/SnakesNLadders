// References panel — drawn from project/refs.md

const REFS = [
  {
    section: 'Primary References',
    items: [
      {
        title: 'India Board Games Archive',
        desc: 'Ancient Indian Board Games — a curated archive of historical board games from the Indian subcontinent.',
        url: 'http://indiaboardgamesarchive.in/omekas/s/ancientindianboardgames/page/time',
      },
      {
        title: 'Moksha Patam: The Ancient Game of Snakes and Ladders',
        desc: 'Historical and moral context of the original game and its spiritual philosophy.',
        url: 'https://historified.in/2024/05/19/moksha-patam-the-ancient-game-of-snakes-and-ladders-with-a-spiritual-twist/',
      },
      {
        title: 'On Moksha Patam',
        desc: 'A detailed exploration of Moksha Patam — its origins, symbolism, and evolution.',
        url: 'https://www.danielharper.org/yauu/2014/05/moksha-patam/',
      },
    ],
  },
  {
    section: 'Board References',
    items: [
      {
        title: 'Rebirth: The Tibetan Game of Liberation',
        desc: 'Mark Tatz and Jody Kent. Rider & Company, London, 1978. The primary source on Sakya Pandita\'s 13th-century Tibetan board game.',
        url: 'https://www.himalayanart.org/search/set.cfm?setID=1524',
      },
      {
        title: 'Gyan Chaupar — National Museum of India',
        desc: 'Board image sourced from Wikimedia Commons; original held at the National Museum, India.',
        url: 'https://commons.wikimedia.org/wiki/File:Gyan_Chaupar_National_Museum_India.JPG',
      },
      {
        title: 'Gyan Chaupar (Asia Research News)',
        desc: 'An ancient board game that inspired Snakes and Ladders — background and historical context.',
        url: 'https://www.asiaresearchnews.com/content/gyan-chaupar—-ancient-board-game-inspired-snakes-and-ladders-0',
      },
      {
        title: 'Hindi Jain Board (Wellcome Collection)',
        desc: '19th-century Jain Snakes and Ladders board painted on cloth in gouache. Held in the Wellcome Collection, London.',
        url: 'https://wellcomecollection.org/works/geydgvms',
      },
      {
        title: 'Jnana Chaupada (British Museum)',
        desc: 'Board dated 1834, with rectangular dice and dome-shaped pieces. British Museum collection.',
        url: 'https://www.britishmuseum.org/collection/image/151009001',
      },
      {
        title: 'The Leela Game of Self-Knowledge',
        desc: 'A 2,000–5,000-year-old Indian game of consciousness, still practised as a tool for self-discovery.',
        url: 'https://leela.eu/en/',
      },
      {
        title: 'Kismet (Victoria & Albert Museum)',
        desc: 'Chromolithograph on paper and card, designed in England and manufactured in Bavaria, c.1895. V&A Museum, MISC.423-1981.',
        url: 'https://www.vam.ac.uk/',
      },
    ],
  },
  {
    section: 'Music',
    items: [
      {
        title: 'Background Music',
        desc: 'Traditional Indian music used as the ambient soundtrack for this platform.',
        url: 'https://www.youtube.com/watch?v=picGOKRr4-0',
      },
    ],
  },
]

export class ReferencesView {
  constructor() {
    this._el = this._build()
    document.body.appendChild(this._el)
  }

  _build() {
    const overlay = document.createElement('div')
    overlay.className = 'about-overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')

    const sectionsHtml = REFS.map(section => `
      <div class="refs-section">
        <h2>${section.section}</h2>
        ${section.items.map(item => `
          <div class="ref-item">
            <a class="ref-title" href="${item.url}" target="_blank" rel="noopener">${item.title} ↗</a>
            <p class="ref-desc">${item.desc}</p>
          </div>
        `).join('')}
      </div>
    `).join('')

    overlay.innerHTML = `
      <div class="about-panel">
        <div class="about-header">
          <div>
            <div class="about-header-title">References</div>
            <div class="about-header-sub">Sources &amp; attributions</div>
          </div>
          <button class="about-close" aria-label="Close">✕</button>
        </div>
        <div class="about-body refs-body">${sectionsHtml}</div>
      </div>
    `

    overlay.querySelector('.about-close').addEventListener('click', () => this.hide())
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
