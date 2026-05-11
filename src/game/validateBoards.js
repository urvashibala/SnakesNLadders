import { boardRegistry } from './boardRegistry.js';

for (const board of boardRegistry.list()) {
  console.log(`${board.id}: ${board.name} (${board.totalSquares} squares)`);
}