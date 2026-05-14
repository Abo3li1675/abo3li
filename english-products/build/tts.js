/**
 * tts.js — Generate MP3 audio for an English text via Piper TTS + ffmpeg.
 * Each call: spawn piper → WAV → ffmpeg → MP3 (64kbps mono).
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const VOICE_MODELS = {
  amy:  "en_US-amy-medium.onnx",
  ryan: "en_US-ryan-medium.onnx"
};

function spawnAsync(cmd, args, stdin) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stderr = "";
    p.stderr.on("data", d => { stderr += d.toString(); });
    p.on("error", reject);
    p.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}: ${stderr.slice(0, 400)}`));
    });
    if (stdin != null) { p.stdin.write(stdin); p.stdin.end(); }
  });
}

/**
 * Generate an MP3 buffer for `text` using the given voice.
 * @param {string} text
 * @param {{ voice?: "amy"|"ryan", modelsDir: string, lengthScale?: number }} opts
 * @returns {Promise<Buffer>} MP3 bytes
 */
export async function synth(text, opts) {
  const voice = opts.voice || "amy";
  const modelFile = VOICE_MODELS[voice];
  if (!modelFile) throw new Error(`Unknown voice: ${voice}`);
  const modelPath = join(opts.modelsDir, modelFile);

  const workdir = await mkdtemp(join(tmpdir(), "eng-tts-"));
  const wavPath = join(workdir, "out.wav");
  const mp3Path = join(workdir, "out.mp3");

  try {
    const piperArgs = ["--model", modelPath, "--output_file", wavPath];
    if (opts.lengthScale) piperArgs.push("--length-scale", String(opts.lengthScale));
    await spawnAsync("piper", piperArgs, text);

    await spawnAsync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-i", wavPath,
      "-codec:a", "libmp3lame",
      "-b:a", "64k",
      "-ac", "1",
      "-ar", "22050",
      mp3Path
    ]);

    return await readFile(mp3Path);
  } finally {
    await rm(workdir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Get MP3 duration in milliseconds via ffprobe.
 */
export async function mp3DurationMs(path) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      path
    ]);
    let out = "";
    p.stdout.on("data", d => { out += d.toString(); });
    p.on("error", reject);
    p.on("close", code => {
      if (code !== 0) return reject(new Error("ffprobe failed"));
      const sec = parseFloat(out.trim());
      if (!isFinite(sec)) return reject(new Error("invalid duration"));
      resolve(Math.round(sec * 1000));
    });
  });
}

/**
 * Generate a 200ms silent MP3 (used in --no-audio mode for testing).
 */
export async function silentMp3() {
  const workdir = await mkdtemp(join(tmpdir(), "eng-silent-"));
  const mp3Path = join(workdir, "silent.mp3");
  try {
    await spawnAsync("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "lavfi", "-i", "anullsrc=channel_layout=mono:sample_rate=22050",
      "-t", "0.2",
      "-codec:a", "libmp3lame", "-b:a", "64k",
      mp3Path
    ]);
    return await readFile(mp3Path);
  } finally {
    await rm(workdir, { recursive: true, force: true }).catch(() => {});
  }
}
