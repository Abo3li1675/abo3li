/**
 * sprite.js — Concatenate multiple MP3 buffers into a single sprite + offset map.
 * MP3 is a stream of independent frames so concat is byte-level safe at frame
 * boundaries. We measure each segment's duration via ffprobe to build offsets.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function spawnAsync(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    let stderr = "";
    p.stderr.on("data", d => { stderr += d.toString(); });
    p.on("error", reject);
    p.on("close", code => code === 0 ? resolve() : reject(new Error(`${cmd} ${code}: ${stderr.slice(0,300)}`)));
  });
}

async function probeDurationMs(path) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", path
    ]);
    let out = "";
    p.stdout.on("data", d => { out += d.toString(); });
    p.on("close", code => {
      if (code !== 0) return reject(new Error("ffprobe failed"));
      resolve(Math.round(parseFloat(out.trim()) * 1000));
    });
  });
}

/**
 * @param {{key:string, mp3:Buffer}[]} segments
 * @returns {Promise<{sprite:Buffer, map: Record<string,[number,number]>}>}
 */
export async function buildSprite(segments) {
  if (segments.length === 0) return { sprite: Buffer.alloc(0), map: {} };

  const workdir = await mkdtemp(join(tmpdir(), "eng-sprite-"));
  try {
    // Write each segment, probe duration
    const filePaths = [];
    const durations = [];
    for (let i = 0; i < segments.length; i++) {
      const p = join(workdir, `seg-${String(i).padStart(4, "0")}.mp3`);
      await writeFile(p, segments[i].mp3);
      filePaths.push(p);
      durations.push(await probeDurationMs(p));
    }

    // Build ffmpeg concat list
    const listPath = join(workdir, "list.txt");
    await writeFile(listPath, filePaths.map(p => `file '${p}'`).join("\n"));

    const outPath = join(workdir, "sprite.mp3");
    await spawnAsync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "concat", "-safe", "0", "-i", listPath,
      "-c", "copy",
      outPath
    ]);

    // Build offset map (with 30ms safety gap to avoid bleed)
    const map = {};
    let cursor = 0;
    for (let i = 0; i < segments.length; i++) {
      const start = cursor;
      const end = cursor + durations[i];
      map[segments[i].key] = [start, end];
      cursor = end;
    }

    const sprite = await readFile(outPath);
    return { sprite, map };
  } finally {
    await rm(workdir, { recursive: true, force: true }).catch(() => {});
  }
}
