// Full-screen "About This Project" overlay, rendered from the project markdown.

const ABOUT_CONTENT = `
<h2>Nomenclature</h2>
<p>Snakes and ladders, gyan chaupar, jnana bazi and so many more. As this game has evolved over time, which do we settle on for the platform's name? The answer I settled on: none. I didn't want to call it the colonised albeit recognisable English name, or single out any of the Indian original game versions to represent them all.</p>
<p><em>This is Neither Snakes Nor Ladders.</em></p>

<h2>Materiality &amp; Game Experience</h2>
<p>Our ancient gameboards usually sit behind a glass pane in a library or museum that we may never see in person, and most definitely will never touch or play with. This decontextualises the game from its original and only purpose: play.</p>
<p>The versions of the game that we <em>do</em> have access to are commercial, colonial products and not our historical pieces, and so we remain alienated from the history of these games. Personally, I never knew of the rich Indian history behind snakes and ladders growing up, and I wonder if that is because the game never <em>looked</em> Indian.</p>
<p>In "modern" versions, all of the gameboards' history is <strong>abstracted away</strong>. What purpose does this abstraction serve? It cuts away the ornamentation, the philosophy, and the culture. This, of course, was often the product of economic considerations, as a painter could not always be hired to produce royal, richly-ornamented boards.</p>
<p>This was also caused by colonisation and the game's Western variants, which replaced the original religions' philosophies with foreign alternatives and even structural components (namely the dice and tokens, the snakes and ladders being equal in number, the virtues and vices they represented, among others).</p>
<p>However, the benefit of digitisation is replicating the original and distributing it far and wide. This improves accessibility, but more importantly, it gives each of us the ability to experience the game in a similar context as our ancestors.</p>
<p>Imagery and symbolism holds immense value. The American version of the game, for instance, felt that the snake images would scare children and replaced them with chutes, forgetting that the entire purpose of the game was to scare children away from vices.</p>
<p>In the creation of this platform, I prioritised material experience. Each aspect of the game from the boardgame image, the background music, the dice roll to what we call the computer player, must be grounded as much as possible in historical truth and authenticity.</p>

<h3>The Dice</h3>
<p>I animated cowrie shell images to replace the modern dice. It follows these rules:</p>
<blockquote>
  <p>"Down" if turtle-shell side up</p>
  <p>"Up" if mouth of shell is up</p>
  <p>Each open mouth of the cowrie shell denotes 1 point.</p>
  <p>The back of the cowrie shell denotes 0 points.</p>
  <p>If all 6 cowries fall on their open mouths showing only their backs, then it's a full 12 points.</p>
  <p>Possible scores: 1, 2, 3, 4, 5, 6, 12.</p>
</blockquote>
<p>This was the ruleset I narrowed down on after researching and finding about 6 different ways to play with these dice. Like the boards, every aspect of their gameplay has a huge variety of implementations!</p>
<p>Finally, to perfect the feeling of throwing the dice, I conducted a series of experimentations and continually iterated until I created the final product visible on the platform right now.</p>
<p>I also looked into four-sided long dice and plan to incorporate those in the future as an alternative dice option.</p>

<h2>The Tokens</h2>
<p>All tokens are shells native to India. I plan to collect more images of rocks and pebbles, and figurines if available to further populate the collection!</p>

<h2>Nonlinearity</h2>
<p>The museum gallery is deliberately <em>not</em> organised by timeline or century because this would have created a feeling of <em>evolution</em> that would have concluded with the British colonised version of the game. This would have encouraged the thinking that our ancient games were in some way more "primitive", when in fact, they represent a greater amount of artistic effort, ornamentation and notably more complex philosophical ideas and rules.</p>
<p>Rather, I have chosen while designing this site to embrace the game's philosophy of nonlinearity. The boards need not be ordered in any way, and the player is free to navigate, explore and select one to play. There is also a "Random Board" option that allows them to roll the dice on <em>which</em> game they play, which reflects the idea of the Gods determining your experiences in life.</p>
<p>These micro-decisions about the platform experience attempt to extend the logic and philosophy of the game (in a rather meta way) to our learning experiences <em>about</em> the game.</p>

<h2>Expert Historical Narrative</h2>
<p>While researching for this project, I have learnt a great deal about the history and cultural significance of these games. However, I also realise that the depth of their significance is so great, especially when they have religious roots and such variety, that I should not be considered a central authority on them.</p>
<p>I included a historyText field to briefly describe the board in 50 words or less, but have also set up structures for actual experts to contribute their knowledge of each specific gameboard, that would load in parallel to the game. This would allow players to learn about the board <em>as</em> they play, making the learning experience more dynamic, interesting and grounded in play.</p>

<h2>Developing a Non-Technical, Accessible Game Archiving Tool</h2>
<p>The game engine is designed to work irrespective of what the board image looks like. It takes in:</p>
<ul>
  <li>Square grid coordinates</li>
  <li>Transitions (the snakes and ladders), represented as mappings between squares</li>
  <li>ID, Name, historyText, board image, totalSquares, winSquare, startSquare</li>
</ul>
<p>Then it takes all this data in as a JSON and applies the logic to every board without ever looking at the actual image. This allows <em>every</em> board to become playable, regardless of its shape, grid structure, ornamentation, language or readability.</p>
<p>This allowed me to upload circular boards and many whose Hindi and Tamil number systems made me squint and frequently check my number sheet over and over.</p>
<p>I wanted more people to be able to contribute their boards, but how? The game engine I built requires structured input and some technical know-how to write and format JSON data, which would have been a barrier to many amateur archivists.</p>
<p>Our ancient paintings, carvings and games are often very difficult for computers to parse and see, and thus we must be their eyes.</p>
<p>To break this barrier down, I built the <strong>Annotation Tool</strong>.</p>
<blockquote>
  <p>The annotation tool allows a user to click each square from start to finish. Some boards begin at 0, and others at 1. Some end at a nice, even number like 100 and others at 73. There is significance to every decision, and this annotation tool accommodates this.</p>
  <p>To mark the snakes and ladders, simply follow the direction of the drawings and click where it starts from and where it ends. The annotator tool automatically knows that if the start is less than the end number, it must be a ladder, and vice versa a snake.</p>
  <p>Before you submit for review, you can view all your grid annotations and snakes and ladders visually.</p>
  <p>Once submitted for review, I will receive an email with your submitted annotation, check that nothing fishy is going on and perhaps ask you to redo a portion if something is truly incorrect, and then approve it. Once approved, your board is auto-uploaded to the website.</p>
</blockquote>
<p>Though I initially developed it for my own ease of use, I truly hope that making this archiving and board digitisation process accessible will allow this platform to host a large variety of ancient and less-ancient noncommercial boards.</p>
<p>Snakes and ladders, moksha patam, gyan chaupar and other versions of this game are plentiful in their board designs, material decisions, and philosophies, each reflecting their makers' and players' unique cultural contexts.</p>
<p>In opening up this digitisation and archiving process to all users, I hope this platform becomes more and more representative of this game's multitude of versions across histories and geographies.</p>
<p>I imagine it's also rather exciting finding a board that you are usually not allowed to physically handle or play with become something you can actively engage with and play games over, and that feeling makes me very proud of this project.</p>
`

export class AboutView {
  constructor() {
    this._el = this._build()
    document.body.appendChild(this._el)
  }

  _build() {
    const overlay = document.createElement('div')
    overlay.className = 'about-overlay'
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')

    overlay.innerHTML = `
      <div class="about-panel">
        <div class="about-header">
          <div>
            <div class="about-header-title">About This Project</div>
            <div class="about-header-sub">by Urvashi Balasubramaniam</div>
          </div>
          <button class="about-close" aria-label="Close">✕</button>
        </div>
        <div class="about-body">${ABOUT_CONTENT}</div>
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
