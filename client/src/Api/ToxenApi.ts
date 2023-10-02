import { ISettings } from "@shared/ISettings";
import Settings from "../objects/Settings";
import Track from "../objects/Track";
import { ITrack } from "@shared/ITrack";

namespace ToxenApi {
  export let server = window.location.protocol + "//" + window.location.host;

  export function setServer(server: string) {
    ToxenApi.server = server;
  }

  export function getTrackURL(track: Track) {
    return track.data.paths?.dirname ? `${ToxenApi.server}/api/track/${track.data.paths?.dirname}` : null;
  }

  export async function getTrack(uid: string) {
    return await fetch(`${ToxenApi.server}/api/track/${uid}`).then(r => r.json());
  }

  export async function getTracks() {
    return await fetch(`${ToxenApi.server}/api/track`)
      .then(r => r.json())
      .then((r: { tracks: ITrack[] }) => r.tracks.map(t => new Track(t)));
  }

  export async function getSettings(): Promise<Settings> {
    return await fetch(`${ToxenApi.server}/api/settings`).then(r => r.json()).then((r: ISettings) => new Settings(r));
  }

  export async function saveSettings(settings: Partial<ISettings>): Promise<void>;
  export async function saveSettings(settings: Partial<ISettings>, applyTo?: Settings): Promise<void>;
  export async function saveSettings(settings: Partial<ISettings>, applyTo?: Settings) {
    if (applyTo) applyTo.apply(settings);
    await fetch(`${ToxenApi.server}/api/settings`, {
      method: "POST",
      body: JSON.stringify(settings),
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}

export default ToxenApi;