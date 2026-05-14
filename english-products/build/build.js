#!/usr/bin/env node
/**
 * build.js — Main build pipeline entry point.
 *
 * Usage:
 *   node build/build.js --product vocabulary [--lesson lesson-01-greetings] [--no-audio]
 *   node build/build.js --all
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { AudioCache } from "./audio-cache.js";
import { renderTemplate, minifyHtml } from "./embed.js";
import { buildSprite } from "./sprite.js";
import { synth, silentMp3 } from "./tts.js";
import { validateLesson } from "./validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONTENT = join(ROOT, "content");
const TEMPLATES = join(ROOT, "templates");
const SCHEMAS = join(ROOT, "build", "schemas");
const SHARED = join(ROOT, "shared");
const MODELS = join(ROOT, "tts-models");
const CACHE_DIR = join(ROOT, "audio-cache");
const DIST = join(ROOT, "dist");

const PRODUCTS = {
  vocabulary: {
    schema: join(SCHEMAS, "vocabulary.schema.json"),
    template: join(TEMPLATES, "vocabulary.html.tmpl"),
    defaultVoice: "amy",
    collectAudio: (lesson) => {
      const segs = [];
      for (const w of lesson.words) {
        segs.push({ key: `w:${w.en}`, text: w.en, voice: "amy" });
        if (w.example_en) segs.push({ key: `ex:${w.en}`, text: w.example_en, voice: "amy" });
      }
      return segs;
    }
  },
  grammar: {
    schema: join(SCHEMAS, "grammar.schema.json"),
    template: join(TEMPLATES, "grammar.html.tmpl"),
    defaultVoice: "amy",
    collectAudio: (lesson) => (lesson.examples || []).map((e, i) => ({
      key: `ex:${i}`, text: e.en, voice: "amy"
    }))
  },
  conversations: {
    schema: join(SCHEMAS, "conversations.schema.json"),
    template: join(TEMPLATES, "conversations.html.tmpl"),
    defaultVoice: "amy",
    collectAudio: (lesson) => (lesson.dialogue || []).map((l, i) => ({
      key: `d:${i}`, text: l.en, voice: l.voice || (l.speaker === "B" ? "ryan" : "amy")
    }))
  }
};

function log(...args) { console.log("[build]", ...args); }
function warn(...args) { console.warn("[build]", ...args); }

async function fileExists(p) { try { await readFile(p); return true; } catch { return false; } }

async function loadShared() {
  return {
    css: await readFile(join(SHARED, "sharedlib.css"), "utf8"),
    js: await readFile(join(SHARED, "sharedlib.js"), "utf8")
  };
}

async function ensureModelsOr(noAudio) {
  if (noAudio) return false;
  const amy = await fileExists(join(MODELS, "en_US-amy-medium.onnx"));
  if (!amy) {
    warn("Piper model en_US-amy-medium.onnx not found in tts-models/");
    warn("Either download models (see README) or pass --no-audio for testing.");
    throw new Error("Missing TTS models");
  }
  return true;
}

async function generateAudioFor(segments, cache, useTTS) {
  const out = [];
  for (const seg of segments) {
    const h = cache.hash(seg.text, seg.voice, 1);
    let mp3;
    if (await cache.has(h)) {
      mp3 = await cache.get(h);
    } else if (useTTS) {
      log(`  TTS: [${seg.voice}] "${seg.text.slice(0, 50)}${seg.text.length > 50 ? "..." : ""}"`);
      mp3 = await synth(seg.text, { voice: seg.voice, modelsDir: MODELS });
      await cache.put(h, mp3);
    } else {
      mp3 = await silentMp3();
    }
    out.push({ key: seg.key, mp3 });
  }
  return out;
}

async function buildOne(productKey, lessonFile, opts) {
  const product = PRODUCTS[productKey];
  if (!product) throw new Error(`Unknown product: ${productKey}`);

  const lessonPath = join(CONTENT, productKey, lessonFile);
  const lesson = JSON.parse(await readFile(lessonPath, "utf8"));
  await validateLesson(lesson, product.schema);

  log(`Building ${productKey}/${basename(lessonFile)} — "${lesson.title}"`);

  // Collect text segments to synthesize
  const segments = product.collectAudio(lesson);

  // Audio cache + generation
  const cache = new AudioCache(CACHE_DIR);
  await cache.init();
  const audioBufs = await generateAudioFor(segments, cache, !opts.noAudio);

  // Build sprite
  const { sprite, map } = await buildSprite(audioBufs);
  const spriteB64 = sprite.length > 0 ? sprite.toString("base64") : "";

  // Load shared lib + template
  const shared = await loadShared();
  const html = await renderTemplate(product.template, {
    LESSON_TITLE: lesson.title,
    LESSON_TITLE_EN: lesson.title_en || "",
    LESSON_LEVEL: lesson.level,
    LESSON_DATA_JSON: JSON.stringify(lesson),
    AUDIO_SPRITE_B64: spriteB64,
    SPRITE_MAP_JSON: JSON.stringify(map),
    SHARED_CSS: shared.css,
    SHARED_JS: shared.js,
    PRODUCT_ID: productKey,
    LESSON_ID: lesson.id,
    BUILD_DATE: new Date().toISOString().slice(0, 10)
  });

  const finalHtml = opts.skipMinify ? html : await minifyHtml(html);

  const outDir = join(DIST, productKey);
  await mkdir(outDir, { recursive: true });
  const outName = basename(lessonFile, ".json") + ".html";
  const outPath = join(outDir, outName);
  await writeFile(outPath, finalHtml);

  const sizeKb = (Buffer.byteLength(finalHtml) / 1024).toFixed(1);
  log(`  ✓ ${outName} (${sizeKb} KB, ${segments.length} audio segments)`);
  return { outPath, sizeKb: parseFloat(sizeKb), segments: segments.length };
}

async function listLessons(productKey) {
  const dir = join(CONTENT, productKey);
  try {
    const files = await readdir(dir);
    return files.filter(f => extname(f) === ".json").sort();
  } catch {
    return [];
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      product: { type: "string" },
      lesson:  { type: "string" },
      all:     { type: "boolean", default: false },
      "no-audio": { type: "boolean", default: false },
      "skip-minify": { type: "boolean", default: false }
    }
  });

  const opts = {
    noAudio: values["no-audio"],
    skipMinify: values["skip-minify"]
  };

  await ensureModelsOr(opts.noAudio).catch(err => {
    if (!opts.noAudio) throw err;
  });

  const productsToBuild = values.all ? Object.keys(PRODUCTS) :
    (values.product ? [values.product] : null);

  if (!productsToBuild) {
    console.error("Usage: build.js --product <vocabulary|grammar|conversations> [--lesson <file>] [--no-audio]");
    console.error("       build.js --all");
    process.exit(1);
  }

  const results = [];
  for (const p of productsToBuild) {
    let lessons;
    if (values.lesson && productsToBuild.length === 1) {
      lessons = [values.lesson.endsWith(".json") ? values.lesson : values.lesson + ".json"];
    } else {
      lessons = await listLessons(p);
    }
    if (lessons.length === 0) {
      warn(`No lessons found for ${p} in content/${p}/`);
      continue;
    }
    for (const lesson of lessons) {
      try {
        const r = await buildOne(p, lesson, opts);
        results.push({ product: p, lesson, ...r });
      } catch (e) {
        warn(`Failed ${p}/${lesson}: ${e.message}`);
      }
    }
  }

  log(`Done. Built ${results.length} lesson(s).`);
  if (results.length > 0) {
    const totalKb = results.reduce((s, r) => s + r.sizeKb, 0);
    log(`Total output: ${totalKb.toFixed(1)} KB across ${results.length} files`);
  }
}

main().catch(err => {
  console.error("[build] FATAL:", err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
