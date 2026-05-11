import sakyaPanditaBoard from '../boards/sakya_pandita1.json' with { type: 'json' };
import { validateBoardConfig } from './boardSchema.js';

const boards = [sakyaPanditaBoard];

for (const board of boards) {
  const validation = validateBoardConfig(board);
  if (!validation.valid) {
    throw new Error(`Invalid board registry entry for ${board.id}: ${validation.errors.join(' | ')}`);
  }
}

export const boardRegistry = {
  list() {
    return boards.map((board) => ({ id: board.id, name: board.name, totalSquares: board.totalSquares }));
  },

  getById(id) {
    return boards.find((board) => board.id === id) ?? null;
  },

  getDefaultBoard() {
    return boards[0];
  }
};