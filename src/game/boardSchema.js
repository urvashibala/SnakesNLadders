export function validateBoardConfig(board) {
  const errors = [];

  if (!board || typeof board !== 'object') {
    return { valid: false, errors: ['Board config must be an object.'] };
  }

  const requiredStringFields = ['id', 'name', 'imageUrl'];
  for (const field of requiredStringFields) {
    if (typeof board[field] !== 'string' || board[field].trim().length === 0) {
      errors.push(`Missing or invalid string field: ${field}`);
    }
  }

  if (!Number.isInteger(board.totalSquares) || board.totalSquares < 1) {
    errors.push('totalSquares must be a positive integer.');
  }

  if (!Number.isInteger(board.startSquare) || board.startSquare < 1) {
    errors.push('startSquare must be a positive integer.');
  }

  if (!Number.isInteger(board.winSquare) || board.winSquare < 1) {
    errors.push('winSquare must be a positive integer.');
  }

  if (!Array.isArray(board.squares)) {
    errors.push('squares must be an array.');
  } else {
    for (const square of board.squares) {
      if (!square || typeof square !== 'object') {
        errors.push('Each square must be an object.');
        continue;
      }

      if (!Number.isInteger(square.id) || square.id < 1) {
        errors.push('Square id must be a positive integer.');
      }

      if (typeof square.x !== 'number' || typeof square.y !== 'number') {
        errors.push(`Square ${square.id ?? '?'} must include numeric x and y coordinates.`);
      }

      if (square.space !== undefined && typeof square.space !== 'number') {
        errors.push(`Square ${square.id ?? '?'} has an invalid space value.`);
      }
    }
  }

  if (!Array.isArray(board.transitions)) {
    errors.push('transitions must be an array.');
  } else {
    for (const transition of board.transitions) {
      if (!transition || typeof transition !== 'object') {
        errors.push('Each transition must be an object.');
        continue;
      }

      if (!['snake', 'ladder', 'jump'].includes(transition.type)) {
        errors.push(`Invalid transition type: ${transition.type}`);
      }

      if (!Number.isInteger(transition.from) || transition.from < 1) {
        errors.push('Transition from must be a positive integer.');
      }

      if (!Number.isInteger(transition.to) || transition.to < 1) {
        errors.push('Transition to must be a positive integer.');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}