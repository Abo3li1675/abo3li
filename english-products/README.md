# English Products — منتجات تعلم الإنجليزية

متجر منتجات رقمية تفاعلية لتعليم اللغة الإنجليزية للمبتدئين العرب. كل منتج عبارة عن **ملف HTML واحد مستقل** يعمل أوفلاين في أي متصفح.

## المنتجات

| المنتج | المحتوى | عدد الدروس | الميزات |
|--------|---------|------------|---------|
| **Vocabulary 1000** | أشهر 1000 كلمة | 40 درس × 25 كلمة | Flashcards + SRS + Quiz + MP3 |
| **Grammar Essentials** | قواعد A1-A2 | 15 درس | شرح + تمارين تفاعلية + MP3 |
| **500 Sentences** | جمل المحادثات | 25 درس × 20 جملة | حوارات + STT تقييم نطق |

## متطلبات بناء المنتجات

### 1. Node.js 18+
```bash
node --version  # يجب أن يكون >= 18
```

### 2. ffmpeg
```bash
# Ubuntu/Debian
sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg

# تحقق
ffmpeg -version
```

### 3. Piper TTS (لتوليد الصوت)
```bash
# تثبيت Piper
pip install piper-tts

# تحقق
piper --help
```

### 4. تنزيل النماذج الصوتية
ضع الملفات التالية في `tts-models/`:

- **Amy (أنثى):** [en_US-amy-medium.onnx](https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx) + [.onnx.json](https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json)
- **Ryan (ذكر):** [en_US-ryan-medium.onnx](https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx) + [.onnx.json](https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json)

أو عبر سطر الأوامر:
```bash
cd tts-models
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json
```

## التثبيت والتشغيل

```bash
cd english-products
npm install

# بناء درس عينة (vocabulary lesson-01)
npm run build:sample

# بناء كل دروس منتج معين
npm run build:vocabulary
npm run build:grammar
npm run build:conversations

# بناء كل المنتجات
npm run build:all

# تجميع المنتجات في ZIPs جاهزة للرفع على Gumroad
npm run package
```

## وضع بدون صوت (للاختبار السريع)
لاختبار البناء قبل تنزيل نماذج Piper:
```bash
node build/build.js --product vocabulary --lesson lesson-01-greetings --no-audio
```
هذا يولّد HTML بدون MP3 (إشعار صامت) — مفيد لاختبار الـ UI فقط.

## بنية المجلدات

```
english-products/
├── content/        # المحتوى الخام JSON لكل درس
├── shared/         # CSS + JS مشترك بين كل المنتجات
├── templates/      # قوالب HTML لكل نوع منتج
├── build/          # سكريبتات Node.js للبناء
├── tts-models/     # نماذج Piper TTS (gitignored)
├── audio-cache/    # MP3 المُولَّد (gitignored، يُعاد استخدامه)
└── dist/           # المخرجات النهائية HTML (gitignored)
```

## طريقة البيع

كل ملف HTML في `dist/<product>/` هو منتج جاهز للبيع:
1. ارفعه على Gumroad / Payhip / Lemon Squeezy كمنتج رقمي
2. اضبط السعر
3. العميل ينزّل الملف ويفتحه في أي متصفح — يعمل أوفلاين

أو استخدم `npm run package` لتجميع كل دروس منتج واحد في ملف ZIP.

## التراخيص

- **Piper TTS:** MIT (مفتوح مصدر، مجاني للاستخدام التجاري)
- **نماذج Piper الصوتية:** MIT
- **خط Tajawal:** SIL Open Font License
- **محتوى الدروس:** ملكية المستخدم
