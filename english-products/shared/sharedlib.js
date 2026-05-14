/* ============================================================
 * sharedlib.js — English Products shared runtime
 * Leitner SRS · AudioSpritePlayer · Quiz utils · Storage · STT
 * Browser-only, no dependencies, designed for single-file HTML.
 * ============================================================ */
(function (global) {
  "use strict";

  /* ---------- Storage ---------- */
  const Storage = {
    key(productId, lessonId) { return `eng-products::${productId}::${lessonId}`; },
    load(productId, lessonId) {
      try {
        const raw = localStorage.getItem(this.key(productId, lessonId));
        return raw ? JSON.parse(raw) : {};
      } catch (_) { return {}; }
    },
    save(productId, lessonId, data) {
      try { localStorage.setItem(this.key(productId, lessonId), JSON.stringify(data)); }
      catch (_) { /* quota or private mode */ }
    },
    reset(productId, lessonId) {
      try { localStorage.removeItem(this.key(productId, lessonId)); } catch (_) {}
    },
    exportAll() {
      const dump = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("eng-products::")) dump[k] = JSON.parse(localStorage.getItem(k));
      }
      return dump;
    }
  };

  /* ---------- Leitner 5-Box SRS ----------
   * State per card: { box: 1..5, due: timestamp }
   * Intervals (days): 1, 3, 7, 14, 30
   */
  const LEITNER_INTERVALS_DAYS = [1, 3, 7, 14, 30];
  const DAY_MS = 24 * 60 * 60 * 1000;

  class Leitner {
    constructor(productId, lessonId, cardIds) {
      this.productId = productId;
      this.lessonId = lessonId;
      this.state = Storage.load(productId, lessonId);
      this.state.cards = this.state.cards || {};
      this.state.stats = this.state.stats || { reviews: 0, correct: 0, wrong: 0 };
      const now = Date.now();
      for (const id of cardIds) {
        if (!this.state.cards[id]) this.state.cards[id] = { box: 1, due: now };
      }
      this._persist();
    }
    _persist() { Storage.save(this.productId, this.lessonId, this.state); }
    dueCards(allIds, now) {
      now = now || Date.now();
      return allIds.filter(id => (this.state.cards[id]?.due || 0) <= now);
    }
    counts(allIds) {
      const counts = [0, 0, 0, 0, 0];
      for (const id of allIds) {
        const box = (this.state.cards[id]?.box || 1) - 1;
        counts[box]++;
      }
      return counts;
    }
    promote(id) {
      const c = this.state.cards[id] || { box: 1, due: Date.now() };
      c.box = Math.min(5, c.box + 1);
      c.due = Date.now() + LEITNER_INTERVALS_DAYS[c.box - 1] * DAY_MS;
      this.state.cards[id] = c;
      this.state.stats.reviews++;
      this.state.stats.correct++;
      this._persist();
    }
    demote(id) {
      const c = this.state.cards[id] || { box: 1, due: Date.now() };
      c.box = 1;
      c.due = Date.now() + LEITNER_INTERVALS_DAYS[0] * DAY_MS;
      this.state.cards[id] = c;
      this.state.stats.reviews++;
      this.state.stats.wrong++;
      this._persist();
    }
    skip(id) {
      const c = this.state.cards[id] || { box: 1, due: Date.now() };
      c.due = Date.now() + 60 * 60 * 1000; // 1h
      this.state.cards[id] = c;
      this._persist();
    }
    mastery(allIds) {
      const counts = this.counts(allIds);
      const weighted = counts.reduce((s, c, i) => s + c * (i + 1), 0);
      return Math.round((weighted / (allIds.length * 5)) * 100);
    }
    reset() {
      this.state = { cards: {}, stats: { reviews: 0, correct: 0, wrong: 0 } };
      this._persist();
    }
  }

  /* ---------- AudioSpritePlayer ----------
   * Plays segments of a base64 MP3 sprite by [startMs,endMs] offsets.
   */
  class AudioSpritePlayer {
    constructor(base64, spriteMap) {
      this.spriteMap = spriteMap || {};
      this.audio = null;
      this.currentStop = null;
      this._rate = 1.0;
      if (base64) {
        this.audio = new Audio("data:audio/mpeg;base64," + base64);
        this.audio.preload = "auto";
      }
    }
    setRate(r) { this._rate = r; if (this.audio) this.audio.playbackRate = r; }
    play(key) {
      if (!this.audio || !this.spriteMap[key]) return Promise.resolve(false);
      const [startMs, endMs] = this.spriteMap[key];
      this.stop();
      this.audio.currentTime = startMs / 1000;
      this.audio.playbackRate = this._rate;
      const durationSec = ((endMs - startMs) / 1000) / this._rate;
      return new Promise(resolve => {
        const onTime = () => {
          if (this.audio.currentTime * 1000 >= endMs) {
            this.audio.pause();
            this.audio.removeEventListener("timeupdate", onTime);
            this.currentStop = null;
            resolve(true);
          }
        };
        this.audio.addEventListener("timeupdate", onTime);
        this.currentStop = () => {
          this.audio.removeEventListener("timeupdate", onTime);
          this.audio.pause();
          this.currentStop = null;
          resolve(false);
        };
        const fallback = setTimeout(() => {
          if (this.currentStop) this.currentStop();
        }, durationSec * 1000 + 350);
        this.audio.play().catch(() => { clearTimeout(fallback); resolve(false); });
      });
    }
    stop() {
      if (this.currentStop) this.currentStop();
      if (this.audio) this.audio.pause();
    }
    available(key) { return !!this.audio && !!this.spriteMap[key]; }
  }

  /* ---------- Quiz utilities ---------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pickDistinct(pool, n, exclude) {
    return shuffle(pool.filter(x => !exclude.includes(x))).slice(0, n);
  }
  function normalize(s) {
    return String(s || "").toLowerCase().trim()
      .replace(/[.,!?؟،;:'"،؛؟]/g, "")
      .replace(/\s+/g, " ");
  }
  function levenshtein(a, b) {
    a = normalize(a); b = normalize(b);
    if (a === b) return 0;
    const al = a.length, bl = b.length;
    if (!al) return bl; if (!bl) return al;
    let prev = new Array(bl + 1);
    for (let j = 0; j <= bl; j++) prev[j] = j;
    for (let i = 1; i <= al; i++) {
      const curr = [i];
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      prev = curr;
    }
    return prev[bl];
  }
  function similarity(a, b) {
    const max = Math.max(normalize(a).length, normalize(b).length);
    if (!max) return 1;
    return 1 - levenshtein(a, b) / max;
  }

  /* ---------- Speech recognition (browser) ---------- */
  class STT {
    constructor() {
      const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
      this.supported = !!SR;
      this.recognition = this.supported ? new SR() : null;
      if (this.recognition) {
        this.recognition.lang = "en-US";
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
    listen() {
      if (!this.supported) return Promise.reject(new Error("STT not supported"));
      return new Promise((resolve, reject) => {
        const rec = this.recognition;
        const onResult = (e) => {
          const text = e.results[0][0].transcript;
          cleanup(); resolve(text);
        };
        const onError = (e) => { cleanup(); reject(new Error(e.error || "stt-error")); };
        const onEnd = () => cleanup();
        function cleanup() {
          rec.removeEventListener("result", onResult);
          rec.removeEventListener("error", onError);
          rec.removeEventListener("end", onEnd);
        }
        rec.addEventListener("result", onResult);
        rec.addEventListener("error", onError);
        rec.addEventListener("end", onEnd);
        try { rec.start(); } catch (e) { reject(e); }
      });
    }
    abort() { if (this.recognition) try { this.recognition.abort(); } catch (_) {} }
  }

  /* ---------- DOM helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === "class") node.className = props[k];
      else if (k === "style" && typeof props[k] === "object") Object.assign(node.style, props[k]);
      else if (k.startsWith("on") && typeof props[k] === "function") node.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (k === "html") node.innerHTML = props[k];
      else node.setAttribute(k, props[k]);
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }
  function toast(msg, ms) {
    let t = $(".toast");
    if (!t) { t = el("div", { class: "toast" }); document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), ms || 1800);
  }

  /* ---------- Theme ---------- */
  const Theme = {
    KEY: "eng-products::theme",
    init() {
      const saved = localStorage.getItem(this.KEY);
      if (saved) document.documentElement.setAttribute("data-theme", saved);
    },
    toggle() {
      const curr = document.documentElement.getAttribute("data-theme");
      const next = curr === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(this.KEY, next); } catch (_) {}
      return next;
    }
  };

  /* ---------- Tabs ---------- */
  function bindTabs(container) {
    const tabs = $$(".tab", container);
    const panels = $$(".panel[data-tab]");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.toggle("active", t === tab));
        panels.forEach(p => p.classList.toggle("hidden", p.dataset.tab !== target));
        try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (_) {}
      });
    });
  }

  /* ---------- Export ---------- */
  global.SharedLib = {
    Storage, Leitner, AudioSpritePlayer, STT, Theme,
    shuffle, pickDistinct, normalize, levenshtein, similarity,
    $, $$, el, toast, bindTabs
  };
})(typeof window !== "undefined" ? window : globalThis);
