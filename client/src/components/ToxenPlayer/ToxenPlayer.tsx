import React, { useState } from 'react'
import Track from '../../objects/Track';

import "./ToxenPlayer.scss";
import { Button, Slider } from '@mantine/core';
import { IconArrowsShuffle, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerTrackNextFilled, IconPlayerTrackPrevFilled, IconRepeat } from '@tabler/icons-react';
import secondsToTimestamp from '../../helpers/secondsToTimestamp';
import PrimaryPanel from '../PrimaryPanel/PrimaryPanel';
import { useIdle, useResizeObserver } from '@mantine/hooks';
import { useSettings } from '../SettingsProvider/SettingsProvider';

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
              <ToxenPlayer.AudioVisualizer />
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

      setVolume(settings.get("volume")! / 100);

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
      setVolume(controller.getVolume());

      // Subscribe to volume change
      return controller.subscribeVideoEvent("volumechange", () => {
        setVolume(controller.getVolume());
      });
    }, [controller.getVolume()]);

    return (
      <div className="toxen-player-volume-slider">
        <Slider
          className="toxen-player-volume-slider-bar"
          value={volume}
          onChange={v => { setVolume(v); controller.setVolume(v) }}
          onChangeEnd={v => { setVolume(v); controller.setVolume(v); settings.set("volume", v * 100); }}
          min={0}
          max={1}
          step={0.01}
          label={(v) => `${Math.round(v * 100)}%`}
          style={{
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
          size="xl"
          value={progress}
          onChange={v => {
            setProgress(v);
            // controller.seekTo(v);
            setSeeking(true);
          }}
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
          step={1}
          label={(v) => `${secondsToTimestamp(v, "minutes")} / ${secondsToTimestamp(controller.videoRef?.duration || 0, "minutes")}`}
          style={{
            width: "90cqw"
          }}
        />
      </div>
    );
  }

  /**
   * Audio visualizer effects. Animations on the background are drawn by a canvas.
   */
  export function AudioVisualizer() {
    const controller = ToxenPlayer.useController();
    const [bufferLength, setBufferLength] = React.useState<number>(0);
    const [dataArray, setDataArray] = React.useState<Uint8Array | null>(null);
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
    // const [canvasContext, setCanvasContext] = React.useState<CanvasRenderingContext2D | null>(null);
    // const [canvasWidth, setCanvasWidth] = React.useState<number>(0);
    // const [canvasHeight, setCanvasHeight] = React.useState<number>(0);
    const [animationFrame, setAnimationFrame] = React.useState<number>(0);

    const settings = useSettings();

    React.useEffect(() => {
      if (!controller.videoRef) return;
      const { audioAnalyser } = controller;
      if (!audioAnalyser) return;
      audioAnalyser.fftSize = 512;
      const bufferLength = audioAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setBufferLength(bufferLength);
      setDataArray(dataArray);
    }, [controller.videoRef, controller.audioAnalyser]);

    React.useEffect(() => {
      const { audioAnalyser } = controller;
      if (!audioAnalyser) return;
      if (!canvas) return;

      const canvasCtx = canvas?.getContext("2d");
      if (!canvasCtx) return;
      // setCanvasContext(canvasCtx);
      // setCanvasWidth(canvas.width);
      // setCanvasHeight(canvas.height);


      if (!dataArray) return;

      const draw = () => {
        setAnimationFrame(requestAnimationFrame(draw));

        // Resize canvas
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        audioAnalyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = `rgba(0, 0, 0, ${(settings.get("backgroundDim") ?? 0) / 100})`;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        // canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        canvasCtx.fillStyle = controller.track?.data.visualizerColor ?? "#fff";
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] * 1.5;
          canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
          x += barWidth;
        }
      }

      draw();

      return () => {
        cancelAnimationFrame(animationFrame);
      }
    }, [controller.audioAnalyser, canvas, dataArray, controller.track, settings]);

    return (
      <div className="toxen-player-audio-visualizer">
        <canvas className="toxen-player-audio-visualizer-canvas" ref={setCanvas} width={1920} height={1080}/>
      </div>
    );
  }
}

export default ToxenPlayer;