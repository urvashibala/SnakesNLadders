import { boardRegistry } from './game/boardRegistry.js';
import { GameEngine } from './game/GameEngine.js';
import { getBoardById, getBoardGroups } from './game/boardCatalog.js';

const app = document.querySelector('#app');

function rollCowrieScore() {
  const shells = Array.from({ length: 6 }, () => (Math.random() < 0.5 ? 0 : 1));
  const upCount = shells.reduce((total, value) => total + value, 0);
  return upCount === 0 ? 12 : upCount;
}

function renderHomePage() {
  const groups = getBoardGroups();

  app.innerHTML = `
    <h1>Ancient board games</h1>
    <p>Select a board.</p>
    ${groups
      .map(
        (group) => `
          <section>
            <h2>${group.group}</h2>
            ${group.boards
              .map(
                (board) => `
                  <p>
                    <button type="button" data-board="${board.id}">${board.title}</button>
                    ${board.playable ? '' : '<span> not wired yet</span>'}
                  </p>
                `
              )
              .join('')}
          </section>
        `
      )
      .join('')}
  `;

  app.querySelectorAll('button[data-board]').forEach((button) => {
    button.addEventListener('click', () => {
      const boardId = button.getAttribute('data-board');
      window.location.search = `?board=${encodeURIComponent(boardId)}`;
    });
  });
}

function renderPlayerRows(engine) {
  return engine.players
    .map(
      (player) => `<li>${player.name}: square ${player.square}${player.finished ? ' (finished)' : ''}</li>`
    )
    .join('');
}

function renderGamePage(boardId) {
  const boardMeta = getBoardById(boardId);
  const boardConfig = boardRegistry.getById(boardId);

  if (!boardMeta) {
    app.innerHTML = `
      <p>Unknown board.</p>
      <button type="button" id="back">Back</button>
    `;
    document.querySelector('#back').addEventListener('click', () => {
      window.location.search = '';
    });
    return;
  }

  if (!boardConfig) {
    app.innerHTML = `
      <h1>${boardMeta.group}</h1>
      <p>${boardMeta.title}</p>
      <p>This board is not wired yet.</p>
      <button type="button" id="back">Back</button>
    `;
    document.querySelector('#back').addEventListener('click', () => {
      window.location.search = '';
    });
    return;
  }

  const engine = new GameEngine(boardConfig, [
    { name: 'Player 1' },
    { name: 'Player 2' }
  ]);

  app.innerHTML = `
    <h1>${boardMeta.group}</h1>
    <p>${boardMeta.title}</p>
    <p>${boardConfig.totalSquares} squares</p>
    <p>Current turn: <span id="turn-player">${engine.currentPlayer().name}</span></p>
    <p>Last roll: <span id="last-roll">none</span></p>
    <p>Last move: <span id="last-move">none</span></p>
    <button type="button" id="roll">Roll</button>
    <button type="button" id="back">Back</button>
    <h2>Players</h2>
    <ul id="players">${renderPlayerRows(engine)}</ul>
    <h2>Board</h2>
    <img src="${boardMeta.imageUrl}" alt="${boardMeta.group}" style="max-width: 100%; height: auto;" />
  `;

  const rollButton = document.querySelector('#roll');
  const backButton = document.querySelector('#back');
  const playersList = document.querySelector('#players');
  const turnPlayer = document.querySelector('#turn-player');
  const lastRoll = document.querySelector('#last-roll');
  const lastMove = document.querySelector('#last-move');

  rollButton.addEventListener('click', () => {
    const diceValue = rollCowrieScore();
    const movingPlayer = engine.currentPlayer();
    const result = engine.rollAndMove(diceValue);

    playersList.innerHTML = renderPlayerRows(engine);
    turnPlayer.textContent = engine.currentPlayer().name;
    lastRoll.textContent = String(diceValue);
    lastMove.textContent = result.moved
      ? `${movingPlayer.name}: ${result.from} → ${result.to}`
      : result.reason;
  });

  backButton.addEventListener('click', () => {
    window.location.search = '';
  });
}

const boardId = new URLSearchParams(window.location.search).get('board');

if (boardId) {
  renderGamePage(boardId);
} else {
  renderHomePage();
}