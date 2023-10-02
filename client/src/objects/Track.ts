import BaseApi from "../Api/BaseApi";
import ToxenApi from "../Api/ToxenApi";
import { VisualizerStyle } from "./VisualizerStyle";
import { ITrack, ITrackPaths } from "@shared/ITrack";

export default class Track {
  public data: ITrack;
  constructor(data: ITrack) {
    this.data = data;
  }

  public get uid() {
    return this.data.uid;
  }

  public get artist() {
    return this.data.artist;
  }

  public get title() {
    return this.data.title;
  }

  /**
   * Returns the full path to the media file.
   */
  public get mediaPath() {
    if (this.data.paths?.media) {
      return `${ToxenApi.getTrackURL(this)}/${this.data.paths.media}`;
    }
    return null;
  }

  /**
   * Returns the full path to the background image.
   */
  public get backgroundPath() {
    if (this.data.paths?.background) {
      return `${ToxenApi.getTrackURL(this)}/${this.data.paths.background}`;
    }
    return null;
  }

  /**
   * Returns the full path to the subtitle file.
   */
  public get subtitlePath() {
    if (this.data.paths?.subtitles) {
      return `${ToxenApi.getTrackURL(this)}/${this.data.paths.subtitles}`;
    }
    return null;
  }

  /**
   * Returns the full path to the storyboard file.
   */
  public get storyboardPath() {
    if (this.data.paths?.storyboard) {
      return `${ToxenApi.getTrackURL(this)}/${this.data.paths.storyboard}`;
    }
    return null;
  }
}