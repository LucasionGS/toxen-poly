import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconDeviceFloppy, IconFolder, IconRefresh, IconMusic, IconX, IconPhoto, IconFileText, IconScoreboard, IconEdit, IconGripVertical } from "@tabler/icons-react";
import Button from "../Button/Button";
import "./EditSongPanel.scss";

interface EditSongPanelProps {
  track: any; // Track object to edit
  onSave: (trackData: any) => void;
  onClose: () => void;
  onDelete?: () => void;
}

// Constants for panel width
const MIN_PANEL_WIDTH = 350;
const MAX_PANEL_WIDTH = 800;
const DEFAULT_PANEL_WIDTH = 450;
const STORAGE_KEY = 'editSongPanel_width';

export default function EditSongPanel({ track, onSave, onClose, onDelete }: EditSongPanelProps) {
  // Panel width state with localStorage persistence
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_PANEL_WIDTH;
  });
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    // General information
    artist: "",
    title: "",
    coArtists: [] as string[],
    album: "",
    genre: "",
    source: "",
    language: "",
    year: undefined as number | undefined,
    tags: [] as string[],
    
    // File paths
    paths: {
      media: "",
      background: "",
      subtitles: "",
      storyboard: ""
    },
    
    // Visual settings
    visualizerColor: "",
    visualizerStyle: "",
    visualizerIntensity: undefined as number | undefined,
    visualizerForceRainbowMode: false,
    visualizerPulseBackground: "" as "" | "pulse" | "pulse-off",
    visualizerGlow: null as boolean | null,
    visualizerOpacity: undefined as number | undefined,
    visualizerNormalize: false,
    visualizerShuffle: false,
    
    // Floating title settings
    floatingTitle: false,
    floatingTitleText: "",
    floatingTitlePosition: "" as string,
    floatingTitleReactive: false,
    floatingTitleOverrideVisualizer: false,
    floatingTitleUnderline: false,
    useFloatingTitleSubtitles: false,
    
    // Subtitle settings
    subtitleDelay: 0,
  });

  const [activeTab, setActiveTab] = useState<"general" | "files" | "visuals" | "advanced">("general");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (track) {
      setFormData({
        artist: track.artist || "",
        title: track.title || "",
        coArtists: track.data.coArtists || [],
        album: track.data.album || "",
        genre: track.data.genre || "",
        source: track.data.source || "",
        language: track.data.language || "",
        year: track.data.year,
        tags: track.data.tags || [],
        paths: {
          media: track.data.paths?.media || "",
          background: track.data.paths?.background || "",
          subtitles: track.data.paths?.subtitles || "",
          storyboard: track.data.paths?.storyboard || ""
        },
        visualizerColor: track.data.visualizerColor || "",
        visualizerStyle: track.data.visualizerStyle || "",
        visualizerIntensity: track.data.visualizerIntensity,
        visualizerForceRainbowMode: track.data.visualizerForceRainbowMode || false,
        visualizerPulseBackground: track.data.visualizerPulseBackground || "",
        visualizerGlow: track.data.visualizerGlow,
        visualizerOpacity: track.data.visualizerOpacity,
        visualizerNormalize: track.data.visualizerNormalize || false,
        visualizerShuffle: track.data.visualizerShuffle || false,
        floatingTitle: track.data.floatingTitle || false,
        floatingTitleText: track.data.floatingTitleText || "",
        floatingTitlePosition: track.data.floatingTitlePosition || "",
        floatingTitleReactive: track.data.floatingTitleReactive || false,
        floatingTitleOverrideVisualizer: track.data.floatingTitleOverrideVisualizer || false,
        floatingTitleUnderline: track.data.floatingTitleUnderline || false,
        useFloatingTitleSubtitles: track.data.useFloatingTitleSubtitles || false,
        subtitleDelay: track.data.subtitleDelay || 0,
      });
    }
  }, [track]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = field.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setHasChanges(true);
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const array = (newData as any)[field] as string[];
      array[index] = value;
      return newData;
    });
    setHasChanges(true);
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const array = (newData as any)[field] as string[];
      array.push("");
      return newData;
    });
    setHasChanges(true);
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const newData = { ...prev };
      const array = (newData as any)[field] as string[];
      array.splice(index, 1);
      return newData;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (track) {
      // Reset to original values
      setFormData({
        artist: track.artist || "",
        title: track.title || "",
        coArtists: track.data.coArtists || [],
        album: track.data.album || "",
        genre: track.data.genre || "",
        source: track.data.source || "",
        language: track.data.language || "",
        year: track.data.year,
        tags: track.data.tags || [],
        paths: {
          media: track.data.paths?.media || "",
          background: track.data.paths?.background || "",
          subtitles: track.data.paths?.subtitles || "",
          storyboard: track.data.paths?.storyboard || ""
        },
        visualizerColor: track.data.visualizerColor || "",
        visualizerStyle: track.data.visualizerStyle || "",
        visualizerIntensity: track.data.visualizerIntensity,
        visualizerForceRainbowMode: track.data.visualizerForceRainbowMode || false,
        visualizerPulseBackground: track.data.visualizerPulseBackground || "",
        visualizerGlow: track.data.visualizerGlow,
        visualizerOpacity: track.data.visualizerOpacity,
        visualizerNormalize: track.data.visualizerNormalize || false,
        visualizerShuffle: track.data.visualizerShuffle || false,
        floatingTitle: track.data.floatingTitle || false,
        floatingTitleText: track.data.floatingTitleText || "",
        floatingTitlePosition: track.data.floatingTitlePosition || "",
        floatingTitleReactive: track.data.floatingTitleReactive || false,
        floatingTitleOverrideVisualizer: track.data.floatingTitleOverrideVisualizer || false,
        floatingTitleUnderline: track.data.floatingTitleUnderline || false,
        useFloatingTitleSubtitles: track.data.useFloatingTitleSubtitles || false,
        subtitleDelay: track.data.subtitleDelay || 0,
      });
      setHasChanges(false);
    }
  };

  const ArrayInput = ({ label, field, placeholder }: { label: string; field: keyof typeof formData; placeholder: string }) => {
    const array = formData[field] as string[];
    
    return (
      <div className="edit-song-panel__array-input">
        <label className="edit-song-panel__label">{label}</label>
        {array.map((item, index) => (
          <div key={index} className="edit-song-panel__array-item">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(field as string, index, e.target.value)}
              placeholder={placeholder}
              className="edit-song-panel__input"
            />
            <Button
              variant="subtle"
              onClick={() => removeArrayItem(field as string, index)}
              className="edit-song-panel__remove-btn"
            >
              <IconX size={16} />
            </Button>
          </div>
        ))}
        <Button
          variant="subtle"
          onClick={() => addArrayItem(field as string)}
          className="edit-song-panel__add-btn"
        >
          Add {label.slice(0, -1)}
        </Button>
      </div>
    );
  };

  // Save width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, panelWidth.toString());
  }, [panelWidth]);

  // Mouse event handlers for resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartWidth(panelWidth);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = dragStartX - e.clientX; // Negative because we're dragging from right edge
    const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, dragStartWidth + deltaX));
    setPanelWidth(newWidth);
  }, [isDragging, dragStartX, dragStartWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Touch event handlers for mobile resizing
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartX(touch.clientX);
    setDragStartWidth(panelWidth);
  }, [panelWidth]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = dragStartX - touch.clientX;
    const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, dragStartWidth + deltaX));
    setPanelWidth(newWidth);
  }, [isDragging, dragStartX, dragStartWidth]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up global mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <>
      {/* Backdrop overlay */}
      <div className="edit-song-panel-backdrop" onClick={onClose} />
      
      <div className="edit-song-panel" style={{ width: `${panelWidth}px` }} ref={panelRef}>
        {/* Resize handle */}
        <div 
          className={`edit-song-panel__resize-handle ${isDragging ? 'edit-song-panel__resize-handle--dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          ref={resizeHandleRef}
          title="Drag to resize panel"
        >
          <IconGripVertical size={16} />
          {isDragging && (
            <div className="edit-song-panel__width-indicator">
              {panelWidth}px
            </div>
          )}
        </div>
        
        <div className="edit-song-panel__header">
          <div className="edit-song-panel__title">
            <IconEdit size={24} />
            <h2>Edit Song Details</h2>
            {hasChanges && <span className="edit-song-panel__changes-indicator">•</span>}
          </div>
          <div className="edit-song-panel__actions">
            <Button variant="subtle" onClick={handleReset} disabled={!hasChanges}>
              <IconRefresh size={18} />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <IconDeviceFloppy size={18} />
              Save Changes
            </Button>
            <Button variant="subtle" onClick={onClose}>
              <IconX size={18} />
            </Button>
        </div>
      </div>

      <div className="edit-song-panel__tabs">
        <button
          className={`edit-song-panel__tab ${activeTab === "general" ? "edit-song-panel__tab--active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <IconMusic size={16} />
          General
        </button>
        <button
          className={`edit-song-panel__tab ${activeTab === "files" ? "edit-song-panel__tab--active" : ""}`}
          onClick={() => setActiveTab("files")}
        >
          <IconFolder size={16} />
          Files
        </button>
        <button
          className={`edit-song-panel__tab ${activeTab === "visuals" ? "edit-song-panel__tab--active" : ""}`}
          onClick={() => setActiveTab("visuals")}
        >
          <IconPhoto size={16} />
          Visuals
        </button>
        <button
          className={`edit-song-panel__tab ${activeTab === "advanced" ? "edit-song-panel__tab--active" : ""}`}
          onClick={() => setActiveTab("advanced")}
        >
          <IconScoreboard size={16} />
          Advanced
        </button>
      </div>

      <div className="edit-song-panel__content">
        {activeTab === "general" && (
          <div className="edit-song-panel__section">
            <h3>General Information</h3>
            
            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Artist *</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => handleInputChange("artist", e.target.value)}
                className="edit-song-panel__input"
                required
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="edit-song-panel__input"
                required
              />
            </div>

            <ArrayInput
              label="Co-Artists"
              field="coArtists"
              placeholder="Co-artist name"
            />

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Album</label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) => handleInputChange("album", e.target.value)}
                className="edit-song-panel__input"
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => handleInputChange("genre", e.target.value)}
                className="edit-song-panel__input"
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                className="edit-song-panel__input"
                placeholder="e.g., YouTube, SoundCloud, etc."
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => handleInputChange("language", e.target.value)}
                className="edit-song-panel__input"
                placeholder="e.g., English, Japanese, etc."
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Release Year</label>
              <input
                type="number"
                value={formData.year || ""}
                onChange={(e) => handleInputChange("year", e.target.value ? parseInt(e.target.value) : undefined)}
                className="edit-song-panel__input"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <ArrayInput
              label="Tags"
              field="tags"
              placeholder="Tag name"
            />
          </div>
        )}

        {activeTab === "files" && (
          <div className="edit-song-panel__section">
            <h3>File Paths</h3>
            
            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">
                <IconMusic size={16} />
                Media File
              </label>
              <input
                type="text"
                value={formData.paths.media}
                onChange={(e) => handleInputChange("paths.media", e.target.value)}
                className="edit-song-panel__input"
                placeholder="audio.mp3"
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">
                <IconPhoto size={16} />
                Background Image
              </label>
              <input
                type="text"
                value={formData.paths.background}
                onChange={(e) => handleInputChange("paths.background", e.target.value)}
                className="edit-song-panel__input"
                placeholder="background.jpg"
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">
                <IconFileText size={16} />
                Subtitles File
              </label>
              <input
                type="text"
                value={formData.paths.subtitles}
                onChange={(e) => handleInputChange("paths.subtitles", e.target.value)}
                className="edit-song-panel__input"
                placeholder="subtitles.srt"
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">
                <IconScoreboard size={16} />
                Storyboard File
              </label>
              <input
                type="text"
                value={formData.paths.storyboard}
                onChange={(e) => handleInputChange("paths.storyboard", e.target.value)}
                className="edit-song-panel__input"
                placeholder="storyboard.yaml"
              />
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Subtitle Offset (ms)</label>
              <input
                type="number"
                value={formData.subtitleDelay}
                onChange={(e) => handleInputChange("subtitleDelay", parseInt(e.target.value) || 0)}
                className="edit-song-panel__input"
                placeholder="0"
              />
              <small className="edit-song-panel__help">Positive values delay subtitles, negative values advance them</small>
            </div>
          </div>
        )}

        {activeTab === "visuals" && (
          <div className="edit-song-panel__section">
            <h3>Song-specific Visuals</h3>
            
            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Visualizer Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={formData.visualizerColor || "#ffffff"}
                  onChange={(e) => handleInputChange("visualizerColor", e.target.value)}
                  className="edit-song-panel__color-input"
                />
                <input
                  type="text"
                  value={formData.visualizerColor || "#ffffff"}
                  onChange={(e) => handleInputChange("visualizerColor", e.target.value)}
                  className="edit-song-panel__input"
                  style={{ width: '100px' }}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Visualizer Style</label>
              <select
                value={formData.visualizerStyle}
                onChange={(e) => handleInputChange("visualizerStyle", e.target.value)}
                className="edit-song-panel__select"
              >
                <option value="">&lt;Default&gt;</option>
                <option value="none">None</option>
                <option value="progressbar">Progress Bar</option>
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
                <option value="topbottom">Top and Bottom</option>
                <option value="sides">Sides</option>
                <option value="center">Center</option>
                <option value="circle">Singularity</option>
                <option value="circlelogo">Singularity with Logo</option>
                <option value="mirroredsingularity">Mirrored Singularity</option>
                <option value="mirroredsingularitywithlogo">Mirrored Singularity with Logo</option>
                <option value="waveform">Waveform</option>
                <option value="circularwaveform">Circular Waveform</option>
                <option value="orb">Orb</option>
              </select>
              <small className="edit-song-panel__help">Choose the visualizer style for this song</small>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Visualizer Intensity</label>
              <input
                type="number"
                value={formData.visualizerIntensity || ""}
                onChange={(e) => handleInputChange("visualizerIntensity", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="edit-song-panel__input"
                min="0.1"
                max="3.0"
                step="0.1"
                placeholder="1.0"
              />
              <small className="edit-song-panel__help">0.1-3.0, higher values = more intense visualizer</small>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__checkbox">
                <input
                  type="checkbox"
                  checked={formData.visualizerForceRainbowMode}
                  onChange={(e) => handleInputChange("visualizerForceRainbowMode", e.target.checked)}
                />
                Force Rainbow Mode
              </label>
              <small className="edit-song-panel__help">Enable rainbow colors for this song's visualizer</small>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Background Pulsing</label>
              <select
                value={formData.visualizerPulseBackground}
                onChange={(e) => handleInputChange("visualizerPulseBackground", e.target.value)}
                className="edit-song-panel__select"
              >
                <option value="">&lt;Default&gt;</option>
                <option value="pulse">Enabled</option>
                <option value="pulse-off">Disabled</option>
              </select>
              <small className="edit-song-panel__help">Makes the background pulse based on audio intensity</small>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Visualizer Glow</label>
              <select
                value={formData.visualizerGlow === true ? "enabled" : formData.visualizerGlow === false ? "disabled" : ""}
                onChange={(e) => handleInputChange("visualizerGlow", e.target.value === "enabled" ? true : e.target.value === "disabled" ? false : null)}
                className="edit-song-panel__select"
              >
                <option value="">&lt;Default&gt;</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
              <small className="edit-song-panel__help">Adds a glow effect to the visualizer bars/elements</small>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__label">Visualizer Opacity</label>
              <input
                type="number"
                value={formData.visualizerOpacity || ""}
                onChange={(e) => handleInputChange("visualizerOpacity", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="edit-song-panel__input"
                min="0.1"
                max="1.0"
                step="0.1"
                placeholder="0.7"
              />
              <small className="edit-song-panel__help">0.1-1.0, controls how transparent the visualizer appears</small>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__checkbox">
                <input
                  type="checkbox"
                  checked={formData.visualizerNormalize || false}
                  onChange={(e) => handleInputChange("visualizerNormalize", e.target.checked)}
                />
                Normalize Audio Data
              </label>
              <small className="edit-song-panel__help">Normalizes audio data for more consistent visualizer appearance</small>
            </div>

            <div className="edit-song-panel__field">
              <label className="edit-song-panel__checkbox">
                <input
                  type="checkbox"
                  checked={formData.visualizerShuffle || false}
                  onChange={(e) => handleInputChange("visualizerShuffle", e.target.checked)}
                />
                Shuffle Audio Data
              </label>
              <small className="edit-song-panel__help">Shuffles frequency data for more random appearance (not for waveform styles)</small>
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="edit-song-panel__section">
            <h3>Floating Title Settings</h3>
            
            <div className="edit-song-panel__field">
              <label className="edit-song-panel__checkbox">
                <input
                  type="checkbox"
                  checked={formData.floatingTitle}
                  onChange={(e) => handleInputChange("floatingTitle", e.target.checked)}
                />
                Enable Floating Title
              </label>
              <small className="edit-song-panel__help">Enables the floating title for this song</small>
            </div>

            {formData.floatingTitle && (
              <>
                <div className="edit-song-panel__field">
                  <label className="edit-song-panel__label">Floating Title Text</label>
                  <input
                    type="text"
                    value={formData.floatingTitleText}
                    onChange={(e) => handleInputChange("floatingTitleText", e.target.value)}
                    className="edit-song-panel__input"
                    placeholder="Defaults to song title if empty"
                  />
                  <small className="edit-song-panel__help">Set the text for the floating title</small>
                </div>

                <div className="edit-song-panel__field">
                  <label className="edit-song-panel__label">Position</label>
                  <select
                    value={formData.floatingTitlePosition}
                    onChange={(e) => handleInputChange("floatingTitlePosition", e.target.value)}
                    className="edit-song-panel__select"
                  >
                    <option value="">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>

                <div className="edit-song-panel__field">
                  <label className="edit-song-panel__checkbox">
                    <input
                      type="checkbox"
                      checked={formData.floatingTitleReactive}
                      onChange={(e) => handleInputChange("floatingTitleReactive", e.target.checked)}
                    />
                    Reactive to Music
                  </label>
                  <small className="edit-song-panel__help">Enables the floating title to react to the music</small>
                </div>

                <div className="edit-song-panel__field">
                  <label className="edit-song-panel__checkbox">
                    <input
                      type="checkbox"
                      checked={formData.floatingTitleUnderline}
                      onChange={(e) => handleInputChange("floatingTitleUnderline", e.target.checked)}
                    />
                    Show Underline
                  </label>
                  <small className="edit-song-panel__help">Gives the floating title an underline</small>
                </div>

                <div className="edit-song-panel__field">
                  <label className="edit-song-panel__checkbox">
                    <input
                      type="checkbox"
                      checked={formData.useFloatingTitleSubtitles}
                      onChange={(e) => handleInputChange("useFloatingTitleSubtitles", e.target.checked)}
                    />
                    Use Subtitles as Text
                  </label>
                  <small className="edit-song-panel__help">Use the subtitles if selected, as the text for the floating title. This overrides the text field</small>
                </div>

                <div className="edit-song-panel__field">
                  <label className="edit-song-panel__checkbox">
                    <input
                      type="checkbox"
                      checked={formData.floatingTitleOverrideVisualizer}
                      onChange={(e) => handleInputChange("floatingTitleOverrideVisualizer", e.target.checked)}
                    />
                    Override Visualizer
                  </label>
                  <small className="edit-song-panel__help">Enables the floating title to override the visualizer if necessary. Otherwise it's just placed on top</small>
                </div>
              </>
            )}

            {onDelete && (
              <div className="edit-song-panel__danger-zone">
                <h4>Danger Zone</h4>
                <Button
                  variant="subtle"
                  onClick={onDelete}
                  className="edit-song-panel__delete-btn"
                >
                  Delete Song
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
