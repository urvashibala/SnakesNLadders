/**
 * Cowrie Dice Animator
 * Animates 6 cowrie shells with transparent background
 * Returns a Promise that resolves with the final score
 */

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const NUM_SHELLS = 6;
const SHELL_RADIUS = 50;
const MIN_DISTANCE = 110;
const MARGIN = 60;
const THROW_X = CANVAS_WIDTH / 2;
const THROW_Y = CANVAS_HEIGHT / 2;
const ANIMATION_FRAMES = 30;

export class DiceAnimator {
  constructor(containerElement) {
    this.container = containerElement;
    this.canvas = null;
    this.ctx = null;
    this.cowrieUpImg = null;
    this.cowrieDownImg = null;
    this.imagesLoaded = false;
  }

  async loadImages() {
    if (this.imagesLoaded) return;

    return Promise.all([
      this._loadImage('/cowrieup.png'),
      this._loadImage('/cowriedown.png')
    ]).then(([up, down]) => {
      this.cowrieUpImg = up;
      this.cowrieDownImg = down;
      this.imagesLoaded = true;
    });
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  _calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  _canPlaceShell(x, y, existingShells) {
    for (const [sx, sy] of existingShells) {
      if (this._calculateDistance(x, y, sx, sy) < MIN_DISTANCE) {
        return false;
      }
    }
    return true;
  }

  _generatePositions() {
    const positions = [];
    for (let i = 0; i < NUM_SHELLS; i++) {
      let placed = false;
      while (!placed) {
        const x = Math.random() * (CANVAS_WIDTH - 2 * MARGIN - 2 * SHELL_RADIUS) + MARGIN + SHELL_RADIUS;
        const y = Math.random() * (CANVAS_HEIGHT - 2 * MARGIN - 2 * SHELL_RADIUS) + MARGIN + SHELL_RADIUS;
        if (this._canPlaceShell(x, y, positions)) {
          positions.push([x, y]);
          placed = true;
        }
      }
    }
    return positions;
  }

  _rollShells() {
    return Array(NUM_SHELLS).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
  }

  _calculateScore(states) {
    const upCount = states.reduce((a, b) => a + b, 0);
    return upCount === 0 ? 12 : upCount;
  }

  _smoothStep(value) {
    value = Math.max(0, Math.min(1, value));
    return value * value * (3 - 2 * value);
  }

  async rollDice() {
    await this.loadImages();

    const finalStates = this._rollShells();
    const finalPositions = this._generatePositions();
    const finalAngles = Array(NUM_SHELLS).fill(0).map(() => Math.random() * 360);
    const score = this._calculateScore(finalStates);

    // Setup canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '50%';
    this.canvas.style.left = '50%';
    this.canvas.style.transform = 'translate(-50%, -50%)';
    this.canvas.style.zIndex = '1000';
    this.ctx = this.canvas.getContext('2d');

    this.container.appendChild(this.canvas);

    // Animation parameters
    const startPositions = Array(NUM_SHELLS).fill(0).map(() => [
      THROW_X + (Math.random() - 0.5) * 24,
      THROW_Y + (Math.random() - 0.5) * 24
    ]);
    const flipFrames = Array(NUM_SHELLS).fill(0).map(() => Math.floor(Math.random() * 14) + 5);
    const settleFrames = Array(NUM_SHELLS).fill(0).map(() => Math.floor(Math.random() * 8) + 20);
    const arcHeights = Array(NUM_SHELLS).fill(0).map(() => Math.random() * 38 + 24);
    const spinDirections = Array(NUM_SHELLS).fill(0).map(() => Math.random() > 0.5 ? 1 : -1);
    const tossNoise = Array(NUM_SHELLS).fill(0).map(() => Math.random() * 0.7 + 0.4);
    const flipChances = Array(NUM_SHELLS).fill(0).map(() => Math.random() * 0.18 + 0.16);
    const settledStates = Array(NUM_SHELLS).fill(1);

    // Animation loop
    return new Promise((resolve) => {
      let frameIndex = 0;

      const animate = () => {
        // Clear canvas with transparent background
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const progress = this._smoothStep(frameIndex / Math.max(1, ANIMATION_FRAMES - 1));
        const tossWave = Math.sin(progress * Math.PI * 4);

        // Draw shells
        for (let i = 0; i < NUM_SHELLS; i++) {
          const [startX, startY] = startPositions[i];
          const [endX, endY] = finalPositions[i];
          const arcHeight = arcHeights[i] * Math.sin(progress * Math.PI);

          let travelX = startX + (endX - startX) * progress;
          let travelY = startY + (endY - startY) * progress - arcHeight * (1 - progress);
          travelY += tossNoise[i] * tossWave * (1 - progress) * 4;

          // Determine shell state
          let shellState = 1;
          if (frameIndex < flipFrames[i]) {
            shellState = 1;
          } else if (frameIndex < settleFrames[i]) {
            if (Math.random() < flipChances[i]) {
              settledStates[i] = 1 - settledStates[i];
            }
            shellState = settledStates[i];
          } else {
            settledStates[i] = finalStates[i];
            shellState = settledStates[i];
          }

          const image = shellState === 1 ? this.cowrieUpImg : this.cowrieDownImg;
          let angle = spinDirections[i] * (960 * (1 - progress)) + finalAngles[i] * progress;

          if (progress >= 0.96) {
            angle = finalAngles[i];
            travelX = endX;
            travelY = endY;
          }

          this._drawRotatedImage(image, travelX, travelY, SHELL_RADIUS, angle);
        }

        frameIndex++;
        if (frameIndex < ANIMATION_FRAMES) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete
          setTimeout(() => {
            this.canvas.remove();
            resolve(score);
          }, 1000);
        }
      };

      animate();
    });
  }

  _drawRotatedImage(image, x, y, radius, angle) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((angle * Math.PI) / 180);
    this.ctx.drawImage(image, -radius, -radius, radius * 2, radius * 2);
    this.ctx.restore();
  }
}
