import React, { useCallback, useState } from 'react'
import Track from '../../objects/Track';

import "./ToxenPlayer.scss";
import { IconArrowsShuffle, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerTrackNextFilled, IconPlayerTrackPrevFilled, IconRepeat } from '@tabler/icons-react';
import secondsToTimestamp from '../../helpers/secondsToTimestamp';
import PrimaryPanel from '../PrimaryPanel/PrimaryPanel';
import { useIdle, useResizeObserver } from '@mantine/hooks';
import { useSettings } from '../SettingsProvider/SettingsProvider';
import Slider from '../Slider/Slider';
import Button from '../Button/Button';
import { VisualizerStyle, VisualizerSettings, VisualizerRenderContext } from './types/VisualizerTypes';
import { ToxenVisualizer } from './visualizers/ToxenVisualizer';
import { useVisualizerSettings } from './settings/VisualizerSettings';

const ToxenPlayerContext = React.createContext<ToxenPlayer.ToxenPlayerController>({} as any);

export interface ToxenPlayerProps {
  /**
   * Children to display on the overlay.
   */
  children?: React.ReactNode;

  /**
   * Immediately play a URL or Track. URL must be absolute.
   */
  playTrack?: string | Track;

  /**
   * Whether or not to show the controls embedded.
   */
  controls?: boolean;

  /**
   * Whether or not to show the background.
   */
  background?: boolean;

  /**
   * Whether or not to show the volume slider.
   */
  volumeSlider?: boolean;

  /**
   * Whether or not to show the progress bar.
   */
  progressBar?: boolean;

  /**
   * Whether or not to show the primary panel.
   */
  primaryPanel?: boolean;

  /**
   * The width of the player.
   */
  width?: number;
  /**
   * The height of the player.
   */
  height?: number;

  /**
   * Whether or not to fill the screen.
   */
  fillscreen?: boolean;

  /**
   * On track ended
   */
  onEnded?: (track: Track) => void;

  /**
   * Visualizer style override
   */
  visualizerStyle?: VisualizerStyle;
  
  /**
   * Visualizer rainbow mode
   */
  visualizerRainbow?: boolean;
  
  /**
   * Visualizer glow effect
   */
  visualizerGlow?: boolean;
}

function ToxenPlayer(props: ToxenPlayerProps) {
  const controller = ToxenPlayer.useController();

  React.useEffect(() => {
    const unsubs: (() => void)[] = [];
    if (props.onEnded) {
      unsubs.push(controller.subscribeVideoEvent("ended", () => {
        if (controller.track) {
          props.onEnded!(controller.track);
        }
      }));
    }

    const onresize = (ev: UIEvent) => {
      if (props.fillscreen) {
        controller._setPlayerWidth(window.innerWidth);
        controller._setPlayerHeight(window.innerHeight);
      }
    }
    window.addEventListener("resize", onresize);
    
    return () => {
      unsubs.forEach(x => x());
      window.removeEventListener("resize", onresize);
    }
  }, [props.onEnded]);

  React.useEffect(() => {
    controller._setPlayerWidth(props.fillscreen ? window.innerWidth : (props.width ?? 800));
    controller._setPlayerHeight(props.fillscreen ? window.innerHeight : (props.height ?? 450));
  }, [props.width, props.height]);

  return (
    <div className="toxen-player-wrapper" style={{ width: controller.playerWidth, height: controller.playerHeight }}>
      <div className="toxen-player">
        <video className="toxen-player-video" ref={controller._setVideoRef} />
        {
          !controller.track && (
            <div className="toxen-player-no-track">
              <h1>No track selected</h1>
            </div>
          )
        }
        <div className="toxen-player-overlay">
          {props.background && (
            <ToxenPlayer.Background>
              <ToxenPlayer.AudioVisualizer 
                id="primary" 
                style={props.visualizerStyle ?? VisualizerStyle.CircularWaveform}
                rainbow={props.visualizerRainbow ?? false}
                glow={props.visualizerGlow ?? true}
                intensity={1.0}
                opacity={0.7}
              />
            </ToxenPlayer.Background>
          )}
          <div className="toxen-player-bottomsection">
            {props.controls && <ToxenPlayer.Controls />}
            {props.progressBar && <ToxenPlayer.ProgressBar />}
            {props.volumeSlider && <ToxenPlayer.VolumeSlider />}
          </div>

          {/* Children if any */}
          {props.children}
        </div>
      </div>
      {props.primaryPanel && <PrimaryPanel />}
    </div>
  )
}

