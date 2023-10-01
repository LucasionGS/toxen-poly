import Track from "../objects/Track";
import { ITrack } from "@shared/track";

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
}

export default ToxenApi;