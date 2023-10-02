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