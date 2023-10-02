import { Router, json } from "express";
import UserController from "./UserController";
import TrackController from "./TrackController";
import SettingsController from "./SettingsController";

namespace ApiController {
  export const router = Router();
  export const jsonMw = json();

  router.get("/", (req, res) => {
    res.json({ message: "Hello from the API!" });
  });

  router.use("/user", jsonMw, UserController.router);
  router.use("/track", jsonMw, TrackController.router);
  router.use("/settings", jsonMw, SettingsController.router);
}

export default ApiController;