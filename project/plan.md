# Plan: Indian Ancient Board Games Engine

## TL;DR
Build a modular, data-driven web game engine using Phaser 3 that:
- Runs the same game logic for all 17 boards (uniform engine)
- Loads board-specific data from JSON configs (coordinates, snakes, ladders, images)
- Supports 2-4 local players + basic AI opponent
- Integrates the cowrie dice animation we developed as the roll mechanic
- Uses pixel coordinates with token spacing to prevent overlap

## Steps

### Phase 1: Architecture & Foundation
1. Game Engine Core – universal state & logic (no Phaser dependency)
2. Board Config System – JSON schema per board
3. Phaser Scene Structure – BoardSelect, Game, Result scenes
4. Token Management – multi-token positioning with spacing
5. Dice Integration – reuse cowrie animation

### Phase 2: Game Logic Layer
6. Player & AI classes
7. AI Opponent (random moves, basic logic)
8. Move Resolution (validation, snake/ladder detection)

### Phase 3: UI & Visuals
9. Game UI (buttons, player indicator, leaderboard)
10. Board Rendering (image background + overlaid tokens)
11. Animations & Polish (movements, snakes, ladders, dice)

### Phase 4: Board Config & Testing
12. Board JSON schema (pixel coords, snakes, ladders)
13. Validation testing (2–4 player scenarios)
14. Deployment

## Board JSON Format (Proposed)

```json
{
  "boardname": "Sakya Pandita - Rebirth",
  "boardImageUrl": "boards/sakya_pandita1.jpg",
  "totalSquares": 104,
  "squares": [
    { "id": 1, "x": 100, "y": 500, "space": 30 },
    { "id": 2, "x": 130, "y": 500, "space": 30 },
    ...
  ],
  "snakes": [
    { "head": 16, "tail": 6 },
    { "head": 47, "tail": 26 }
  ],
  "ladders": [
    { "base": 3, "top": 22 },
    { "base": 8, "top": 31 }
  ],
  "startSquare": 1,
  "winSquare": 104
}
```

- `space`: pixel offset zone for multiple tokens on same square
- Snakes/ladders automatically applied when landed

## File Structure

```
src/
  game/
    GameEngine.js       (move logic, snake/ladder, win check)
    AIPlayer.js         (basic random strategy)
    TokenManager.js     (positioning, spacing)
  scenes/
    BootScene.js        (load assets)
    BoardSelectScene.js (pick game & players)
    GameScene.js        (main gameplay)
    ResultScene.js      (win screen)
  boards/
    board_sakya_pandita1.json
    board_gyan_chaupar.json
    ... (17 total)
  dice/
    DiceRoller.js       (wrapper around cowrie animation)
```

## Key Decisions from User Input

- Coordinate system: **Pixel-based (x,y) + space offset**
- Visuals: **Board images as background**
- Players: **2–4 local**
- AI: **Single difficulty, random**
- Snake/Ladder format: **Flag + destination pointer**
- Tech: **Flexible (recommend Phaser 3 for consistency with dice)**

## Next Action

Present plan to user for review & approval.
