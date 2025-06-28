/**
 * Visualizer types and interfaces for ToxenPlayer
 * Based on Toxen3's visualizer system but restructured for better maintainability
 */

export enum VisualizerStyle {
  None = "none",
  ProgressBar = "progressbar",
  Bottom = "bottom",
  Top = "top",
  TopAndBottom = "topbottom",
  Sides = "sides",
  Center = "center",
  Singularity = "circle",
  SingularityWithLogo = "circlelogo",
  MirroredSingularity = "mirroredsingularity",
  MirroredSingularityWithLogo = "mirroredsingularitywithlogo",
  Waveform = "waveform",
  CircularWaveform = "circularwaveform",
  Orb = "orb",
}

export interface VisualizerSettings {
  style: VisualizerStyle;
  color: string;
  rainbow: boolean;
  glow: boolean;
  pulseBackground: boolean;
  normalize: boolean;
  shuffle: boolean;
  intensity: number;
  opacity: number;
  backgroundDim: number;
  dynamicLighting: boolean;
  fftSize: number;
}

export interface VisualizerOrbOptions {
  x: number; // Position X percentage (0-100)
  y: number; // Position Y percentage (0-100) 
  size: number; // Custom size (0 = auto)
  opaque: boolean; // Fill the center circle
}

export interface VisualizerRenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  audioAnalyser: AnalyserNode;
  width: number;
  height: number;
  settings: VisualizerSettings;
  time: number;
  color: string;
}

export interface VisualizerBarData {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  index: number;
}

export type RainbowOptions = {
  top?: boolean;
  bottom?: boolean;
};

export type ShadowOptions = {
  blur?: number;
  color?: string;
};
