#!/usr/bin/env node
/**
 * package.js — Bundle a product's built HTML lessons into a ZIP file
 * ready to upload to Gumroad/Payhip/Lemon Squeezy.
 *
 * Usage:
 *   node build/package.js --product vocabulary
 *   node build/package.js --all
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const PACKAGES = join(ROOT, "packages");

const PRODUCT_META = {
  vocabulary: {
    title: "Vocabulary 1000 — أشهر 1000 كلمة إنجليزية",
    desc: "حزمة تفاعلية لتعلم أشهر 1000 كلمة إنجليزية، مقسمة على 40 درساً موضوعياً مع بطاقات تعليمية، نظام تكرار متباعد (Leitner)، اختبارات، ونطق صوتي. كل درس ملف HTML واحد يعمل أوفلاين في أي متصفح."
  },
  grammar: {
    title: "Grammar Essentials — قواعد الإنجليزية للمبتدئين",
    desc: "15 درساً في القواعد الأساسية مع شرح عربي وأمثلة وتمارين تفاعلية متعددة الأنواع."
  },
  conversations: {
    title: "500 Essential Sentences — 500 جملة محادثة مهمة",
    desc: "25 درساً يغطي 500 جملة من المحادثات اليومية مع نطق MP3 وتدريب على النطق عبر تقنية Speech-to-Text."
  }
};

function buildReadme(product, files) {
  const meta = PRODUCT_META[product];
  return `# ${meta.title}

${meta.desc}

## كيفية الاستخدام

1. فك ضغط الملف.
2. افتح أي ملف \`.html\` بنقرة مزدوجة في أي متصفح (Chrome, Firefox, Safari, Edge).
3. الدرس يعمل أوفلاين بالكامل — لا حاجة للإنترنت أو تثبيت برامج.
4. التقدم محفوظ تلقائياً في متصفحك (localStorage).
5. للاستخدام على الهاتف: انقل الملف إلى هاتفك أو افتحه من Google Drive / iCloud.

## الدروس (${files.length})

${files.map((f, i) => `${i + 1}. ${f}`).join("\n")}

## الميزات

- بطاقات تعليمية تفاعلية (Flashcards)
- نظام التكرار المتباعد Leitner 5-Box (5 صناديق)
- اختبارات متنوعة (اختيار من متعدد، كتابة، مطابقة، ترجمة)
- نطق صوتي للكلمات والأمثلة (MP3 مدمج)
- وضع ليلي / نهاري
- متجاوب للموبايل والكمبيوتر
- حفظ التقدم محلياً

## الدعم الفني

أي مشكلة في فتح الملف، تأكد من:
- استخدام متصفح حديث (Chrome 90+, Firefox 90+, Safari 14+)
- السماح بـ JavaScript (مفعّل افتراضياً)
- تفعيل تشغيل الصوت

شكراً لشرائك! 🎓
`;
}

function packageProduct(product) {
  const srcDir = join(DIST, product);
  if (!existsSync(srcDir)) {
    console.error(`[package] No dist for ${product}. Run \`npm run build:${product}\` first.`);
    return false;
  }
  const files = readdirSync(srcDir).filter(f => f.endsWith(".html")).sort();
  if (files.length === 0) {
    console.error(`[package] No HTML files in ${srcDir}`);
    return false;
  }

  mkdirSync(PACKAGES, { recursive: true });
  const readmePath = join(srcDir, "README.txt");
  writeFileSync(readmePath, buildReadme(product, files));

  const zipName = `${product}-${new Date().toISOString().slice(0, 10)}.zip`;
  const zipPath = join(PACKAGES, zipName);

  try {
    execSync(`cd "${DIST}" && zip -qr "${zipPath}" "${product}/"`, { stdio: "inherit" });
  } catch (e) {
    console.error("[package] zip command failed. Make sure `zip` is installed.");
    return false;
  }

  const sizeKb = (execSync(`stat -c%s "${zipPath}"`).toString().trim() / 1024).toFixed(0);
  console.log(`[package] ✓ ${zipName} (${sizeKb} KB, ${files.length} lessons)`);
  return true;
}

async function main() {
  const { values } = parseArgs({
    options: {
      product: { type: "string" },
      all: { type: "boolean", default: false }
    }
  });

  const products = values.all
    ? Object.keys(PRODUCT_META)
    : (values.product ? [values.product] : null);

  if (!products) {
    console.error("Usage: package.js --product <vocabulary|grammar|conversations>");
    console.error("       package.js --all");
    process.exit(1);
  }

  let ok = 0;
  for (const p of products) {
    if (packageProduct(p)) ok++;
  }
  console.log(`[package] Packaged ${ok}/${products.length} product(s) into ${PACKAGES}/`);
}

main();
