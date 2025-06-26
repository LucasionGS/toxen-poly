import express, { Router, urlencoded } from "express";
import { User } from "../sequelize";

namespace TrackController {
  export const router = Router();
  router.get("/", User.$middleware(), async (req, res) => {
    const user = User.getAuthenticatedUser(req);
    const tracks = await user.getTracks();
    res.json({ tracks });
  });

  router.get("/:foldername", User.$middleware(), async (req, res) => {
    const user = User.getAuthenticatedUser(req);
    const track = await user.getTrack(req.params.foldername);
    if (!track) {
      return res.status(404).send("Not found");
    }
    res.json({ track });
  });
  
  router.get("/:foldername/*", User.$middleware(), async (req, res) => {
    const user = User.getAuthenticatedUser(req);
    const track = await user.getTrack(req.params.foldername);
    
    if (!track || !track.paths) {
      return res.status(404).send("Not found");
    }
    const musicPath = await user.getMusicPath();
    const decoded = decodeURIComponent(req.path);
    res.sendFile(decoded, {
      root: musicPath
    });
  });

  router.put("/:foldername", User.$middleware(), async (req, res) => {
    try {
      const user = User.getAuthenticatedUser(req);
      const track = await user.getTrack(req.params.foldername);
      
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }

      // Update track data with the provided information
      const updateData = req.body;
      const updatedTrack = await user.updateTrack(req.params.foldername, updateData);
      
      res.json({ success: true, track: updatedTrack });
    } catch (error) {
      console.error("Error updating track:", error);
      res.status(500).json({ error: "Failed to update track" });
    }
  });
}

export default TrackController;