// src/core/Board.ts - Board Matrix & Logic for Satya's Symphony of Shapes
import { BoardMatrix, CellState, ShapeDefinition } from './Types.ts';

export class Board {
  public readonly size: number;
  public grid: BoardMatrix;

  constructor(size: number = 8) {
    this.size = size;
    this.grid = this.createEmptyGrid();
  }

  public createEmptyGrid(): BoardMatrix {
    const grid: BoardMatrix = [];
    for (let r = 0; r < this.size; r++) {
      const row: CellState[] = [];
      for (let c = 0; c < this.size; c++) {
        row.push({
          filled: false,
          color: '#1e293b',
          isCrystal: false,
          isHarmonic: false,
          shimmerOffset: (r * 7 + c * 11) % 100
        });
      }
      grid.push(row);
    }
    return grid;
  }

  public reset(): void {
    this.grid = this.createEmptyGrid();
  }

  public canPlace(shape: ShapeDefinition, startRow: number, startCol: number): boolean {
    const matrix = shape.matrix;
    const shapeRows = matrix.length;
    const shapeCols = matrix[0].length;

    if (startRow < 0 || startCol < 0) return false;
    if (startRow + shapeRows > this.size || startCol + shapeCols > this.size) return false;

    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (matrix[r][c] === 1) {
          const boardR = startRow + r;
          const boardC = startCol + c;
          if (this.grid[boardR][boardC].filled) {
            return false;
          }
        }
      }
    }
    return true;
  }

  public placeShape(
    shape: ShapeDefinition,
    startRow: number,
    startCol: number
  ): { placedCoords: Array<{ r: number; c: number }> } {
    if (!this.canPlace(shape, startRow, startCol)) {
      throw new Error(`Cannot place shape ${shape.name} at (${startRow}, ${startCol})`);
    }

    const placedCoords: Array<{ r: number; c: number }> = [];
    const matrix = shape.matrix;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const br = startRow + r;
          const bc = startCol + c;
          this.grid[br][bc] = {
            filled: true,
            color: shape.baseColor,
            secondaryColor: shape.secondaryColor,
            isCrystal: !!shape.isCrystal,
            isHarmonic: !!shape.isHarmonic,
            shapeId: shape.id,
            shimmerOffset: (br * 13 + bc * 17) % 100
          };
          placedCoords.push({ r: br, c: bc });
        }
      }
    }

    return { placedCoords };
  }

  public getCompletedLines(): { rows: number[]; cols: number[] } {
    const rows: number[] = [];
    const cols: number[] = [];

    // Check rows
    for (let r = 0; r < this.size; r++) {
      let isRowFull = true;
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c].filled) {
          isRowFull = false;
          break;
        }
      }
      if (isRowFull) rows.push(r);
    }

    // Check cols
    for (let c = 0; c < this.size; c++) {
      let isColFull = true;
      for (let r = 0; r < this.size; r++) {
        if (!this.grid[r][c].filled) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) cols.push(c);
    }

    return { rows, cols };
  }

  public clearLines(rows: number[], cols: number[]): {
    clearedCells: Array<{ r: number; c: number; isCrystal: boolean; isHarmonic: boolean; color: string }>;
    totalCellsCleared: number;
    crystalCount: number;
  } {
    const clearedCells: Array<{ r: number; c: number; isCrystal: boolean; isHarmonic: boolean; color: string }> = [];
    const clearedSet = new Set<string>();
    let crystalCount = 0;

    for (const r of rows) {
      for (let c = 0; c < this.size; c++) {
        const key = `${r},${c}`;
        if (!clearedSet.has(key) && this.grid[r][c].filled) {
          clearedSet.add(key);
          if (this.grid[r][c].isCrystal) crystalCount++;
          clearedCells.push({
            r,
            c,
            isCrystal: !!this.grid[r][c].isCrystal,
            isHarmonic: !!this.grid[r][c].isHarmonic,
            color: this.grid[r][c].color
          });
          this.grid[r][c] = {
            filled: false,
            color: '#1e293b',
            isCrystal: false,
            isHarmonic: false
          };
        }
      }
    }

    for (const c of cols) {
      for (let r = 0; r < this.size; r++) {
        const key = `${r},${c}`;
        if (!clearedSet.has(key) && this.grid[r][c].filled) {
          clearedSet.add(key);
          if (this.grid[r][c].isCrystal) crystalCount++;
          clearedCells.push({
            r,
            c,
            isCrystal: !!this.grid[r][c].isCrystal,
            isHarmonic: !!this.grid[r][c].isHarmonic,
            color: this.grid[r][c].color
          });
          this.grid[r][c] = {
            filled: false,
            color: '#1e293b',
            isCrystal: false,
            isHarmonic: false
          };
        }
      }
    }

    return {
      clearedCells,
      totalCellsCleared: clearedCells.length,
      crystalCount
    };
  }

  public canFitAnywhere(shape: ShapeDefinition): boolean {
    const shapeRows = shape.matrix.length;
    const shapeCols = shape.matrix[0].length;

    for (let r = 0; r <= this.size - shapeRows; r++) {
      for (let c = 0; c <= this.size - shapeCols; c++) {
        if (this.canPlace(shape, r, c)) {
          return true;
        }
      }
    }
    return false;
  }

  public getOccupiedCount(): number {
    let count = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c].filled) count++;
      }
    }
    return count;
  }

  public isBoardCompletelyEmpty(): boolean {
    return this.getOccupiedCount() === 0;
  }

  public getFullnessRatio(): number {
    return this.getOccupiedCount() / (this.size * this.size);
  }

  // Find congested clusters to relieve in Zen mode if board is blocked
  public zenReliefWave(): Array<{ r: number; c: number }> {
    const relieved: Array<{ r: number; c: number }> = [];
    const mid = Math.floor(this.size / 2);
    // Clear a 3x3 diamond in the center to keep flow going
    for (let r = mid - 1; r <= mid + 1; r++) {
      for (let c = mid - 1; c <= mid + 1; c++) {
        if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.grid[r][c].filled) {
          this.grid[r][c] = { filled: false, color: '#1e293b' };
          relieved.push({ r, c });
        }
      }
    }
    return relieved;
  }
}
