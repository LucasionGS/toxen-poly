import { Router, json } from "express";
import UserController from "./UserController";
import TrackController from "./TrackController";
import SettingsController from "./SettingsController";
import UploadController from "./UploadController";

namespace ApiController {
  export const router = Router();
  export const jsonMw = json();

  router.get("/", (req, res) => {
    res.json({ message: "Hello from the API!" });
  });

  router.use("/user", jsonMw, UserController.router);
  router.use("/track", jsonMw, TrackController.router);
  router.use("/settings", jsonMw, SettingsController.router);
  router.use("/upload", UploadController.router); // Note: no jsonMw here as it handles multipart forms
}

export default ApiController;