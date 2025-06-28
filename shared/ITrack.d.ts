export interface ITrack {
  // Track settings
  uid: string;
  artist: string;
  coArtists: string[];
  title: string;
  album: string;
  source?: string;
  tags?: string[];
  visualizerColor?: string;
  visualizerStyle?: string;
  visualizerIntensity?: number;
  visualizerForceRainbowMode?: boolean;
  /**
   * Controls the glow effect for this track's visualizer.
   * `true` enables glow, `false` disables it, `null/undefined` uses global setting.
   */
  visualizerGlow?: boolean;
  /**
   * Controls the opacity of the visualizer bars (0.1-1.0).
   */
  visualizerOpacity?: number;
  /**
   * Whether to normalize audio data for this track.
   */
  visualizerNormalize?: boolean;
  /**
   * Whether to shuffle audio data for this track (not applicable to waveform styles).
   */
  visualizerShuffle?: boolean;
  /**
   * `pulse` is forced pulsing.  
   * `pulse-off` is forced no pulsing.  
   * `null` will use the global setting.
   */
  visualizerPulseBackground?: "pulse" | "pulse-off";
  paths?: ITrackPaths;
  year?: number;
  language?: string;
  subtitleDelay?: number;

  floatingTitle?: boolean;
  floatingTitleText?: string;
  floatingTitlePosition?:
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";
  floatingTitleReactive?: boolean;
  floatingTitleOverrideVisualizer?: boolean;
  floatingTitleUnderline?: boolean;
  useFloatingTitleSubtitles?: boolean;
  genre?: string;
}

export interface ITrackPaths {
  /**
   * Directory basename relative to the music directory.
   */
  dirname: string;
  /**
   * Media file path relative to `dirname`.
   */
  media: string;
  /**
   * Background image path relative to `dirname`.
   */
  background: string;
  /**
   * Subtitle file path relative to `dirname`.
   */
  subtitles: string;
  /**
   * Toxen Storyboard file path relative to `dirname`. Format is YAML data.
   */
  storyboard: string;
}