namespace ToxenPlayer {
  export interface ToxenPlayerController {
    /**
     * The current track that is playing.
     */
    track: Track | null;
    /**
     * The list of tracks that are available to play.
     */
    trackList: Track[];
    /**
     * Sets the list of tracks that are available to play.
     */
    setTrackList: React.Dispatch<React.SetStateAction<Track[]>>;
    /**
     * Whether or not the current media is paused.
     */
    paused: boolean;
    /**
     * The video object that is used to play the media.
     * 
     * If you want to listen to events, use `controller.subscribeVideoEvent` to subscribe to events on this object.
     */
    videoRef: HTMLVideoElement | null;
    /**
     * Subscribes to events on the video object.  
     * Returns a function that unsubscribes from the event.
     */
    subscribeVideoEvent<K extends keyof HTMLVideoElementEventMap>(type: K, listener: (this: HTMLVideoElement, ev: HTMLVideoElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void;
    /**
     * Sets the video object that is used to play the media.
     * @internal
     */
    _setVideoRef: React.Dispatch<React.SetStateAction<HTMLVideoElement | null>>;
    /**
     * Plays the current media.
     */
    play(): void;
    /**
     * Starts playing the specified track.
     * @param track The track to play.
     */
    play(track: Track): void;
    /**
     * Starts playing the specified URL. URL must be absolute.
     * @param url The URL to play.
     */
    play(url: string): void;
    /**
     * Pauses the current media.
     */
    pause(): void;
    /**
     * Whether or not the current media is a video.
     */
    isVideo: boolean;
    /**
     * Set the volume of the media. 0-1
     */
    setVolume(volume: number): void;

    /**
     * The current volume of the media. 0-1
     */
    getVolume(): number;

    /**
     * Seeks to the specified time in seconds.
     */
    seekTo(seconds: number): void;

    /**
     * Seeks to the specified percent. 0-1
     */
    seekToPercent(percent: number): void;

    /**
     * Play the next track in the list.
     * 
     * ### Behavior
     * - If there is no track playing, it will play the first track in the list.
     * - If the current track is the last track in the list, it will play the first track in the list.
     * - If it is the only track in the list, it will restart the track.
     * - If Repeat is enabled, it will still play the next track and not restart the track. (Repeating is handled internally)
     * - If Shuffle is enabled, it will play a random track in the list.
     */
    next(): void;

    /**
     * Play the previous track in the list.
     * 
     * ### Behavior
     * - If there is no track playing, it will play the first track in the list.
     * - If the current track is the first track in the list, it will play the last track in the list.
     * - If it is the only track in the list, it will restart the track.
     */
    previous(): void;

    /**
     * Whether or not the player should repeat the current track when it ends.
     */
    repeat: boolean;

    /**
     * Set whether or not the player should repeat the current track when it ends.
     */
    setRepeat(repeat: boolean): void;

    /**
     * Whether or not the player should shuffle the tracks.
     */
    shuffle: boolean;

    /**
     * Set whether or not the player should shuffle the tracks.
     */
    setShuffle(shuffle: boolean): void;

    /**
     * Is Primary panel open
     */
    primaryPanelOpen: boolean;

    /**
     * Set Primary panel open
     */
    setPrimaryPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

    /**
     * Is the user idling.
     */
    isIdling: boolean;

    /**
     * The audio analyser.
     */
    audioAnalyser: AnalyserNode | null;

    /**
     * Width of the player. Updated on resize.
     */
    playerWidth: number;

    /**
     * Set width of the player.
     * @internal
     */
    _setPlayerWidth: React.Dispatch<React.SetStateAction<number>>;

    /**
     * Height of the player. Updated on resize.
     */
    playerHeight: number;

    /**
     * Set height of the player.
     * @internal
     */
    _setPlayerHeight: React.Dispatch<React.SetStateAction<number>>;
  }

  /**
   * Provides the ToxenPlayerController to the children.  
   * Inside the children, you can use the `ToxenPlayer.useController()` hook to get the controller, and use it to control a `ToxenPlayer`.
   */
  export function Provider(props: {
    children: React.ReactNode
    /**
     * Whether or not the player should repeat the current track when it ends.
     */
    repeat?: boolean;

    /**
     * Whether or not the player should shuffle the tracks.
     */
    shuffle?: boolean;
  }) {
    const { children, repeat: _repeat = false, shuffle: _shuffle = false } = props;
    const settings = useSettings();

    const [trackIndex, setTrackIndex] = useState<number>(-1);
    const [track, setTrack] = useState<Track | null>(null);

    const [trackList, setTrackList] = useState<Track[]>([]);

    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

    const subscribeVideoEvent = React.useCallback<ToxenPlayerController["subscribeVideoEvent"]>((type, listener, options) => {
      if (!videoRef) return () => { };
      videoRef.addEventListener(type, listener, options);

      return () => {
        if (!videoRef) return;
        videoRef.removeEventListener(type, listener, options);
      }
    }, [videoRef]);

    const [paused, setPaused] = useState<boolean>(true);

    const play = React.useCallback((track?: Track | string) => {
      if (!videoRef) return;
      if (track) {
        if (typeof track === "string") {
          videoRef.src = track;
          setTrack(null);
          setTrackIndex(-1);
        }
        else {
          const src = track.mediaPath;
          if (src) {
            videoRef.src = src;
            const index = trackList.indexOf(track);
            setTrackIndex(index);
            setTrack(track);
          }
          else {
            throw new Error("Track does not have a mediaPath");
          }
        }
      }
      videoRef.play();
    }, [videoRef, trackList]);

    const pause = React.useCallback(() => {
      if (!videoRef) return;
      videoRef.pause();
    }, [videoRef]);

    const isVideo = React.useMemo(() => {
      return videoRef?.src?.endsWith(".mp4") ?? false;
    }, [videoRef?.src]);

    const setVolume = React.useCallback((volume: number) => {
      if (!videoRef) return;
      videoRef.volume = volume;
    }, [videoRef]);

    const getVolume = React.useCallback(() => {
      if (!videoRef) return 0;
      return videoRef.volume;
    }, [videoRef]);

    const seekTo = React.useCallback((time: number) => {
      if (!videoRef) return;
      videoRef.currentTime = time;
    }, [videoRef]);

    const seekToPercent = React.useCallback((percent: number) => {
      if (!videoRef) return;
      videoRef.currentTime = percent * (videoRef.duration ?? 0);
    }, [videoRef]);

    const next = React.useCallback(() => {
      if (!videoRef) return;
      if (trackList.length === 0) return;
      if (trackIndex === -1) {
        play(trackList[0]);
        return;
      }
      if (trackIndex === trackList.length - 1) {
        play(trackList[0]);
        return;
      }
      play(trackList[trackIndex + 1]);
    }, [trackIndex, trackList, videoRef]);

    const previous = React.useCallback(() => {
      if (!videoRef) return;
      if (trackList.length === 0) return;
      if (trackIndex === -1) {
        play(trackList[0]);
        return;
      }
      if (trackIndex === 0) {
        play(trackList[trackList.length - 1]);
        return;
      }
      play(trackList[trackIndex - 1]);
    }, [trackIndex, trackList, videoRef]);

    const [repeat, setRepeat] = React.useState<boolean>(_repeat);

    const [shuffle, setShuffle] = React.useState<boolean>(_shuffle);

    const [primaryPanelOpen, setPrimaryPanelOpen] = React.useState<boolean>(false);

    const isIdling = useIdle(1000 * 4);

    const [audioAnalyser, setAudioAnalyser] = React.useState<AnalyserNode | null>(null);

    const [playerWidth, setPlayerWidth] = React.useState<number>(0);

    const [playerHeight, setPlayerHeight] = React.useState<number>(0);

    // Subscribe to events
    React.useEffect(() => {

      setVolume((settings.get("volume") ?? 0) / 100);

      const onPause = () => setPaused(true);
      const onPlay = () => setPaused(false);
      if (videoRef) {
        videoRef.addEventListener("pause", onPause);
        videoRef.addEventListener("play", onPlay);
      }

      return () => {
        if (videoRef) {
          videoRef.removeEventListener("pause", onPause);
          videoRef.removeEventListener("play", onPlay);
        }
      }
    }, [videoRef, settings.get("volume")]);

    // If player starts first time, generate audio analyser
    React.useEffect(() => {
      if (!videoRef || audioAnalyser || paused) return;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaElementSource(videoRef);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      setAudioAnalyser(analyser);
    }, [paused, videoRef]);

    return (
      <ToxenPlayerContext.Provider value={{
        track,
        trackList,
        setTrackList,
        paused,
        videoRef,
        subscribeVideoEvent,
        _setVideoRef: setVideoRef,
        play,
        pause,
        isVideo,
        setVolume,
        getVolume,
        seekTo,
        seekToPercent,
        next,
        previous,
        repeat,
        setRepeat,
        shuffle,
        setShuffle,
        primaryPanelOpen,
        setPrimaryPanelOpen,
        isIdling,
        audioAnalyser,
        playerWidth,
        _setPlayerWidth: setPlayerWidth,
        playerHeight,
        _setPlayerHeight: setPlayerHeight,
      }}>
        {children}
      </ToxenPlayerContext.Provider>
    )
  }
  /**
   * Gets the controller for the ToxenPlayer. This is used to have full control over the ToxenPlayer.  
   * This is only available inside a `ToxenPlayerProvider`.
   * @returns A ToxenPlayerController object associated with the ToxenPlayer.
   */
  export function useController() {
    const ctrl = React.useContext(ToxenPlayerContext);
    // if (!ctrl) throw new Error("ToxenPlayerController is not available outside of a ToxenPlayerProvider.");
    return ctrl;
  };

  /**
   * Displays a background.
   */
  export function Background(props: { children?: React.ReactNode }) {
    const controller = ToxenPlayer.useController();
    const [background, setBackground] = React.useState<string | undefined>();

    React.useEffect(() => {
      if (controller.track) {
        const bg = controller.track.backgroundPath ?? undefined;
        setBackground(bg);
      }
    }, [controller.track, controller.videoRef]);

    return (
      <div className="toxen-player-background">
        {background && <img src={background} alt="Track background" className="toxen-player-background-img" />}
        <div className="toxen-player-background-overlay">
          {props.children}
        </div>
      </div>
    );
  }

  /**
   * Displays a set of default control buttons.
   */
  export function Controls() {
    const controller = ToxenPlayer.useController();

    return (
      <div className="toxen-player-controls">
        <Button variant="subtle" onClick={() => {
          controller.previous();
        }}><IconPlayerTrackPrevFilled /></Button>
        <Button variant="subtle" color={!controller.shuffle ? "gray" : undefined} onClick={() => {
          controller.setShuffle(!controller.shuffle);
        }}><IconArrowsShuffle /></Button>
        {
          controller.paused ? (
            <Button variant="subtle" onClick={() => {
              if (controller.videoRef) {
                controller.play();
              }
            }}><IconPlayerPlayFilled /></Button>
          ) : (
            <Button variant="subtle" onClick={() => {
              if (controller.videoRef) {
                controller.pause();
              }
            }}><IconPlayerPauseFilled /></Button>
          )
        }
        <Button variant="subtle" color={!controller.repeat ? "gray" : undefined} onClick={() => {
          controller.setRepeat(!controller.repeat);
        }}><IconRepeat /></Button>
        <Button variant="subtle" onClick={() => {
          controller.next();
        }}><IconPlayerTrackNextFilled /></Button>
      </div>
    )
  }

  /**
   * Displays a volume slider.
   */
  export function VolumeSlider() {
    const controller = ToxenPlayer.useController();
    const [volume, setVolume] = React.useState<number>(50);
    const settings = useSettings();

    React.useEffect(() => {
      setVolume(controller.getVolume() * 100);

      // Subscribe to volume change
      return controller.subscribeVideoEvent("volumechange", () => {
        setVolume(controller.getVolume() * 100);
      });
    }, [controller.getVolume()]);

    return (
      <div className="toxen-player-volume-slider">
        <Slider
          className="toxen-player-volume-slider-bar"
          value={volume}
          onChange={v => { setVolume(v); controller.setVolume(v / 100); settings.set("volume", v); }}
          onChangeEnd={v => { setVolume(v); controller.setVolume(v / 100); settings.set("volume", v); }}
          min={0}
          max={100}
          label={(v) => `${Math.round(v)}%`}
          containerStyle={{
            width: "50cqw"
          }}
        />
      </div>
    )
  }

  /**
   * Display the current progress of the media. Can be used to seek.
   */
  export function ProgressBar() {
    const controller = ToxenPlayer.useController();
    const [progress, setProgress] = React.useState<number>(0);
    const [seeking, setSeeking] = React.useState<boolean>(false);

    React.useEffect(() => {
      if (controller.videoRef && controller.videoRef.duration && !seeking) {
        setProgress(controller.videoRef.currentTime);
      }

      // Subscribe to time update
      return controller.subscribeVideoEvent("timeupdate", () => {
        if (controller.videoRef && controller.videoRef.duration && !seeking) {
          setProgress(controller.videoRef.currentTime);
        }
      });

    }, [controller.videoRef?.currentTime, controller.videoRef?.duration]);

    return (
      <div className="toxen-player-progress-bar">
        <Slider
          className="toxen-player-progress-bar-bar"
          thumbSize={16}
          size={4}
          value={progress}
          onChange={v => {
            setProgress(v);
            // controller.seekTo(v);
            setSeeking(true);
          }}
          step={0.01}
          onChangeEnd={v => {
            const isEnded = controller.videoRef?.ended;
            controller.seekTo(v);
            if (isEnded) {
              controller.play();
            }
            setSeeking(false);
          }}
          min={0}
          max={controller.videoRef?.duration || 1}
          label={(v) => `${secondsToTimestamp(v, "minutes")} / ${secondsToTimestamp(controller.videoRef?.duration || 0, "minutes")}`}
          containerStyle={{
            width: "85cqw"
          }}
        />
      </div>
    );
  }

  // Used to cancel old animation frames to avoid duplicate draw calls.
  const audioVisualizerDrawFunctions: Record<string, () => void> = {};

  /**
   * Audio visualizer effects. Animations on the background are drawn by a canvas.
   */
  export function AudioVisualizer(props: {
    /**
     * This is mandatory. It is used to identify the canvas and prevent duplicate draws.
     */
    id: string;
    /**
     * The visualizer style to use
     */
    style?: VisualizerStyle;
    /**
     * Whether to enable rainbow mode
     */
    rainbow?: boolean;
    /**
     * Whether to enable glow effects
     */
    glow?: boolean;
    /**
     * Whether to enable background pulsing
     */
    pulseBackground?: boolean;
    /**
     * Whether to normalize audio data
     */
    normalize?: boolean;
    /**
     * Whether to shuffle the audio data for more random appearance
     */
    shuffle?: boolean;
    /**
     * Visualizer intensity multiplier
     */
    intensity?: number;
    /**
     * Opacity of the visualizer bars (0-1)
     */
    opacity?: number;
  }) {
    const controller = ToxenPlayer.useController();
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
    const [visualizer] = React.useState(() => new ToxenVisualizer());
    const [animationFrame, setAnimationFrame] = React.useState<number>(0);

    const settings = useSettings();
    const globalSettings = useVisualizerSettings();

    // Create visualizer settings from props, global settings, and user settings
    const visualizerSettings: VisualizerSettings = React.useMemo(() => {
      const trackData = controller.track?.data;
      
      // Helper function to convert track visualizer style string to enum
      const getTrackVisualizerStyle = (styleString?: string): VisualizerStyle | undefined => {
        if (!styleString) return undefined;
        return Object.values(VisualizerStyle).find(style => style === styleString);
      };
      
      return {
        style: props.style ?? getTrackVisualizerStyle(trackData?.visualizerStyle) ?? globalSettings.style,
        color: trackData?.visualizerColor ?? globalSettings.color,
        rainbow: props.rainbow ?? trackData?.visualizerForceRainbowMode ?? globalSettings.rainbow,
        glow: props.glow ?? trackData?.visualizerGlow ?? globalSettings.glow,
        pulseBackground: props.pulseBackground ?? 
          (trackData?.visualizerPulseBackground === "pulse" ? true :
           trackData?.visualizerPulseBackground === "pulse-off" ? false :
           globalSettings.pulseBackground),
        normalize: props.normalize ?? trackData?.visualizerNormalize ?? globalSettings.normalize,
        shuffle: props.shuffle ?? trackData?.visualizerShuffle ?? globalSettings.shuffle,
        intensity: props.intensity ?? trackData?.visualizerIntensity ?? globalSettings.intensity,
        opacity: props.opacity ?? trackData?.visualizerOpacity ?? globalSettings.opacity,
        backgroundDim: settings.get("backgroundDim") ?? globalSettings.backgroundDim,
        dynamicLighting: globalSettings.dynamicLighting,
        fftSize: globalSettings.fftSize,
      };
    }, [
      props.style, props.rainbow, props.glow, props.pulseBackground, 
      props.normalize, props.shuffle, props.intensity, props.opacity,
      controller.track?.data?.visualizerColor,
      controller.track?.data?.visualizerStyle,
      controller.track?.data?.visualizerIntensity,
      controller.track?.data?.visualizerForceRainbowMode,
      controller.track?.data?.visualizerPulseBackground,
      controller.track?.data?.visualizerGlow,
      controller.track?.data?.visualizerOpacity,
      controller.track?.data?.visualizerNormalize,
      controller.track?.data?.visualizerShuffle,
      settings.get("backgroundDim"),
      globalSettings,
      controller.track?.uid // Add track UID to ensure updates when track changes
    ]);

    // Main draw function
    audioVisualizerDrawFunctions[props.id] = React.useCallback(() => {
      if (!controller.audioAnalyser || !canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get the actual display size of the canvas container
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;
      
      // Check if canvas dimensions need updating
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      // Create render context
      const renderContext: VisualizerRenderContext = {
        canvas,
        ctx,
        audioAnalyser: controller.audioAnalyser,
        width: canvas.width,
        height: canvas.height,
        settings: visualizerSettings,
        time: performance.now(),
        color: visualizerSettings.color,
      };

      // Render the visualizer
      visualizer.render(renderContext);

      // Schedule next frame
      const newFrameId = requestAnimationFrame(audioVisualizerDrawFunctions[props.id]);
      setAnimationFrame(newFrameId);
    }, [controller.audioAnalyser, canvas, visualizerSettings, visualizer]);

    // Start/stop animation loop
    React.useEffect(() => {
      if (canvas && controller.audioAnalyser) {
        audioVisualizerDrawFunctions[props.id]();
      }
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [canvas, controller.audioAnalyser, props.id]);

    return (
      <div className="toxen-player-audio-visualizer">
        <canvas 
          className="toxen-player-audio-visualizer-canvas" 
          ref={setCanvas} 
        />
      </div>
    );
  }
}

export default ToxenPlayer;