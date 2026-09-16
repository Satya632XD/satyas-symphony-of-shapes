// src/ui/TouchController.ts - Seamless Touch, Mouse, and Keyboard Controls
import { CanvasRenderer, DragState } from '../render/CanvasRenderer.ts';
import { GameMode } from '../modes/GameMode.ts';
import { ShapeDefinition } from '../core/Types.ts';

export interface ControllerCallbacks {
  onPiecePlaced: (slotIndex: number, row: number, col: number) => void;
  onCrucibleActivated: () => void;
  onHoverChanged?: (row: number, col: number, shape: ShapeDefinition | null) => void;
}

export class TouchController {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private mode: GameMode;
  private callbacks: ControllerCallbacks;

  public dragState: DragState = {
    isDragging: false,
    shape: null,
    slotIndex: -1,
    currentX: 0,
    currentY: 0,
    hoverRow: -1,
    hoverCol: -1,
    isValidPlacement: false
  };

  public selectedSlotIndex: number | null = null;
  public touchOffsetY: number = 70; // Offset above finger for mobile screens

  constructor(
    canvas: HTMLCanvasElement,
    renderer: CanvasRenderer,
    mode: GameMode,
    callbacks: ControllerCallbacks
  ) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.mode = mode;
    this.callbacks = callbacks;

    this.bindEvents();
  }

  public setMode(mode: GameMode): void {
    this.mode = mode;
    this.cancelDrag();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));
    window.addEventListener('pointercancel', this.onPointerCancel.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private getPointerPos(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private onPointerDown(e: PointerEvent): void {
    if (this.mode.isGameOver || this.mode.isVictory) return;

    const pos = this.getPointerPos(e);
    const isTouch = e.pointerType === 'touch';

    // 1. Check if user clicked a hand slot
    const slotIdx = this.renderer.getHandSlotAt(
      pos.x,
      pos.y,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );

    if (slotIdx !== null) {
      const slot = this.mode.hand[slotIdx];
      if (slot && slot.shape && !slot.isUsed) {
        // Start dragging
        this.dragState.isDragging = true;
        this.dragState.shape = slot.shape;
        this.dragState.slotIndex = slotIdx;
        this.dragState.currentX = pos.x;
        // On touch devices, offset upwards so player's finger doesn't obscure the piece!
        this.dragState.currentY = isTouch ? pos.y - this.touchOffsetY : pos.y;
        this.selectedSlotIndex = slotIdx;
        this.updateHover(this.dragState.currentX, this.dragState.currentY);
        return;
      }
    }

    // 2. Click-to-place fallback: if already selected a slot and clicked a board cell
    if (this.selectedSlotIndex !== null) {
      const cell = this.renderer.screenToGrid(pos.x, pos.y);
      if (cell) {
        const slot = this.mode.hand[this.selectedSlotIndex];
        if (slot && slot.shape && !slot.isUsed) {
          if (this.mode.board.canPlace(slot.shape, cell.row, cell.col)) {
            this.callbacks.onPiecePlaced(this.selectedSlotIndex, cell.row, cell.col);
            this.cancelDrag();
            return;
          }
        }
      }
      this.cancelDrag();
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragState.isDragging || !this.dragState.shape) return;

    const pos = this.getPointerPos(e);
    const isTouch = e.pointerType === 'touch';

    this.dragState.currentX = pos.x;
    this.dragState.currentY = isTouch ? pos.y - this.touchOffsetY : pos.y;

    this.updateHover(this.dragState.currentX, this.dragState.currentY);
  }

  private updateHover(x: number, y: number): void {
    if (!this.dragState.shape) return;

    const gridPos = this.renderer.screenToGrid(x, y, this.dragState.shape);
    if (gridPos) {
      this.dragState.hoverRow = gridPos.row;
      this.dragState.hoverCol = gridPos.col;
      this.dragState.isValidPlacement = this.mode.board.canPlace(
        this.dragState.shape,
        gridPos.row,
        gridPos.col
      );
    } else {
      this.dragState.hoverRow = -1;
      this.dragState.hoverCol = -1;
      this.dragState.isValidPlacement = false;
    }
  }

  private onPointerUp(_e: PointerEvent): void {
    if (!this.dragState.isDragging || !this.dragState.shape) return;

    const { hoverRow, hoverCol, slotIndex, isValidPlacement } = this.dragState;

    if (isValidPlacement && hoverRow >= 0 && hoverCol >= 0 && slotIndex >= 0) {
      this.callbacks.onPiecePlaced(slotIndex, hoverRow, hoverCol);
      this.cancelDrag();
    } else {
      // Released in invalid area -> snap back
      this.cancelDrag();
    }
  }

  private onPointerCancel(): void {
    this.cancelDrag();
  }

  public cancelDrag(): void {
    this.dragState.isDragging = false;
    this.dragState.shape = null;
    this.dragState.slotIndex = -1;
    this.dragState.hoverRow = -1;
    this.dragState.hoverCol = -1;
    this.dragState.isValidPlacement = false;
    this.selectedSlotIndex = null;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === '1' || e.key === '2' || e.key === '3') {
      const idx = parseInt(e.key, 10) - 1;
      const slot = this.mode.hand[idx];
      if (slot && slot.shape && !slot.isUsed) {
        this.selectedSlotIndex = idx;
        this.dragState.shape = slot.shape;
        this.dragState.slotIndex = idx;
      }
    } else if (e.key === 'Escape') {
      this.cancelDrag();
    }
  }
}
