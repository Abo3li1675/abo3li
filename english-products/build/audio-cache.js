/**
 * audio-cache.js — SHA256-based MP3 cache.
 * Key: hash(text + voice + lengthScale). Stored on disk as `<hash>.mp3`.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

export class AudioCache {
  constructor(cacheDir) { this.cacheDir = cacheDir; }
  async init() { await mkdir(this.cacheDir, { recursive: true }); }
  hash(text, voice, lengthScale) {
    return createHash("sha256")
      .update(`${voice}|${lengthScale || 1}|${text}`)
      .digest("hex")
      .slice(0, 24);
  }
  pathFor(h) { return join(this.cacheDir, `${h}.mp3`); }
  async has(h) {
    try { await access(this.pathFor(h)); return true; } catch { return false; }
  }
  async get(h) { return await readFile(this.pathFor(h)); }
  async put(h, buf) { await writeFile(this.pathFor(h), buf); }
}
