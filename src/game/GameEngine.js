import { validateBoardConfig } from './boardSchema.js';

function clonePlayer(player, index, startSquare) {
  return {
    id: player.id ?? `player-${index + 1}`,
    name: player.name ?? `Player ${index + 1}`,
    square: startSquare,
    finished: false,
    kind: player.kind ?? 'human'
  };
}

function formatSquare(board, squareId) {
  const square = board.squares.find((item) => item.id === squareId);
  if (!square) {
    return `${squareId} (missing square)`;
  }

  return `${squareId} (${square.x.toFixed(1)}, ${square.y.toFixed(1)})`;
}

export class GameEngine {
  constructor(boardConfig, players = [], options = {}) {
    const validation = validateBoardConfig(boardConfig);
    if (!validation.valid) {
      throw new Error(`Invalid board config: ${validation.errors.join(' | ')}`);
    }

    this.board = boardConfig;
    this.options = {
      overshootRule: options.overshootRule ?? 'cap'
    };
    this.players = players.map((player, index) => clonePlayer(player, index, boardConfig.startSquare));
    this.turnIndex = 0;
    this.turnCount = 0;
    this.transitionMap = new Map();

    for (const transition of boardConfig.transitions) {
      this.transitionMap.set(transition.from, transition);
    }
  }

  currentPlayer() {
    return this.players[this.turnIndex];
  }

  getSquare(square) {
    return this.board.squares.find((item) => item.id === square) ?? null;
  }

  movePlayer(playerIndex, steps) {
    const player = this.players[playerIndex];
    if (!player || player.finished) {
      return { moved: false, reason: 'Player is unavailable.' };
    }

    const startSquare = player.square;
    let landingSquare = startSquare + steps;
    console.log(
      `[movePlayer] ${player.name} starts at ${formatSquare(this.board, startSquare)}, roll ${steps}, landing candidate ${formatSquare(this.board, landingSquare)}`
    );

    if (landingSquare > this.board.winSquare) {
      if (this.options.overshootRule === 'cap') {
        landingSquare = this.board.winSquare;
        console.log(`[movePlayer] Overshoot capped to ${formatSquare(this.board, landingSquare)}`);
      } else if (this.options.overshootRule === 'exact') {
        return { moved: false, reason: 'Exact landing required.' };
      }
    }

    const trace = [startSquare];
    let resolvedSquare = landingSquare;
    const transition = this.transitionMap.get(resolvedSquare) ?? null;

    console.log(
      `[movePlayer] Checking for transition on ${formatSquare(this.board, resolvedSquare)}`
    );

    if (transition) {
      const fromSquare = this.getSquare(transition.from);
      const toSquare = this.getSquare(transition.to);
      trace.push(resolvedSquare, transition.to);
      console.log(
        `[transition] ${transition.type} applies: ${formatSquare(this.board, transition.from)} -> ${formatSquare(this.board, transition.to)}`
      );
      if (fromSquare && toSquare) {
        console.log(
          `[transition-detail] from (${fromSquare.x.toFixed(1)}, ${fromSquare.y.toFixed(1)}) to (${toSquare.x.toFixed(1)}, ${toSquare.y.toFixed(1)})`
        );
      }
      resolvedSquare = transition.to;
    } else {
      console.log(`[movePlayer] No transition on ${formatSquare(this.board, resolvedSquare)}`);
    }

    player.square = resolvedSquare;
    if (resolvedSquare >= this.board.winSquare) {
      player.finished = true;
    }

    console.log(`[movePlayer] Final: ${formatSquare(this.board, startSquare)} -> ${formatSquare(this.board, resolvedSquare)}`);

    return {
      moved: true,
      playerId: player.id,
      from: trace[0],
      to: resolvedSquare,
      trace,
      transition,
      finished: player.finished
    };
  }

  rollAndMove(diceValue, playerIndex = this.turnIndex) {
    if (!Number.isInteger(diceValue) || diceValue < 1) {
      return { moved: false, reason: 'Dice value must be a positive integer.' };
    }

    const result = this.movePlayer(playerIndex, diceValue);
    if (result.moved) {
      this.turnCount += 1;
      this.turnIndex = (this.turnIndex + 1) % this.players.length;
    }
    return {
      diceValue,
      ...result,
      nextPlayerId: this.players.length > 0 ? this.currentPlayer().id : null
    };
  }

  isComplete() {
    return this.players.some((player) => player.finished);
  }

  getAnimationPath(fromSquare, toSquare) {
    const fromPos = this.board.squares.find((s) => s.id === fromSquare);
    const toPos = this.board.squares.find((s) => s.id === toSquare);

    if (!fromPos || !toPos) {
      return [[fromPos?.x ?? 0, fromPos?.y ?? 0], [toPos?.x ?? 0, toPos?.y ?? 0]];
    }

    // Create smooth path between squares
    const path = [];
    const segments = Math.max(10, Math.ceil(Math.sqrt((toPos.x - fromPos.x) ** 2 + (toPos.y - fromPos.y) ** 2) / 20));

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Ease-in-out for smooth animation
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const x = fromPos.x + (toPos.x - fromPos.x) * easeT;
      const y = fromPos.y + (toPos.y - fromPos.y) * easeT;
      path.push([x, y]);
    }

    return path;
  }

  getState() {
    return {
      boardId: this.board.id,
      turnIndex: this.turnIndex,
      turnCount: this.turnCount,
      players: this.players.map((player) => ({ ...player }))
    };
  }
}