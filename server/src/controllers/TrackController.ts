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
}

export default TrackController;