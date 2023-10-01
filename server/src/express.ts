import express from "express";
import http from "http";
import https from "https";
import { Server as IoServer } from "socket.io";
import fs from "fs";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetch from "cross-fetch";
import ApiController from "./controllers/ApiController";
import Path from "path";
import { User } from "./sequelize";
import AppSystem from "./AppSystem";
// import { MySharedInterface } from "@shared/shared"; // Shared code between Client and Server

export function createToxenInstance(port: number) {
  const app = express();
  const io = new IoServer();

  let httpServer: http.Server  = http.createServer(app);
  httpServer.listen(port);

  io.listen(httpServer);

  console.log(`HTTP server started at http://localhost:${port}`);
  app.use("/api", ApiController.router);

  if (AppSystem.isDev) {
    // Proxy React from port 12463 to port {port} (ioncore-server)
    const reactPort = 12463;
    (async () => {
      console.log(`Waiting for React to start on port ${reactPort}...`);
      while (await fetch(`http://localhost:${reactPort}`).then(() => false).catch(() => true)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.log(`React started on port ${reactPort}`);
      app.use("/", createProxyMiddleware({
        target: `http://localhost:${reactPort}`,
        changeOrigin: true,

        // This is required to avoid CORS issues
        onProxyRes: (proxyRes, req, res) => {
          res.header("Access-Control-Allow-Origin", "*");
        }
      }));
    })();
  }
  else {
    // Serve static files from the build folder
    app.use(express.static("public"), (req, res) => res.sendFile("index.html", { root: "public" }));
  }


  /**************************
   * Socket.io Server handler
   **************************/
  io.on("connection", (socket) => {
    socket.on("subscribe", async (id: string, token?: string) => {
      const user = token ? await User.fromToken(token) : null;
      if (user) {
        console.log(`User ${user.username} subscribed to ${id}`);
      }
    });

    // Example with socket channel
    socket.on("__echo", (...data) => {
      console.log(...data);
      socket.emit("__echo", ...data);
    });
  });

  return {
    app,
    io,
    httpServer,
    port
  }
}