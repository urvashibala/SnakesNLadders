import { boardRegistry } from './game/boardRegistry.js';
import { GameEngine } from './game/GameEngine.js';
import { DiceAnimator } from './game/DiceAnimator.js';
import { BoardRenderer } from './game/BoardRenderer.js';

const app = document.querySelector('#app');

function rollCowrieScore() {
  const shells = Array.from({ length: 6 }, () => (Math.random() < 0.5 ? 0 : 1));
  const upCount = shells.reduce((total, value) => total + value, 0);
  return upCount === 0 ? 12 : upCount;
}

function renderHomePage() {
  const boards = boardRegistry.list();

  app.innerHTML = `
    <h1>Ancient board games</h1>
    <p>Select a board.</p>
    <section>
      ${boards
        .map(
          (board) => `
            <p>
              <button type="button" data-board="${board.id}">${board.name}</button>
            </p>
          `
        )
        .join('')}
    </section>
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

async function renderGamePage(boardId) {
  const boardMeta = boardRegistry.getById(boardId);
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
    <div style="display: flex; gap: 20px; min-height: 100vh;">
      <div style="flex: 1;">
        <h1>${boardMeta.group}</h1>
        <p>${boardMeta.title}</p>
        <p>${boardConfig.totalSquares} squares</p>
        <p><strong>Board ID: ${boardConfig.id}</strong></p>
        <p><strong>Start Square: ${boardConfig.startSquare}</strong></p>
        <p><strong>Transitions: ${boardConfig.transitions.length}</strong></p>
        <p>Current turn: <span id="turn-player">${engine.currentPlayer().name}</span></p>
        <p>Last roll: <span id="last-roll">none</span></p>
        <p>Last move: <span id="last-move">none</span></p>
        <button type="button" id="roll" style="padding: 10px 20px; font-size: 16px;">Roll Dice</button>
        <button type="button" id="back" style="padding: 10px 20px; font-size: 16px; margin-left: 10px;">Back</button>
        <h2>Players</h2>
        <ul id="players">${renderPlayerRows(engine)}</ul>
      </div>
      <div style="flex: 1.5; position: relative; min-height: 400px;">
        <div id="board-container" style="position: relative; display: inline-block; width: 100%;"></div>
      </div>
    </div>
  `;

  // Initialize board renderer
  const boardContainer = document.querySelector('#board-container');
  const boardRenderer = new BoardRenderer(boardContainer, boardConfig, boardMeta.imageUrl);
  
  try {
    await boardRenderer.loadBoardImage();
    boardRenderer.setup(engine.players.length);
    
    // Position players on starting square
    for (let i = 0; i < engine.players.length; i++) {
      boardRenderer.updatePlayerSquare(i, engine.players[i].square);
    }
  } catch (error) {
    console.error('Failed to initialize board:', error);
    boardContainer.innerHTML = `<p style="color: red;">Error loading board: ${error.message}</p>`;
    return;
  }

  const rollButton = document.querySelector('#roll');
  const backButton = document.querySelector('#back');
  const playersList = document.querySelector('#players');
  const turnPlayer = document.querySelector('#turn-player');
  const lastRoll = document.querySelector('#last-roll');
  const lastMove = document.querySelector('#last-move');
  const diceAnimator = new DiceAnimator(boardContainer);

  let isRolling = false;

  rollButton.addEventListener('click', async () => {
    if (isRolling) return;
    isRolling = true;
    rollButton.disabled = true;

    // Play dice animation
    const diceValue = await diceAnimator.rollDice();

    // Perform move
    const movingPlayerIndex = engine.turnIndex;
    const movingPlayer = engine.currentPlayer();
    const result = engine.rollAndMove(diceValue);

    // Animate token movement across the rolled path and any transitions.
    if (result.moved) {
      const animationSquares = [result.from];

      for (let i = 1; i < result.trace.length; i += 2) {
        animationSquares.push(result.trace[i + 1]);
      }

      if (animationSquares[animationSquares.length - 1] !== result.to) {
        animationSquares.push(result.to);
      }

      for (let i = 0; i < animationSquares.length - 1; i += 1) {
        const currentSquare = animationSquares[i];
        const nextSquare = animationSquares[i + 1];
        const path = engine.getAnimationPath(currentSquare, nextSquare);
        await boardRenderer.movePlayer(movingPlayerIndex, currentSquare, nextSquare, path);
      }

      boardRenderer.updatePlayerSquare(movingPlayerIndex, result.to);
    }

    // Update UI
    playersList.innerHTML = renderPlayerRows(engine);
    turnPlayer.textContent = engine.currentPlayer().name;
    lastRoll.textContent = String(diceValue);
    if (result.moved) {
      const moveText = `${movingPlayer.name}: ${result.from} -> ${result.to}`;
      lastMove.textContent = result.transition
        ? `${moveText} (${result.transition.type} ${result.transition.from} -> ${result.transition.to})`
        : moveText;
    } else {
      lastMove.textContent = result.reason;
    }

    rollButton.disabled = false;
    isRolling = false;
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