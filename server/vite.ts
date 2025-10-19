import type { Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";

export async function setupVite(app: Express) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve("client/index.html");
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  const server = createHttpServer(app);
  return server;
}

export async function serveStatic(app: Express) {
  const distPath = path.resolve("dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  const express = await import("express");
  app.use(express.default.static(distPath));

  app.use((_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
