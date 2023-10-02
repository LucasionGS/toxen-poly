export interface ISettings {
  // General settings
  libraryDirectory: string;
  isRemote: boolean;
  volume: number;
  repeat: boolean;
  shuffle: boolean;

  // Panel settings
  panelVerticalTransition: boolean;
  panelDirection: "left" | "right";
  exposePanelIcons: boolean;
  panelWidth?: number;
  sidepanelBackground?: string;

  // Window
  restoreWindowSize?: boolean;
  windowWidth?: number;
  windowHeight?: number;

  // Controls
  pauseWithClick: boolean;

  // Visuals
  theme?: string;
  visualizerColor?: string;
  visualizerStyle?: string;
  visualizerIntensity?: number;
  /**
   * @unimplemented
   */
  visualizerShuffle: boolean;
  visualizerRainbowMode: boolean;
  visualizerPulseBackground: boolean;
  backgroundDynamicLighting: boolean;
  fftSize?: number;

  // Backgrounds
  defaultBackground?: string;
  backgroundDim: number;

  // Advanced settings & UI
  showAdvancedSettings: boolean;
  remoteServer?: string;
  progressBarShowMs: boolean;

  // Discord
  discordPresence: boolean;
  discordPresenceDetailed: boolean;

  // Hue settings
  hueEnabled: boolean;
  hueBridgeIp?: string;
  hueUsername?: string;
  hueClientkey?: string;
  hueEntertainmentAreaId?: string;

  // Media downloader
  acceptedResponsibility: boolean;
}