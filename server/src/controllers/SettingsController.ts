import { Router } from "express";
import { User } from "../sequelize";
import { ISettings } from "@shared/ISettings";

namespace SettingsController {
  export const router = Router();
  
  router.get("/", User.$middleware(), async (req, res) => {
    const user = User.getAuthenticatedUser(req);
    res.json({ ...await user.getSettings() });
  });

  router.post("/", User.$middleware(), async (req, res) => {
    const user = User.getAuthenticatedUser(req);
    const settings = req.body as Partial<ISettings>;
    const sets = await user.saveSettings(settings);
    res.json({ ...sets });
  });
}

export default SettingsController;