import { Router } from "express";
import { User } from "../sequelize";
import AppSystem from "../AppSystem";
import fs from "fs";
import Path from "path";
import { ITrack } from "@shared/ITrack";
import { randomUUID } from "crypto";

namespace UploadController {
  export const router = Router();

  // Upload music files
  router.post("/music", User.$middleware(), AppSystem.uploader.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'background', maxCount: 1 },
    { name: 'subtitles', maxCount: 1 },
    { name: 'storyboard', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const user = User.getAuthenticatedUser(req);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Validate required fields
      if (!files.audio || files.audio.length === 0) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      const { artist, title, album, year, language, tags, visualizerColor } = req.body;
      
      if (!artist || !title) {
        return res.status(400).json({ error: "Artist and title are required" });
      }

      // Create unique track UID and folder
      const trackUid = randomUUID();
      const musicPath = await user.getMusicPath();
      const trackFolder = Path.join(musicPath, trackUid);
      
      // Create track directory
      if (!fs.existsSync(trackFolder)) {
        fs.mkdirSync(trackFolder, { recursive: true });
      }

      // Process uploaded files
      const audioFile = files.audio[0];
      const backgroundFile = files.background?.[0];
      const subtitlesFile = files.subtitles?.[0];
      const storyboardFile = files.storyboard?.[0];

      // Move audio file
      const audioExtension = Path.extname(audioFile.originalname);
      const audioFileName = `audio${audioExtension}`;
      const audioPath = Path.join(trackFolder, audioFileName);
      fs.renameSync(audioFile.path, audioPath);

      // Create track paths object
      const trackPaths: any = {
        dirname: trackUid,
        media: audioFileName
      };

      // Move background image if provided
      if (backgroundFile) {
        const bgExtension = Path.extname(backgroundFile.originalname);
        const bgFileName = `background${bgExtension}`;
        const bgPath = Path.join(trackFolder, bgFileName);
        fs.renameSync(backgroundFile.path, bgPath);
        trackPaths.background = bgFileName;
      }

      // Move subtitles if provided
      if (subtitlesFile) {
        const subExtension = Path.extname(subtitlesFile.originalname);
        const subFileName = `subtitles${subExtension}`;
        const subPath = Path.join(trackFolder, subFileName);
        fs.renameSync(subtitlesFile.path, subPath);
        trackPaths.subtitles = subFileName;
      }

      // Move storyboard if provided
      if (storyboardFile) {
        const storyExtension = Path.extname(storyboardFile.originalname);
        const storyFileName = `storyboard${storyExtension}`;
        const storyPath = Path.join(trackFolder, storyFileName);
        fs.renameSync(storyboardFile.path, storyPath);
        trackPaths.storyboard = storyFileName;
      }

      // Create track metadata
      const trackData: ITrack = {
        uid: trackUid,
        artist: artist,
        coArtists: [],
        title: title,
        album: album || "",
        year: year ? parseInt(year) : undefined,
        language: language || undefined,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : undefined,
        visualizerColor: visualizerColor || undefined,
        paths: trackPaths
      };

      // Save track info.json
      const infoPath = Path.join(trackFolder, "info.json");
      fs.writeFileSync(infoPath, JSON.stringify(trackData, null, 2));

      res.json({ 
        success: true, 
        track: trackData,
        message: "Music uploaded successfully" 
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload music" });
    }
  });

  // Get upload progress (placeholder for future implementation)
  router.get("/progress/:uploadId", User.$middleware(), async (req, res) => {
    // This could be implemented with socket.io for real-time progress
    res.json({ progress: 100, status: "completed" });
  });
}

export default UploadController;
