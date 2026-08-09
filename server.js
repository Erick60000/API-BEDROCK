import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import { compileAddon } from "./compiler.js";

const app = express();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 512 * 1024 * 1024 }
});

app.use(express.static("frontend"));

app.post("/api/compile", upload.single("addon"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo." });

  try {
    const result = await compileAddon(req.file.path, req.file.originalname);
    res.download(result.outputPath, result.downloadName, async () => {
      await fs.rm(req.file.path, { force: true }).catch(() => {});
      await fs.rm(path.dirname(result.outputPath), { recursive: true, force: true }).catch(() => {});
    });
  } catch (error) {
    await fs.rm(req.file.path, { force: true }).catch(() => {});
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("BRArchive Compiler: http://localhost:3000");
});
