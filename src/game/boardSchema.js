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

  if (!Number.isInteger(board.startSquare) || board.startSquare < 0) {
    errors.push('startSquare must be a non-negative integer.');
  }

  if (!Number.isInteger(board.winSquare) || board.winSquare < 0) {
    errors.push('winSquare must be a non-negative integer.');
  }

  if (!Array.isArray(board.squares)) {
    errors.push('squares must be an array.');
  } else {
    for (const square of board.squares) {
      if (!square || typeof square !== 'object') {
        errors.push('Each square must be an object.');
        continue;
      }

      if (!Number.isInteger(square.id) || square.id < 0) {
        errors.push('Square id must be a non-negative integer.');
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
    const squareIds = new Set(Array.isArray(board.squares) ? board.squares.map((square) => square.id) : []);
    const seenTransitionSources = new Set();

    for (const transition of board.transitions) {
      if (!transition || typeof transition !== 'object') {
        errors.push('Each transition must be an object.');
        continue;
      }

      if (!['snake', 'ladder', 'jump'].includes(transition.type)) {
        errors.push(`Invalid transition type: ${transition.type}`);
      }

      if (!Number.isInteger(transition.from) || transition.from < 0) {
        errors.push('Transition from must be a non-negative integer.');
      }

      if (!Number.isInteger(transition.to) || transition.to < 0) {
        errors.push('Transition to must be a non-negative integer.');
      }

      if (Number.isInteger(transition.from)) {
        if (seenTransitionSources.has(transition.from)) {
          errors.push(`Duplicate transition source detected: ${transition.from}`);
        }
        seenTransitionSources.add(transition.from);
      }

      if (Number.isInteger(transition.from) && !squareIds.has(transition.from)) {
        errors.push(`Transition source square does not exist: ${transition.from}`);
      }

      if (Number.isInteger(transition.to) && !squareIds.has(transition.to)) {
        errors.push(`Transition destination square does not exist: ${transition.to}`);
      }

      if (Number.isInteger(transition.from) && Number.isInteger(transition.to) && transition.from === transition.to) {
        errors.push(`Transition cannot point to itself: ${transition.from}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}