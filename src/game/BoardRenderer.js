/**
 * Board Renderer with Token Animation
 * Renders the board image, player tokens, and animates movements
 */

export class BoardRenderer {
  constructor(containerElement, boardConfig, boardImageUrl) {
    this.container = containerElement;
    this.boardConfig = boardConfig;
    this.boardImageUrl = boardImageUrl;
    this.canvas = null;
    this.ctx = null;
    this.boardImage = null;
    this.playerStates = {}; // { playerId: { x, y, color, animating } }
    this.boardImageLoaded = false;
    this.animationQueue = [];
    this.isAnimating = false;
  }

  async loadBoardImage() {
    if (this.boardImageLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.boardImage = img;
        this.boardImageLoaded = true;
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load board image from: ${this.boardImageUrl}`));
      };
      img.src = this.boardImageUrl;
    });
  }

  setup(playerCount) {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size to match board image
    this.canvas.width = this.boardImage.width;
    this.canvas.height = this.boardImage.height;
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.height = 'auto';
    this.canvas.style.display = 'block';
    this.canvas.style.border = '1px solid #ccc';

    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);

    // Initialize player states
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
    for (let i = 0; i < playerCount; i++) {
      this.playerStates[i] = {
        currentSquare: this.boardConfig.startSquare,
        targetSquare: this.boardConfig.startSquare,
        progress: 0,
        color: colors[i]
      };
    }

    // Draw initial state
    this.render();
  }

  async movePlayer(playerId, fromSquare, toSquare, path) {
    // Queue animation
    this.animationQueue.push({
      playerId,
      fromSquare,
      toSquare,
      path,
      duration: path.length * 20 // 20ms per path segment
    });

    if (!this.isAnimating) {
      await this._processQueue();
    }
  }

  async _processQueue() {
    while (this.animationQueue.length > 0) {
      const animation = this.animationQueue.shift();
      await this._animateMovement(animation);
    }
  }

  async _animateMovement(animation) {
    this.isAnimating = true;
    const { playerId, path, duration } = animation;

    return new Promise((resolve) => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Interpolate along the path
        const pathIndex = Math.floor(progress * (path.length - 1));
        const nextIndex = Math.min(pathIndex + 1, path.length - 1);
        const segmentProgress = progress * (path.length - 1) - pathIndex;

        const [x1, y1] = path[pathIndex];
        const [x2, y2] = path[nextIndex];

        const x = x1 + (x2 - x1) * segmentProgress;
        const y = y1 + (y2 - y1) * segmentProgress;

        // Update player position
        this.playerStates[playerId].x = x;
        this.playerStates[playerId].y = y;

        this.render();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };

      animate();
    });
  }

  _getSquarePath(fromSquare, toSquare) {
    // Generate a smooth path between two squares
    const fromPos = this.boardConfig.squares.find((s) => s.id === fromSquare);
    const toPos = this.boardConfig.squares.find((s) => s.id === toSquare);

    if (!fromPos || !toPos) {
      return [[fromPos?.x ?? 0, fromPos?.y ?? 0], [toPos?.x ?? 0, toPos?.y ?? 0]];
    }

    // Create path with intermediate points for smooth animation
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

  updatePlayerSquare(playerId, newSquare) {
    const squarePos = this.boardConfig.squares.find((s) => s.id === newSquare);
    if (squarePos) {
      this.playerStates[playerId].currentSquare = newSquare;
      this.playerStates[playerId].x = squarePos.x;
      this.playerStates[playerId].y = squarePos.y;
      this.render();
    }
  }

  render() {
    if (!this.canvas || !this.boardImage) return;

    // Draw board image
    this.ctx.drawImage(this.boardImage, 0, 0);

    // Draw player tokens
    for (const [playerId, state] of Object.entries(this.playerStates)) {
      this._drawToken(state.x, state.y, state.color, playerId);
    }
  }

  _drawToken(x, y, color, label) {
    const tokenRadius = 32;

    // Draw outer circle (shadow)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.beginPath();
    this.ctx.arc(x, y + 3, tokenRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw token
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, tokenRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw border
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Draw player number
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(String(parseInt(label) + 1), x, y);
  }
}
