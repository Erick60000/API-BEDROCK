import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { spawn } from "node:child_process";
import unzipper from "unzipper";
import archiver from "archiver";

export async function compileAddon(inputPath, originalName) {
  const work = await fs.mkdtemp(path.join(os.tmpdir(), "brarchive-job-"));
  const source = path.join(work, "source");
  const packs = path.join(work, "packs");
  const outputDir = path.join(work, "output");
  await Promise.all([
    fs.mkdir(source, { recursive: true }),
    fs.mkdir(packs, { recursive: true }),
    fs.mkdir(outputDir, { recursive: true })
  ]);

  await extractZip(inputPath, source);

  const mcpackFiles = await findFiles(source, ".mcpack");
  if (!mcpackFiles.length) {
    throw new Error("No se encontraron archivos .mcpack dentro del .mcaddon.");
  }

  const packDirs = [];
  for (const mcpack of mcpackFiles) {
    const safeName = path.basename(mcpack, ".mcpack");
    const dir = path.join(packs, safeName);
    await fs.mkdir(dir, { recursive: true });
    await extractZip(mcpack, dir);
    packDirs.push(dir);
  }

  // BRArchive's documented recursive mode mirrors directories into __brarchive.
  // We invoke the reference CLI instead of reimplementing the binary format.
  for (const packDir of packDirs) {
    await runBrarchive(packDir);
  }

  // Preserve the original .mcaddon container: replace each .mcpack with the
  // processed pack while retaining the rest of the container.
  const outputPath = path.join(
    outputDir,
    originalName.replace(/\.mcaddon$/i, "") + "_compiled.mcaddon"
  );

  const packMap = new Map();
  for (let i = 0; i < mcpackFiles.length; i++) {
    packMap.set(path.basename(mcpackFiles[i]), packDirs[i]);
  }

  await createMcaddon(source, packMap, outputPath);

  return {
    outputPath,
    downloadName: path.basename(outputPath),
    cleanup: () => fs.rm(work, { recursive: true, force: true })
  };
}

async function runBrarchive(packDir) {
  await command("brarchive-cli", ["encode", packDir, "--recursive"]);
}

async function extractZip(file, destination) {
  await fs.createReadStream(file).pipe(unzipper.Extract({ path: destination })).promise();
}

async function createMcaddon(source, packMap, outputPath) {
  return new Promise((resolve, reject) => {
    const out = requireStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    out.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(out);

    archive.on("entry", () => {});

    addTree(archive, source, "", packMap)
      .then(() => archive.finalize())
      .catch(reject);
  });
}

async function addTree(archive, dir, relative, packMap) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.join(relative, entry.name).replaceAll(path.sep, "/");

    if (entry.isDirectory()) {
      await addTree(archive, full, rel, packMap);
      continue;
    }

    if (entry.name.toLowerCase().endsWith(".mcpack")) {
      const processed = packMap.get(entry.name);
      if (!processed) throw new Error(`No se encontró el pack procesado: ${entry.name}`);
      const buffer = await zipDirectoryToBuffer(processed);
      archive.append(buffer, { name: rel });
    } else {
      archive.file(full, { name: rel });
    }
  }
}

function zipDirectoryToBuffer(source) {
  return new Promise(async (resolve, reject) => {
    const chunks = [];
    const a = archiver("zip", { zlib: { level: 9 } });
    a.on("data", c => chunks.push(c));
    a.on("end", () => resolve(Buffer.concat(chunks)));
    a.on("error", reject);
    a.directory(source, false);
    try { await a.finalize(); } catch (e) { reject(e); }
  });
}

function requireStream(file) {
  // ESM-safe replacement for require("node:fs").createWriteStream.
  return import("node:fs").then(m => m.createWriteStream(file));
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

function command(program, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", d => stderr += d);
    child.on("error", err => {
      if (err.code === "ENOENT") {
        reject(new Error("No se encontró brarchive-cli. Instálalo o ejecuta el proyecto con Docker."));
      } else reject(err);
    });
    child.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`brarchive-cli terminó con código ${code}: ${stderr.trim()}`));
    });
  });
}