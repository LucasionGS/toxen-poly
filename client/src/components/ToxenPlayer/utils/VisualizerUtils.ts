/**
 * Utility functions for audio visualization
 * Structured and improved versions of Toxen3's visualizer utilities
 */

import { RainbowOptions, ShadowOptions } from '../types/VisualizerTypes';

export class VisualizerUtils {
  /**
   * Temporarily change canvas alpha and restore it after callback
   */
  static useAlpha(
    ctx: CanvasRenderingContext2D,
    alpha: number,
    callback: (ctx: CanvasRenderingContext2D) => void
  ) {
    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    callback(ctx);
    ctx.globalAlpha = oldAlpha;
  }

  /**
   * Temporarily change canvas shadow settings and restore them after callback
   */
  static useShadow(
    ctx: CanvasRenderingContext2D,
    options: ShadowOptions,
    callback: (ctx: CanvasRenderingContext2D) => void
  ) {
    const oldBlur = ctx.shadowBlur;
    const oldColor = ctx.shadowColor;
    
    ctx.shadowBlur = options.blur ?? 0;
    ctx.shadowColor = options.color ?? "transparent";
    
    callback(ctx);
    
    ctx.shadowBlur = oldBlur;
    ctx.shadowColor = oldColor;
  }

  /**
   * Generate rainbow colors with HSL - matches Toxen3's implementation
   */
  static getRainbowColor(index: number, cycleIncrementer: number, time: number): string {
    return `hsl(${cycleIncrementer * index + (time * 0.05)}, 100%, 50%)`;
  }

  /**
   * Apply rainbow gradient to bars - enhanced version from Toxen3
   */
  static setRainbow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    index: number,
    cycleIncrementer: number,
    time: number,
    options?: RainbowOptions
  ) {
    const rainbowColor = this.getRainbowColor(index, cycleIncrementer, time);
    
    const grd = ctx.createLinearGradient(x, y, x + width, y + height);
    
    if (!options) {
      grd.addColorStop(0, rainbowColor);
      grd.addColorStop(1, rainbowColor);
    } else {
      if (options.top) {
        grd.addColorStop(0, "white");
        grd.addColorStop(0.35, rainbowColor);
      } else {
        grd.addColorStop(0, rainbowColor);
      }
      
      if (options.bottom) {
        grd.addColorStop(0.65, rainbowColor);
        grd.addColorStop(1, "white");
      } else {
        grd.addColorStop(1, rainbowColor);
      }
    }
    
    ctx.fillStyle = grd;
    ctx.strokeStyle = grd;
    ctx.shadowColor = rainbowColor;
  }

  /**
   * Set shadow blur based on bar height for glow effect
   */
  static setBarShadowBlur(ctx: CanvasRenderingContext2D, height: number) {
    ctx.shadowBlur = height / 3;
  }

  /**
   * Normalize audio data - matches Toxen3's implementation
   */
  static normalizeAudioData(data: Uint8Array): Uint8Array {
    const max = Math.max(...data);
    if (max === 0) return data;
    
    const normalized = Array.from(data).map(v => Math.round((v / max) * 255));
    return new Uint8Array(normalized);
  }

  /**
   * Shuffle array using seeded random (for consistent shuffle patterns) - from Toxen3
   */
  static shuffleArray(data: Uint8Array): Uint8Array {
    const array = Array.from(data);
    let seed = 1;
    
    // Seeded pseudo-random number generator
    function random() {
      const x = Math.sin(seed++) * array.length;
      return x - Math.floor(x);
    }
    
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    return new Uint8Array(array);
  }

  /**
   * Calculate dynamic lighting value based on audio intensity
   */
  static calculateDynamicLighting(
    data: Uint8Array,
    maxHeight: number,
    dataSize: number = 255
  ): number {
    const unitH = maxHeight / dataSize;
    let averageHeight = 0;
    
    for (let i = 0; i < data.length; i++) {
      averageHeight += (data[i] * unitH);
    }
    
    averageHeight /= data.length;
    averageHeight = Math.min(averageHeight, maxHeight);
    
    return averageHeight / maxHeight;
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  /**
   * Create cycle incrementer for circular visualizers
   */
  static getCycleIncrementer(length: number, fullCircle: boolean = true): number {
    return (fullCircle ? 360 : 180) / length;
  }

  /**
   * Calculate max height/width with power scaling - improved from Toxen3
   */
  static getMaxDimension(
    baseDimension: number,
    intensityMultiplier: number,
    multiplier: number = 1
  ): number {
    return intensityMultiplier * baseDimension * multiplier;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Create linear rainbow gradient for progress bars
   */
  static createRainbowGradient(ctx: CanvasRenderingContext2D, width: number): CanvasGradient {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(255,0,0,1)");      // Red
    gradient.addColorStop(0.1, "rgba(255,154,0,1)");  // Orange
    gradient.addColorStop(0.2, "rgba(208,222,33,1)"); // Yellow-green
    gradient.addColorStop(0.3, "rgba(79,220,74,1)");  // Green
    gradient.addColorStop(0.4, "rgba(63,218,216,1)"); // Cyan
    gradient.addColorStop(0.5, "rgba(47,201,226,1)"); // Light blue
    gradient.addColorStop(0.6, "rgba(28,127,238,1)"); // Blue
    gradient.addColorStop(0.7, "rgba(95,21,242,1)");  // Purple
    gradient.addColorStop(0.8, "rgba(186,12,248,1)"); // Magenta
    gradient.addColorStop(0.9, "rgba(251,7,217,1)");  // Pink
    gradient.addColorStop(1, "rgba(255,0,0,1)");      // Red again
    return gradient;
  }

  /**
   * Get bar dimensions - helper function from Toxen3
   */
  static getBarDimensions(
    barX: number, 
    barY: number, 
    barWidth: number, 
    barHeight: number
  ): [number, number, number, number] {
    return [barX, barY, barWidth, barHeight];
  }

  /**
   * Calculate power scaling for volume effects
   */
  static calculatePowerScale(volume: number): number {
    return 1 / (volume / 100);
  }
}
