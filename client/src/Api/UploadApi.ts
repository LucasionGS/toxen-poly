import BaseApi from "./BaseApi";

export interface UploadMusicRequest {
  audio: File;
  background?: File;
  subtitles?: File;
  storyboard?: File;
  artist: string;
  title: string;
  album?: string;
  year?: number;
  language?: string;
  tags?: string[];
  visualizerColor?: string;
}

namespace UploadApi {
  export async function uploadMusic(data: UploadMusicRequest) {
    const formData = new FormData();
    
    // Add files
    formData.append('audio', data.audio);
    if (data.background) formData.append('background', data.background);
    if (data.subtitles) formData.append('subtitles', data.subtitles);
    if (data.storyboard) formData.append('storyboard', data.storyboard);
    
    // Add metadata
    formData.append('artist', data.artist);
    formData.append('title', data.title);
    if (data.album) formData.append('album', data.album);
    if (data.year) formData.append('year', data.year.toString());
    if (data.language) formData.append('language', data.language);
    if (data.tags && data.tags.length > 0) formData.append('tags', data.tags.join(','));
    if (data.visualizerColor) formData.append('visualizerColor', data.visualizerColor);

    return BaseApi.POSTFormData("/upload/music", {}, formData);
  }

  export async function getUploadProgress(uploadId: string) {
    return BaseApi.GET(`/upload/progress/${uploadId}`).then(r => r.json());
  }
}

export default UploadApi;
