/**
 * Pure game-logic engine — no DOM.
 * Works for both 0-indexed (startSquare=0) and 1-indexed (startSquare=1) boards.
 * All square IDs are consecutive integers startSquare … winSquare.
 */
export class GameEngine {
  constructor(boardData, players) {
    this.board       = boardData
    this.players     = players
    this.squareMap   = new Map(boardData.squares.map(s => [s.id, s]))
    // Build transition map: landingSquareId → transition object
    this.transitionMap = new Map()
    for (const t of boardData.transitions ?? []) {
      this.transitionMap.set(t.from, t)
    }
    this.currentPlayerIndex = 0
    this.gameOver = false
    this.winner   = null

    // Place every player on the start square
    for (const p of players) p.position = boardData.startSquare
  }

  get currentPlayer() { return this.players[this.currentPlayerIndex] }

  /**
   * Calculate what happens when the current player rolls `roll`.
   *
   * Returns one of:
   *   { noMove: true, roll }          — overshot winSquare, token stays put
   *   { path, transition, finalPos, won, roll }
   *
   * path       — array of square IDs the token walks through (start+1 … newPos)
   * transition — null | { type:'snake'|'ladder', from, to }
   * finalPos   — square ID where token ends up after any transition
   * won        — true if finalPos === winSquare
   */
  calculateMove(roll) {
    const { position: currentPos } = this.currentPlayer
    const { winSquare } = this.board
    const newPos = currentPos + roll

    // Must land EXACTLY on winSquare — overshooting means no move
    if (newPos > winSquare) return { noMove: true, roll }

    const path = []
    for (let i = currentPos + 1; i <= newPos; i++) {
      if (this.squareMap.has(i)) path.push(i)
    }

    const transition = this.transitionMap.get(newPos) ?? null
    const finalPos   = transition ? transition.to : newPos
    const won        = finalPos === winSquare

    return { path, transition, finalPos, won, roll }
  }

  /** Commit the move to engine state (call AFTER animations finish). */
  applyMove(result) {
    if (result.noMove) return
    this.currentPlayer.position = result.finalPos
    if (result.won) {
      this.gameOver = true
      this.winner   = this.currentPlayer
    }
  }

  advanceTurn() {
    if (!this.gameOver) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
    }
  }
}
