/**
 * Base visualizer renderer for ToxenPlayer
 * Well-structured implementation based on Toxen3's visualizer system
 */

import { VisualizerStyle, VisualizerSettings, VisualizerRenderContext, VisualizerBarData } from '../types/VisualizerTypes';
import { VisualizerUtils } from '../utils/VisualizerUtils';

export class BaseVisualizer {
  protected readonly DEFAULT_FFT_SIZE = 1024;
  protected readonly DATA_SIZE = 255;
  protected readonly DEFAULT_OPACITY = 0.7;

  /**
   * Main render method - orchestrates the entire visualization
   */
  render(context: VisualizerRenderContext) {
    const { ctx, canvas, audioAnalyser, settings, time } = context;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!audioAnalyser) return;

    // Get and process audio data
    let audioData = this.getAudioData(audioAnalyser, settings.fftSize);
    audioData = this.processAudioData(audioData, settings);

    // Calculate dimensions and effects
    const dimensions = this.calculateDimensions(canvas, settings, audioData);
    const effects = this.calculateEffects(audioData, dimensions, settings);

    // Apply background effects
    this.renderBackground(ctx, canvas, settings, effects);

    // Render the specific visualizer style
    this.renderVisualizerStyle(context, audioData, dimensions, effects, time);
  }

  /**
   * Get audio frequency data from analyser
   */
  protected getAudioData(analyser: AnalyserNode, fftSize: number = this.DEFAULT_FFT_SIZE): Uint8Array {
    // Set FFT size if different
    if (analyser.fftSize !== fftSize) {
      analyser.fftSize = fftSize;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    // Use only higher frequencies (more visually interesting) - matching Toxen3
    return dataArray.slice(0, (dataArray.length / 2)).reverse(); // Reverse to match Toxen3
  }

  /**
   * Process audio data based on settings
   */
  protected processAudioData(data: Uint8Array, settings: VisualizerSettings): Uint8Array {
    let processedData = data;

    if (settings.normalize) {
      processedData = VisualizerUtils.normalizeAudioData(processedData);
    }

    if (settings.shuffle && settings.style !== VisualizerStyle.Waveform) {
      processedData = VisualizerUtils.shuffleArray(processedData);
    }

    return processedData;
  }

  /**
   * Calculate dimensions for visualization
   */
  protected calculateDimensions(canvas: HTMLCanvasElement, settings: VisualizerSettings, data: Uint8Array) {
    const { width, height } = canvas;
    const dataLength = data.length;
    
    return {
      width,
      height,
      dataLength,
      maxHeight: VisualizerUtils.getMaxDimension(height, settings.intensity, 0.3),
      maxWidth: VisualizerUtils.getMaxDimension(width, settings.intensity, 0.15),
      unitWidth: width / dataLength,
      unitHeight: VisualizerUtils.getMaxDimension(height, settings.intensity, 0.3) / this.DATA_SIZE,
      centerX: width / 2,
      centerY: height / 2,
    };
  }

  /**
   * Calculate dynamic effects
   */
  protected calculateEffects(data: Uint8Array, dimensions: any, settings: VisualizerSettings) {
    // Calculate dynamic lighting similar to Toxen3's implementation
    const maxHeight = dimensions.maxHeight || 1;
    const unitH = maxHeight / this.DATA_SIZE;
    let averageHeight = 0;
    
    for (let i = 0; i < data.length; i++) {
      averageHeight += (data[i] * unitH);
    }
    
    averageHeight /= data.length;
    averageHeight = Math.min(averageHeight, maxHeight);
    const dynamicLighting = (averageHeight / maxHeight) * 0.5; // Much more subtle multiplier like Toxen3

    const baseBackgroundDim = settings.backgroundDim / 100;
    // Toxen3's formula: this.dynamicDim = baseBackgroundDim - dynLight
    const effectiveBackgroundDim = settings.dynamicLighting ? 
      Math.max(0, baseBackgroundDim - dynamicLighting) : 
      baseBackgroundDim;

    return {
      dynamicLighting,
      baseBackgroundDim,
      effectiveBackgroundDim,
      pulseScale: settings.pulseBackground ? 1 + (dynamicLighting / 4) : 1,
    };
  }

  /**
   * Render background with dimming effects
   */
  protected renderBackground(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    settings: VisualizerSettings,
    effects: any
  ) {
    let dimColor: string;
    
    if (settings.dynamicLighting) {
      // Use Toxen3's approach: dynamicDim = baseBackgroundDim - dynLight
      // const dynamicDim = +((effects.baseBackgroundDim - effects.dynamicLighting)).toPrecision(1);
      const dynamicDim = effects.effectiveBackgroundDim;
      
      // console.log(`Dynamic Dim: ${dynamicDim}, Base Dim: ${effects.baseBackgroundDim}, Dynamic Lighting: ${effects.dynamicLighting}`);
      
      
      if (dynamicDim >= 0) {
        dimColor = `rgba(0,0,0,${dynamicDim})`;
      } else {
        // Use visualizer color when background becomes "brighter" than black
        // Clamp the alpha to a maximum of 0.15 for subtle tinting
        const rgb = VisualizerUtils.hexToRgb(settings.color);
        const alpha = Math.min(-dynamicDim * 0.15, 0.15);
        dimColor = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
      }
    } else {
      dimColor = `rgba(0,0,0,${effects.baseBackgroundDim})`;
    }
    
    // dimColor = `rgba(0,0,0, 0.5)`; // Use effective dim for background
    
    ctx.fillStyle = dimColor;
    ctx.shadowBlur = 0; // Reset shadow blur for background
    ctx.shadowColor = 'transparent'; // Reset shadow color for background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Main visualizer style routing
   */
  protected renderVisualizerStyle(
    context: VisualizerRenderContext,
    data: Uint8Array,
    dimensions: any,
    effects: any,
    time: number
  ) {
    const { settings } = context;

    if (settings.style === VisualizerStyle.None) {
      return;
    }

    switch (settings.style) {
      case VisualizerStyle.Bottom:
        this.renderBottom(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.Top:
        this.renderTop(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.TopAndBottom:
        this.renderTopAndBottom(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.Sides:
        this.renderSides(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.Center:
        this.renderCenter(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.Singularity:
        this.renderSingularity(context, data, dimensions, effects, time, false);
        break;
      case VisualizerStyle.SingularityWithLogo:
        this.renderSingularity(context, data, dimensions, effects, time, true);
        break;
      case VisualizerStyle.MirroredSingularity:
        this.renderMirroredSingularity(context, data, dimensions, effects, time, false);
        break;
      case VisualizerStyle.MirroredSingularityWithLogo:
        this.renderMirroredSingularity(context, data, dimensions, effects, time, true);
        break;
      case VisualizerStyle.Waveform:
        this.renderWaveform(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.CircularWaveform:
        this.renderCircularWaveform(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.Orb:
        this.renderOrb(context, data, dimensions, effects, time);
        break;
      case VisualizerStyle.ProgressBar:
      default:
        this.renderProgressBar(context, data, dimensions, effects, time);
        break;
    }
  }

  /**
   * Helper method to draw a bar with effects
   */
  protected drawBar(
    ctx: CanvasRenderingContext2D,
    bar: VisualizerBarData,
    settings: VisualizerSettings,
    time: number,
    cycleIncrementer?: number,
    rainbowOptions?: any
  ) {
    // Set up glow effect
    if (settings.glow) {
      VisualizerUtils.setBarShadowBlur(ctx, bar.height);
      ctx.shadowColor = settings.color;
    }

    // Set up rainbow colors
    if (settings.rainbow) {
      VisualizerUtils.setRainbow(
        ctx,
        bar.x,
        bar.y,
        bar.width,
        bar.height,
        bar.index,
        cycleIncrementer || VisualizerUtils.getCycleIncrementer(100),
        time,
        rainbowOptions
      );
    } else {
      ctx.fillStyle = settings.color;
      ctx.strokeStyle = settings.color;
    }

    // Draw the bar with opacity
    VisualizerUtils.useAlpha(ctx, settings.opacity, (ctx) => {
      ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
    });
  }

  // Abstract methods to be implemented by subclasses
  protected renderBottom(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderBottom must be implemented by subclass");
  }

  protected renderTop(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderTop must be implemented by subclass");
  }

  protected renderTopAndBottom(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderTopAndBottom must be implemented by subclass");
  }

  protected renderSides(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderSides must be implemented by subclass");
  }

  protected renderCenter(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderCenter must be implemented by subclass");
  }

  protected renderSingularity(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number, withLogo: boolean) {
    throw new Error("renderSingularity must be implemented by subclass");
  }

  protected renderMirroredSingularity(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number, withLogo: boolean) {
    throw new Error("renderMirroredSingularity must be implemented by subclass");
  }

  protected renderWaveform(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderWaveform must be implemented by subclass");
  }

  protected renderCircularWaveform(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderCircularWaveform must be implemented by subclass");
  }

  protected renderOrb(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderOrb must be implemented by subclass");
  }

  protected renderProgressBar(context: VisualizerRenderContext, data: Uint8Array, dimensions: any, effects: any, time: number) {
    throw new Error("renderProgressBar must be implemented by subclass");
  }
}
