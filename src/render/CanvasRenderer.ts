// src/render/CanvasRenderer.ts - High-DPI Board & Shape Renderer
import { Board } from '../core/Board.ts';
import { HandSlot, ShapeDefinition, PaletteId } from '../core/Types.ts';
import { ParticleSystem } from './ParticleSystem.ts';
import { BackgroundEffects } from './BackgroundEffects.ts';

export interface BoardLayout {
  boardX: number;
  boardY: number;
  boardWidth: number;
  boardHeight: number;
  cellSize: number;
  cellPadding: number;
}

export interface DragState {
  isDragging: boolean;
  shape: ShapeDefinition | null;
  slotIndex: number;
  currentX: number;
  currentY: number;
  hoverRow: number;
  hoverCol: number;
  isValidPlacement: boolean;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number = 1;
  public layout!: BoardLayout;

  public backgroundEffects: BackgroundEffects;
  public particleSystem: ParticleSystem;

  public palette: PaletteId = 'gemstone';
  public screenShakeAmount: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.backgroundEffects = new BackgroundEffects();
    this.particleSystem = new ParticleSystem();

    this.resize();
  }

  public resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = rect.width || window.innerWidth;
    const cssHeight = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(cssWidth * this.dpr);
    this.canvas.height = Math.floor(cssHeight * this.dpr);

    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);

    this.computeLayout(cssWidth, cssHeight);
    this.backgroundEffects.resize(cssWidth, cssHeight);
  }

  private computeLayout(width: number, height: number): void {
    // Determine board size based on responsive screen width/height
    const maxBoardWidth = Math.min(width * 0.92, 480);
    const maxBoardHeight = Math.min(height * 0.52, 480);
    const boardDim = Math.min(maxBoardWidth, maxBoardHeight);

    // Position board gracefully between HUD and hand dock
    const boardY = Math.max(90, Math.floor((height - boardDim) * 0.32));

    const boardSize = 8;
    const cellPadding = 4;
    const cellSize = Math.floor((boardDim - (cellPadding * (boardSize + 1))) / boardSize);
    const actualBoardDim = cellSize * boardSize + cellPadding * (boardSize + 1);

    this.layout = {
      boardX: Math.floor((width - actualBoardDim) / 2),
      boardY,
      boardWidth: actualBoardDim,
      boardHeight: actualBoardDim,
      cellSize,
      cellPadding
    };
  }

  public getCellCoords(row: number, col: number): { x: number; y: number } {
    const x = this.layout.boardX + this.layout.cellPadding + col * (this.layout.cellSize + this.layout.cellPadding);
    const y = this.layout.boardY + this.layout.cellPadding + row * (this.layout.cellSize + this.layout.cellPadding);
    return { x, y };
  }

  public screenToGrid(screenX: number, screenY: number, shape?: ShapeDefinition): { row: number; col: number } | null {
    const { boardX, boardY, cellSize, cellPadding } = this.layout;
    const step = cellSize + cellPadding;

    // If a multi-cell shape is being placed, center the shape around the drag point
    let offsetX = 0;
    let offsetY = 0;
    if (shape) {
      offsetX = ((shape.matrix[0].length - 1) * step) / 2;
      offsetY = ((shape.matrix.length - 1) * step) / 2;
    }

    const relX = screenX - boardX - cellPadding - offsetX + (cellSize / 2);
    const relY = screenY - boardY - cellPadding - offsetY + (cellSize / 2);

    const col = Math.floor(relX / step);
    const row = Math.floor(relY / step);

    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      return { row, col };
    }
    return null;
  }

  public triggerScreenShake(amount: number = 8): void {
    this.screenShakeAmount = amount;
  }

  public render(
    board: Board,
    hand: HandSlot[],
    dragState: DragState,
    energyLevel: number,
    crucibleEnergy: number,
    dt: number
  ): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    // Update particles & background
    this.particleSystem.update(dt);
    this.backgroundEffects.update(dt);

    if (this.screenShakeAmount > 0) {
      this.screenShakeAmount = Math.max(0, this.screenShakeAmount - dt * 25);
    }

    this.ctx.save();

    // Screen shake offset
    if (this.screenShakeAmount > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeAmount;
      const shakeY = (Math.random() - 0.5) * this.screenShakeAmount;
      this.ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Living Background
    this.backgroundEffects.render(this.ctx, width, height, energyLevel);

    // 2. Draw Board Glass Backplate
    this.drawBoardBackdrop();

    // 3. Draw Board Grid & Placed Cells
    this.drawBoardCells(board);

    // 4. Draw Ghost Piece Preview (if dragging)
    if (dragState.isDragging && dragState.shape && dragState.hoverRow >= 0 && dragState.hoverCol >= 0) {
      this.drawGhostPreview(board, dragState);
    }

    // 5. Draw Particle Systems (sparkles, text popups, clear rings)
    this.particleSystem.render(this.ctx);

    // 6. Draw Hand Piece Slots (and crucible dock)
    this.drawHandDock(hand, dragState, crucibleEnergy, width, height);

    // 7. Draw Floating Dragged Piece on top of everything
    if (dragState.isDragging && dragState.shape) {
      this.drawDraggedShape(dragState);
    }

    this.ctx.restore();
  }

  private drawBoardBackdrop(): void {
    const { boardX, boardY, boardWidth, boardHeight } = this.layout;

    this.ctx.save();
    // Glassmorphic board outer frame
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 24;

    this.ctx.beginPath();
    this.ctx.roundRect(boardX - 6, boardY - 6, boardWidth + 12, boardHeight + 12, 16);
    this.ctx.fill();
    this.ctx.stroke();

    // Inner bevel gradient
    const innerGrad = this.ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardHeight);
    innerGrad.addColorStop(0, 'rgba(30, 41, 59, 0.6)');
    innerGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
    this.ctx.fillStyle = innerGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(boardX, boardY, boardWidth, boardHeight, 12);
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawBoardCells(board: Board): void {
    const { boardSize = 8 } = { boardSize: board.size };
    const { cellSize } = this.layout;

    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const { x, y } = this.getCellCoords(r, c);
        const cell = board.grid[r][c];

        if (cell.filled) {
          this.drawCrystalCell(x, y, cellSize, cell.color, cell.secondaryColor, cell.isCrystal, cell.isHarmonic);
        } else {
          // Empty slot well
          this.ctx.save();
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.roundRect(x, y, cellSize, cellSize, 8);
          this.ctx.fill();
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  private drawCrystalCell(
    x: number,
    y: number,
    size: number,
    color: string,
    secondaryColor?: string,
    isCrystal?: boolean,
    isHarmonic?: boolean
  ): void {
    this.ctx.save();

    // Glow for special variants
    if (isCrystal) {
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 10;
    } else if (isHarmonic) {
      this.ctx.shadowColor = '#c084fc';
      this.ctx.shadowBlur = 10;
    }

    // Cell Body Gradient
    const cellGrad = this.ctx.createLinearGradient(x, y, x + size, y + size);
    cellGrad.addColorStop(0, color);
    cellGrad.addColorStop(1, secondaryColor || color);

    this.ctx.fillStyle = cellGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, size, size, 8);
    this.ctx.fill();

    // Specular Top-Left Bevel Highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.beginPath();
    this.ctx.roundRect(x + 2, y + 2, size - 4, (size - 4) * 0.38, 6);
    this.ctx.fill();

    // Crystal faceted diagonal reflection
    if (isCrystal) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 4, y + size - 6);
      this.ctx.lineTo(x + size - 6, y + 4);
      this.ctx.stroke();

      // Sparkle cross in center
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Harmonic ring facet
    if (isHarmonic) {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size * 0.28, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Outer Crisp Edge
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, size, size, 8);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawGhostPreview(board: Board, drag: DragState): void {
    if (!drag.shape) return;

    const { hoverRow, hoverCol, shape } = drag;
    const { cellSize } = this.layout;
    const canPlace = board.canPlace(shape, hoverRow, hoverCol);

    this.ctx.save();

    for (let r = 0; r < shape.matrix.length; r++) {
      for (let c = 0; c < shape.matrix[r].length; c++) {
        if (shape.matrix[r][c] === 1) {
          const br = hoverRow + r;
          const bc = hoverCol + c;
          if (br >= 0 && br < board.size && bc >= 0 && bc < board.size) {
            const { x, y } = this.getCellCoords(br, bc);

            if (canPlace) {
              this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
              this.ctx.strokeStyle = '#38bdf8';
              this.ctx.lineWidth = 2;
            } else {
              this.ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
              this.ctx.strokeStyle = '#ef4444';
              this.ctx.lineWidth = 2;
            }

            this.ctx.beginPath();
            this.ctx.roundRect(x, y, cellSize, cellSize, 8);
            this.ctx.fill();
            this.ctx.stroke();
          }
        }
      }
    }

    // Highlight rows and columns that will clear if placed!
    if (canPlace) {
      // Simulate prospective clear
      const tempBoard = new Board(board.size);
      for (let r = 0; r < board.size; r++) {
        for (let c = 0; c < board.size; c++) {
          tempBoard.grid[r][c] = { ...board.grid[r][c] };
        }
      }
      tempBoard.placeShape(shape, hoverRow, hoverCol);
      const prospectiveLines = tempBoard.getCompletedLines();

      this.ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
      this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
      this.ctx.lineWidth = 2;

      for (const r of prospectiveLines.rows) {
        for (let c = 0; c < board.size; c++) {
          const { x, y } = this.getCellCoords(r, c);
          this.ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        }
      }

      for (const c of prospectiveLines.cols) {
        for (let r = 0; r < board.size; r++) {
          const { x, y } = this.getCellCoords(r, c);
          this.ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        }
      }
    }

    this.ctx.restore();
  }

  private drawHandDock(
    hand: HandSlot[],
    drag: DragState,
    _crucibleEnergy: number,
    width: number,
    _height: number
  ): void {
    const dockY = this.layout.boardY + this.layout.boardHeight + 25;
    const slotWidth = Math.min(105, (width - 60) / 3.4);
    const spacing = 14;
    const totalHandWidth = slotWidth * 3 + spacing * 2;
    const startX = Math.floor((width - totalHandWidth) / 2);

    this.ctx.save();

    for (let i = 0; i < 3; i++) {
      const slot = hand[i];
      const slotX = startX + i * (slotWidth + spacing);
      const slotY = dockY + 8;
      const slotDim = slotWidth;

      // Slot Well Plate
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(slotX, slotY, slotDim, slotDim, 14);
      this.ctx.fill();
      this.ctx.stroke();

      // Render shape inside slot if not actively being dragged
      if (slot && slot.shape && !slot.isUsed) {
        if (!(drag.isDragging && drag.slotIndex === i)) {
          this.drawMiniShape(slot.shape, slotX, slotY, slotDim, slotDim);
        }
      }
    }

    this.ctx.restore();
  }

  private drawMiniShape(shape: ShapeDefinition, boxX: number, boxY: number, boxW: number, boxH: number): void {
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const miniCellSize = Math.min(22, (boxW * 0.7) / Math.max(rows, cols));
    const padding = 2;

    const totalShapeW = cols * miniCellSize + (cols - 1) * padding;
    const totalShapeH = rows * miniCellSize + (rows - 1) * padding;
    const originX = boxX + (boxW - totalShapeW) / 2;
    const originY = boxY + (boxH - totalShapeH) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          const cx = originX + c * (miniCellSize + padding);
          const cy = originY + r * (miniCellSize + padding);
          this.drawCrystalCell(cx, cy, miniCellSize, shape.baseColor, shape.secondaryColor, shape.isCrystal, shape.isHarmonic);
        }
      }
    }
  }

  private drawDraggedShape(drag: DragState): void {
    if (!drag.shape) return;

    const shape = drag.shape;
    const matrix = shape.matrix;
    const { cellSize, cellPadding } = this.layout;
    const step = cellSize + cellPadding;

    const shapeW = matrix[0].length * step;
    const shapeH = matrix.length * step;

    // Anchor piece centered on drag position
    const originX = drag.currentX - shapeW / 2;
    const originY = drag.currentY - shapeH / 2;

    this.ctx.save();
    // Elevation shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    this.ctx.shadowBlur = 18;
    this.ctx.shadowOffsetY = 10;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const cx = originX + c * step;
          const cy = originY + r * step;
          this.drawCrystalCell(cx, cy, cellSize, shape.baseColor, shape.secondaryColor, shape.isCrystal, shape.isHarmonic);
        }
      }
    }

    this.ctx.restore();
  }

  public getHandSlotAt(x: number, y: number, width: number, _height: number): number | null {
    const dockY = this.layout.boardY + this.layout.boardHeight + 25;
    const slotWidth = Math.min(105, (width - 60) / 3.4);
    const spacing = 14;
    const totalHandWidth = slotWidth * 3 + spacing * 2;
    const startX = Math.floor((width - totalHandWidth) / 2);

    for (let i = 0; i < 3; i++) {
      const slotX = startX + i * (slotWidth + spacing);
      const slotY = dockY + 8;
      const slotDim = slotWidth;

      if (x >= slotX && x <= slotX + slotDim && y >= slotY && y <= slotY + slotDim) {
        return i;
      }
    }
    return null;
  }
}
