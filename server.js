import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { compileAddon } from "./compiler/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({
  dest: path.join(os.tmpdir(), "brarchive-uploads"),
  limits: { fileSize: 1024 * 1024 * 1024 }
});

app.use(express.static(path.join(__dirname, "frontend")));

app.post("/api/compile", upload.single("addon"), async (req, res) => {
  let job;
  try {
    if (!req.file) throw new Error("No se recibió ningún .mcaddon.");
    if (!req.file.originalname.toLowerCase().endsWith(".mcaddon")) {
      throw new Error("El archivo debe tener extensión .mcaddon.");
    }

    job = await compileAddon(req.file.path, req.file.originalname);
    res.download(job.outputPath, job.downloadName, async () => {
      await job.cleanup().catch(() => {});
      await fs.rm(req.file.path, { force: true }).catch(() => {});
    });
  } catch (error) {
    if (job) await job.cleanup().catch(() => {});
    if (req.file) await fs.rm(req.file.path, { force: true }).catch(() => {});
    res.status(500).json({ error: error.message || "Error de compilación." });
  }
});

app.get("/api/health", async (_req, res) => {
  res.json({ ok: true, service: "BRArchive Compiler", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`BRArchive Compiler ejecutándose en http://localhost:${PORT}`);
});