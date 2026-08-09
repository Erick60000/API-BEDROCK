import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import unzipper from "unzipper";
import archiver from "archiver";

export async function compileAddon(inputPath, originalName) {
  const work = await fs.mkdtemp(path.join(os.tmpdir(), "brarchive-"));
  const extracted = path.join(work, "extracted");
  const outputDir = path.join(work, "output");
  await fs.mkdir(extracted, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  // Stage 1: extract the .mcaddon.
  await fs.createReadStream(inputPath).pipe(unzipper.Extract({ path: extracted })).promise();

  // Stage 2: locate .mcpack files and unpack them.
  const packs = await findFiles(extracted, ".mcpack");
  for (const pack of packs) {
    const packDir = pack + ".dir";
    await fs.mkdir(packDir, { recursive: true });
    await fs.createReadStream(pack).pipe(unzipper.Extract({ path: packDir })).promise();
  }

  // IMPORTANT:
  // BRArchive generation is intentionally isolated here.
  // The exact archive-selection rules must be implemented from the
  // verified BRArchive specification before changing addon contents.
  // For now this produces a structurally safe re-pack of the original addon.
  const outputPath = path.join(outputDir, originalName.replace(/\.mcaddon$/i, "") + "_compiled.mcaddon");
  await zipDirectory(extracted, outputPath);

  return {
    outputPath,
    downloadName: path.basename(outputPath)
  };
}

async function findFiles(dir, extension) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await findFiles(full, extension));
    else if (entry.name.toLowerCase().endsWith(extension)) result.push(full);
  }
  return result;
}

function zipDirectory(source, output) {
  return new Promise((resolve, reject) => {
    const out = require("node:fs").createWriteStream(output);
    const archive = archiver("zip", { zlib: { level: 9 } });
    out.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(out);
    archive.directory(source, false);
    archive.finalize();
  });
}
