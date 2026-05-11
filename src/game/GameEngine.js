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
    this.transitionMap = new Map(boardConfig.transitions.map((transition) => [transition.from, transition]));
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

    let nextSquare = player.square + steps;

    if (nextSquare > this.board.winSquare) {
      if (this.options.overshootRule === 'cap') {
        nextSquare = this.board.winSquare;
      } else if (this.options.overshootRule === 'exact') {
        return { moved: false, reason: 'Exact landing required.' };
      }
    }

    const trace = [player.square];
    let resolvedSquare = nextSquare;
    let safety = 0;

    while (this.transitionMap.has(resolvedSquare) && safety < 10) {
      const transition = this.transitionMap.get(resolvedSquare);
      trace.push(resolvedSquare, transition.to);
      resolvedSquare = transition.to;
      safety += 1;
    }

    player.square = resolvedSquare;
    if (resolvedSquare >= this.board.winSquare) {
      player.finished = true;
    }

    return {
      moved: true,
      playerId: player.id,
      from: trace[0],
      to: resolvedSquare,
      trace,
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

  getState() {
    return {
      boardId: this.board.id,
      turnIndex: this.turnIndex,
      turnCount: this.turnCount,
      players: this.players.map((player) => ({ ...player }))
    };
  }
}