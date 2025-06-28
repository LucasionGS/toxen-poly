/**
 * Visualizer settings and configuration
 * Provides a centralized way to manage visualizer settings
 */

import React from 'react';
import { VisualizerStyle, VisualizerSettings } from '../types/VisualizerTypes';

export const DEFAULT_VISUALIZER_SETTINGS: VisualizerSettings = {
  style: VisualizerStyle.Bottom,
  color: "#ffffff",
  rainbow: false,
  glow: false,
  pulseBackground: false,
  normalize: false,
  shuffle: false,
  intensity: 1.0,
  opacity: 0.7,
  backgroundDim: 50,
  dynamicLighting: true,
  fftSize: 1024,
};

export class VisualizerSettingsManager {
  private static instance: VisualizerSettingsManager;
  private settings: Partial<VisualizerSettings> = {};
  private listeners: Set<() => void> = new Set();

  static getInstance(): VisualizerSettingsManager {
    if (!this.instance) {
      this.instance = new VisualizerSettingsManager();
    }
    return this.instance;
  }

  updateSetting<K extends keyof VisualizerSettings>(key: K, value: VisualizerSettings[K]) {
    this.settings[key] = value;
    this.notifyListeners();
  }

  getSetting<K extends keyof VisualizerSettings>(key: K): VisualizerSettings[K] {
    return this.settings[key] ?? DEFAULT_VISUALIZER_SETTINGS[key];
  }

  getAllSettings(): VisualizerSettings {
    return {
      ...DEFAULT_VISUALIZER_SETTINGS,
      ...this.settings,
    };
  }

  resetToDefaults() {
    this.settings = {};
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Export convenience functions
export const getVisualizerSettings = () => VisualizerSettingsManager.getInstance().getAllSettings();
export const updateVisualizerSetting = <K extends keyof VisualizerSettings>(
  key: K, 
  value: VisualizerSettings[K]
) => VisualizerSettingsManager.getInstance().updateSetting(key, value);

// React hook to subscribe to settings changes
export const useVisualizerSettings = (): VisualizerSettings => {
  const [settings, setSettings] = React.useState(getVisualizerSettings);

  React.useEffect(() => {
    const unsubscribe = VisualizerSettingsManager.getInstance().subscribe(() => {
      setSettings(getVisualizerSettings());
    });

    return unsubscribe;
  }, []);

  return settings;
};
