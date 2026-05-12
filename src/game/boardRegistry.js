import { validateBoardConfig } from './boardSchema.js';

// Dynamically import all JSON boards under src/boards using Vite's glob
// This makes the registry automatically include any new board JSONs added to the folder.
const modules = import.meta.glob('../boards/*.json', { eager: true, as: 'json' });

const boards = [];
for (const key of Object.keys(modules)) {
  const board = modules[key];
  const validation = validateBoardConfig(board);
  if (!validation.valid) {
    // Fail fast so broken board files are obvious during development
    throw new Error(`Invalid board registry entry for ${board?.id ?? key}: ${validation.errors.join(' | ')}`);
  }
  boards.push(board);
}

export const boardRegistry = {
  list() {
    return boards.map((board) => ({
      id: board.id,
      name: board.name,
      totalSquares: board.totalSquares,
      imageUrl: board.imageUrl
    }));
  },

  getById(id) {
    return boards.find((board) => board.id === id) ?? null;
  },

  getDefaultBoard() {
    return boards[0] ?? null;
  }
};