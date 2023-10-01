import dotenv from "dotenv"; dotenv.config(); // Load .env file
import { createToxenInstance } from "./express";
import net from "net";
import electron, { BrowserWindow } from "electron";

const isElectron = process.versions.hasOwnProperty('electron');
const _args = process.argv.slice(2);
const [command, ...commandArgs] = _args;

const commands: Record<string, (...args: string[]) => void> = {
  async start(...args) {
    let _port = args.filter(a => a.match(/^-?-?port$/i))
      .map(a => a.split("=")[1] || args[args.indexOf(a) + 1])
      .map(a => parseInt(a))
      .find(a => !isNaN(a)) || +(process.env.PORT || 10742);
    
    async function _start(port: number) {
      return new Promise<ReturnType<typeof createToxenInstance>>((resolve, reject) => {
        // Check if port is already in use
        const server = net.createServer();
        server.once("error", (err) => {
          console.error(err);
          if ((err as any).code === "EADDRINUSE") {
            console.log(`Port ${port} is already in use. Trying next port...`);
            port++;
            _start(port);
          }
        });
        server.once("listening", () => {
          server.close();
          console.log(`Starting Toxen Server on port ${port}`);
          resolve(createToxenInstance(port));
        });

        server.listen(port);
      });
    }

    const toxenInstance = await _start(_port);
    // Launch Electron if it is applicable
    if (!isElectron) return;
    electron.app.on("ready", () => {
      const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720
      });

      mainWindow.setAutoHideMenuBar(true);

      mainWindow.loadURL(`http://localhost:${toxenInstance.port}`);
      mainWindow.on("closed", () => {
        electron.app.quit();
      });
    });
  }
}

const func = commands[command];
if (isElectron && command !== "start") {
  commands.start();
}
else if (func) {
  func(...commandArgs);
}
else {
  console.log("Unknown command. Available commands: \n\t" + Object.keys(commands).join("\n\t"));
}