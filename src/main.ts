import "./style.css";
import config from "./config";
import type { ChatMessage } from "./config";

const $ = <T extends HTMLElement>(sel: string) =>
  document.querySelector<T>(sel)!;

// ---- Populate DOM from config ----

function populateDOM() {
  const { sender, receiver, chat, match, ask, plan } = config;

  // -- Splash --
  const splashAvatar = $<HTMLImageElement>("#splash-avatar");
  splashAvatar.src = sender.avatar;
  splashAvatar.alt = sender.name;
  $<HTMLSpanElement>("#splash-text").textContent = `Welcome back, ${sender.name}`;

  // -- Card content (shared between stack bg and swipe card) --
  function buildCardContent(): DocumentFragment {
    const frag = document.createDocumentFragment();

    const avatarWrap = document.createElement("div");
    avatarWrap.className = "card-avatar";
    const avatarImg = document.createElement("img");
    avatarImg.src = receiver.avatar;
    avatarImg.alt = receiver.name;
    avatarImg.draggable = false;
    avatarWrap.appendChild(avatarImg);
    frag.appendChild(avatarWrap);

    const info = document.createElement("div");
    info.className = "card-info";

    const nameEl = document.createElement("h2");
    nameEl.className = "card-name";
    nameEl.textContent = `${receiver.name}, `;
    const ageSpan = document.createElement("span");
    ageSpan.className = "card-age";
    ageSpan.textContent = String(receiver.age);
    nameEl.appendChild(ageSpan);
    info.appendChild(nameEl);

    const subtitle = document.createElement("p");
    subtitle.className = "card-subtitle";
    subtitle.textContent = receiver.subtitle;
    info.appendChild(subtitle);

    const divider = document.createElement("div");
    divider.className = "card-divider";
    info.appendChild(divider);

    const bio = document.createElement("p");
    bio.className = "card-bio";
    bio.textContent = receiver.bio;
    info.appendChild(bio);

    const tags = document.createElement("div");
    tags.className = "card-tags";
    for (const t of receiver.tags) {
      const tag = document.createElement("span");
      tag.className = "card-tag";
      tag.textContent = t;
      tags.appendChild(tag);
    }
    info.appendChild(tags);

    frag.appendChild(info);
    return frag;
  }

  $<HTMLDivElement>("#card-stack-bg").appendChild(buildCardContent());
  $<HTMLDivElement>("#swipe-card").appendChild(buildCardContent());

  // -- Match --
  const matchLeft = $<HTMLImageElement>("#match-avatar-left");
  matchLeft.src = sender.avatar;
  matchLeft.alt = sender.name;
  const matchRight = $<HTMLImageElement>("#match-avatar-right");
  matchRight.src = receiver.avatar;
  matchRight.alt = receiver.name;
  $<HTMLParagraphElement>("#match-personal").textContent = match.subtitle;

  // -- Chat header --
  const chatAvatarImg = $<HTMLImageElement>("#chat-avatar");
  chatAvatarImg.src = receiver.avatar;
  chatAvatarImg.alt = receiver.name;
  $<HTMLSpanElement>("#chat-header-name").textContent = chat.phase1.headerName;

  // -- Chat messages --
  const chatBody = $<HTMLDivElement>("#chat-body");
  const typingLeftEl = $<HTMLDivElement>("#typing-row-left");
  const allMessages = [...chat.phase1.messages, ...chat.phase2.messages];

  allMessages.forEach((msg, i) => {
    const row = document.createElement("div");
    row.className = `chat-row chat-row-${msg.side === "left" ? "left" : "right"}`;
    row.setAttribute("data-msg", String(i));

    const bubble = document.createElement("div");
    bubble.className = `bubble ${msg.side === "left" ? "bubble-recv" : "bubble-sent"}`;
    bubble.textContent = msg.text;
    row.appendChild(bubble);

    if (msg.side === "right") {
      const receipt = document.createElement("span");
      receipt.className = "read-receipt";
      receipt.textContent = "Seen";
      row.appendChild(receipt);
    }

    chatBody.insertBefore(row, typingLeftEl);
  });

  // -- Ask words --
  const askTitle = $<HTMLHeadingElement>("#ask-title");
  ask.words.forEach((word, i) => {
    if (i > 0) askTitle.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = i === ask.highlightWordIndex ? "ask-word ask-word-valentine" : "ask-word";
    span.style.setProperty("--w", String(i));
    span.textContent = word;
    askTitle.appendChild(span);
  });

  // -- Plan content --
  const planContent = $<HTMLDivElement>("#plan-content");
  let stagger = 0;

  const dateEl = document.createElement("p");
  dateEl.className = "plan-date";
  dateEl.style.setProperty("--i", String(stagger++));
  dateEl.textContent = plan.date;
  planContent.appendChild(dateEl);

  const planDivider = document.createElement("div");
  planDivider.className = "plan-divider";
  planDivider.style.setProperty("--i", String(stagger++));
  planContent.appendChild(planDivider);

  plan.lines.forEach((line, i) => {
    const p = document.createElement("p");
    const isLast = i === plan.lines.length - 1;
    p.className = isLast ? "plan-line plan-line-soft" : "plan-line";
    p.style.setProperty("--i", String(stagger++));
    p.textContent = line;
    planContent.appendChild(p);
  });

  const signRow = document.createElement("div");
  signRow.className = "plan-sign-row";
  signRow.style.setProperty("--i", String(stagger++));
  const signP = document.createElement("p");
  signP.className = "plan-sign";
  signP.textContent = plan.signoff;
  signRow.appendChild(signP);
  planContent.appendChild(signRow);

  const closer = document.createElement("span");
  closer.className = "plan-closer";
  closer.setAttribute("aria-hidden", "true");
  closer.textContent = "\u2764";
  planContent.appendChild(closer);

  const hint = document.createElement("p");
  hint.className = "plan-hint";
  hint.textContent = plan.hint;
  planContent.appendChild(hint);
}

populateDOM();

// ---- Build chat timing arrays from config ----

function buildTimings(
  messages: ChatMessage[],
  startIndex: number
): [number, "left" | "right", number, number][] {
  return messages.map((msg, i) => {
    const globalIndex = startIndex + i;
    const isFirst = i === 0;
    const prevSide = i > 0 ? messages[i - 1].side : null;

    let readPause: number;
    let typingDur: number;

    if (msg.side === "left") {
      readPause = isFirst ? 400 : 600;
      typingDur = Math.max(400, Math.min(Math.round(msg.text.length * 18), 1000));
    } else {
      readPause = isFirst ? 500 : prevSide === "right" ? 300 : 500;
      typingDur = 0;
    }

    return [globalIndex, msg.side, readPause, typingDur];
  });
}

const phase1Count = config.chat.phase1.messages.length;
const phase2Messages = config.chat.phase2.messages;

// Find the last "right" message in phase2 for slow-typing/breathing effects
let lastRightInPhase2GlobalIndex = -1;
for (let i = phase2Messages.length - 1; i >= 0; i--) {
  if (phase2Messages[i].side === "right") {
    lastRightInPhase2GlobalIndex = phase1Count + i;
    break;
  }
}

// Bump timing for last message in phase2 (the dramatic final question)
const phase2Timings = buildTimings(phase2Messages, phase1Count);
if (phase2Timings.length > 0) {
  const last = phase2Timings[phase2Timings.length - 1];
  if (last[1] === "left") {
    last[2] = 900;  // longer read pause
    last[3] = 1000; // longer typing indicator
  }
}

// Build msgTexts lookup from config
const allChatMessages = [...config.chat.phase1.messages, ...config.chat.phase2.messages];
const msgTexts: Record<number, string> = {};
allChatMessages.forEach((msg, i) => { msgTexts[i] = msg.text; });

// Elements
const card = $<HTMLDivElement>("#swipe-card");
const nudge = $<HTMLParagraphElement>("#nudge-text");
const btnYes = $<HTMLButtonElement>("#btn-yes");
const btnNo = $<HTMLButtonElement>("#btn-no");
const askNudge = $<HTMLParagraphElement>("#ask-nudge");
const badgeLike = $<HTMLSpanElement>("#badge-like");
const badgeNope = $<HTMLSpanElement>("#badge-nope");
const sparklesContainer = $<HTMLDivElement>("#sparkles");
const matchScreen = $<HTMLDivElement>('[data-screen="match"]');
const askScreen = $<HTMLDivElement>('[data-screen="ask"]');
const askGlow = $<HTMLDivElement>(".ask-glow");

// ---- Reduced motion check ----

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Haptics ----

function vibrate(ms: number | number[]) {
  if (prefersReducedMotion) return;
  if (navigator.vibrate) navigator.vibrate(ms);
}

// ---- Sound Effects (procedural Web Audio) ----

const SfxEngine = (() => {
  let ctx: AudioContext | null = null;

  function getCtx(): AudioContext {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function whoosh() {
    const c = getCtx();
    const bufferSize = c.sampleRate * 0.1;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const src = c.createBufferSource();
    src.buffer = buffer;

    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1200;
    bp.Q.value = 0.8;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.25, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);

    src.connect(bp).connect(gain).connect(c.destination);
    src.start();
    src.stop(c.currentTime + 0.1);
  }

  function chime() {
    const c = getCtx();
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, i) => {
      const start = c.currentTime + i * 0.08;

      // Primary oscillator
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.15);

      // Detuned layer (+3Hz) at 60% volume for warmth
      const osc2 = c.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq + 3;
      const gain2 = c.createGain();
      gain2.gain.setValueAtTime(0.12, start);
      gain2.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc2.connect(gain2).connect(c.destination);
      osc2.start(start);
      osc2.stop(start + 0.15);
    });
  }

  function pop() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 800;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);

    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.05);
  }

  function swell() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 300;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.001, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);

    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 1.2);
  }

  // Dull thud for swipe-left bounce
  function thud() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.12);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.2, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);

    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.12);
  }

  // Deep bass heartbeat thump for blackout
  function heartbeat() {
    const c = getCtx();
    // First beat (louder)
    const osc1 = c.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55;
    const g1 = c.createGain();
    g1.gain.setValueAtTime(0.3, c.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    osc1.connect(g1).connect(c.destination);
    osc1.start();
    osc1.stop(c.currentTime + 0.15);

    // Second beat (softer, slightly delayed)
    const osc2 = c.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 50;
    const g2 = c.createGain();
    const t2 = c.currentTime + 0.18;
    g2.gain.setValueAtTime(0.001, c.currentTime);
    g2.gain.setValueAtTime(0.2, t2);
    g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.12);
    osc2.connect(g2).connect(c.destination);
    osc2.start();
    osc2.stop(t2 + 0.12);
  }

  // Subtle key tick for typing
  function tick() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.value = 1800 + Math.random() * 400;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.03, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.02);

    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.02);
  }

  // Playful boing for No button dodge
  function boing() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(250, c.currentTime + 0.15);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);

    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.18);
  }

  // Warm rising confirm for Yes button — with detuned layer
  function confirm() {
    const c = getCtx();
    const notes = [392, 523.25, 659.25]; // G4, C5, E5 — major triad
    notes.forEach((freq, i) => {
      const start = c.currentTime + i * 0.07;

      // Primary oscillator
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.2);

      // Detuned layer (+3Hz) at 60% volume for warmth
      const osc2 = c.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq + 3;
      const gain2 = c.createGain();
      gain2.gain.setValueAtTime(0.108, start);
      gain2.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc2.connect(gain2).connect(c.destination);
      osc2.start(start);
      osc2.stop(start + 0.2);
    });
  }

  // Sparkle burst for confetti/celebration
  function sparkle() {
    const c = getCtx();
    for (let i = 0; i < 5; i++) {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 2000 + Math.random() * 2000;

      const gain = c.createGain();
      const start = c.currentTime + i * 0.04;
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + 0.08);
    }
  }

  // Ascending tone for each word reveal (pass word index 0–4)
  function wordTone(index: number) {
    const c = getCtx();
    const scale = [392, 440, 493.88, 523.25, 587.33]; // G4 A4 B4 C5 D5
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = scale[index] || 523.25;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.1, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);

    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.2);
  }

  // Warm shimmer for splash screen — soft chord that swells in gently
  function warmth() {
    const c = getCtx();
    const freqs = [261.63, 329.63, 392]; // C4, E4, G4 — soft major chord
    freqs.forEach((freq) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = c.createGain();
      gain.gain.setValueAtTime(0.001, c.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.4);
      gain.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5);

      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 1.5);
    });
  }

  // Ambient pad — sustained C4+E4+G4 chord, fades in over 2s
  // Returns a stop function
  function ambientPad(): () => void {
    const c = getCtx();
    const freqs = [261.63, 329.63, 392]; // C4, E4, G4
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    freqs.forEach((freq) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const gain = c.createGain();
      gain.gain.setValueAtTime(0.001, c.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, c.currentTime + 2);

      osc.connect(gain).connect(c.destination);
      osc.start();

      oscs.push(osc);
      gains.push(gain);
    });

    return () => {
      const now = c.currentTime;
      gains.forEach((g) => {
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      });
      oscs.forEach((o) => o.stop(c.currentTime + 0.6));
    };
  }

  return { whoosh, chime, pop, swell, thud, heartbeat, tick, boing, confirm, sparkle, wordTone, warmth, ambientPad };
})();

// ---- Screen transitions ----

function showScreen(name: string) {
  // Clean up sparkles when leaving match screen
  if (matchScreen.classList.contains("active") && name !== "match") {
    sparklesContainer.innerHTML = "";
  }

  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.toggle("active", s.getAttribute("data-screen") === name);
  });
}

// ---- Splash screen auto-transition ----

// Warm tone timed with the heart icon pop (200ms CSS delay)
// May be blocked by autoplay policy on first visit — that's fine, fails silently
SfxEngine.warmth();

// Splash: 1.5s — snappier transition, warmth chord plays most of its duration
setTimeout(() => showScreen("card"), 1500);

// ---- Swipe handling ----

let startX = 0;
let currentX = 0;
let isDragging = false;

const SWIPE_THRESHOLD = 80;

// Nudge messages that cycle on left swipe
const nudgeMessages = [
  "Wrong way :)",
  "Try the other way",
  "Still here",
  "I'm not going anywhere",
  "Swipe right this time",
];
let nudgeIndex = 0;

function getX(e: TouchEvent | MouseEvent): number {
  if ("touches" in e) return e.touches[0].clientX;
  return e.clientX;
}

function onDragStart(e: TouchEvent | MouseEvent) {
  isDragging = true;
  startX = getX(e);
  currentX = 0;
  card.classList.add("swiping");
  card.classList.remove("bounce-back");
  nudge.classList.remove("visible");
}

function onDragMove(e: TouchEvent | MouseEvent) {
  if (!isDragging) return;
  e.preventDefault();
  currentX = getX(e) - startX;
  const rotation = currentX * 0.08;
  card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

  // Badge feedback
  const progress = Math.min(Math.abs(currentX) / SWIPE_THRESHOLD, 1);

  if (currentX > 0) {
    // Dragging right — show LIKE badge
    badgeLike.style.opacity = String(progress);
    badgeNope.style.opacity = "0";
    card.style.boxShadow = `0 16px 50px rgba(34, 197, 94, ${0.12 + progress * 0.15})`;
  } else if (currentX < 0) {
    // Dragging left — show NOPE badge
    badgeNope.style.opacity = String(progress);
    badgeLike.style.opacity = "0";
    card.style.boxShadow = `0 16px 50px rgba(249, 112, 102, ${0.12 + progress * 0.15})`;
  } else {
    badgeLike.style.opacity = "0";
    badgeNope.style.opacity = "0";
    card.style.boxShadow = "";
  }
}

function resetBadges() {
  badgeLike.style.opacity = "0";
  badgeNope.style.opacity = "0";
  card.style.boxShadow = "";
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  card.classList.remove("swiping");
  resetBadges();

  if (currentX > SWIPE_THRESHOLD) {
    // Swiped right — success
    vibrate(15);
    SfxEngine.whoosh();
    const stackBg = document.querySelector<HTMLDivElement>(".card-stack-bg");
    if (stackBg) stackBg.style.opacity = "0";
    card.classList.add("swipe-right");
    card.addEventListener(
      "animationend",
      () => {
        showScreen("match");
        spawnSparkles();
        SfxEngine.chime();
        vibrate([10, 30, 10]);
      },
      { once: true }
    );
  } else if (currentX < -SWIPE_THRESHOLD) {
    // Swiped left — nudge with cycling messages
    SfxEngine.thud();
    card.style.transform = "";
    card.classList.add("bounce-back");
    nudge.textContent = nudgeMessages[nudgeIndex % nudgeMessages.length];
    nudgeIndex++;
    nudge.classList.add("visible");
    setTimeout(() => nudge.classList.remove("visible"), 2000);
  } else {
    // Didn't swipe far enough — reset
    card.style.transform = "";
    card.classList.add("bounce-back");
  }
}

// Touch events
card.addEventListener("touchstart", onDragStart, { passive: true });
card.addEventListener("touchmove", onDragMove, { passive: false });
card.addEventListener("touchend", onDragEnd);

// Lock opacity after entrance animation, then start idle float
card.addEventListener("animationend", (e) => {
  if (e.animationName === "card-enter") {
    card.style.opacity = "1";
    card.classList.add("idle");
  }
}, { once: true });

// Mouse events (for desktop testing)
card.addEventListener("mousedown", onDragStart);
window.addEventListener("mousemove", onDragMove);
window.addEventListener("mouseup", onDragEnd);

// ---- Match screen: tap to continue → chat ----

let chatStarted = false;
const overlay = $<HTMLDivElement>("#app-switch-overlay");
const chatScreen = $<HTMLDivElement>('[data-screen="chat"]');

matchScreen.addEventListener("click", () => {
  if (chatStarted) return;
  chatStarted = true;

  // Clean up sparkles
  sparklesContainer.innerHTML = "";

  // 0ms — match screen shrinks into a card then slides left
  matchScreen.classList.add("app-switch-out");
  overlay.classList.add("active");

  // 250ms — chat screen slides in from the right as a card, then zooms to full
  setTimeout(() => {
    chatScreen.classList.add("active", "app-switch-in");
  }, 250);

  // 700ms — match is offscreen, remove it
  setTimeout(() => {
    matchScreen.classList.remove("active", "app-switch-out");
  }, 700);

  // 900ms — overlay fades out
  setTimeout(() => {
    overlay.classList.remove("active");
  }, 900);

  // 1100ms — chat animation done, clean up and start messages
  setTimeout(() => {
    chatScreen.classList.remove("app-switch-in");
    startChatSequence();
  }, 1100);
});

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

const inputField = $<HTMLDivElement>("#chat-input-field");
const sendBtn = $<HTMLDivElement>("#chat-send-btn");
const allKeys = document.querySelectorAll<HTMLSpanElement>(".key:not(.key-shift):not(.key-delete):not(.key-special)");

// Map characters to key elements for highlighting
const keyMap = new Map<string, HTMLSpanElement>();
allKeys.forEach((key) => {
  const ch = key.textContent?.toLowerCase();
  if (ch && ch.length === 1) keyMap.set(ch, key);
});

function popKey(ch: string) {
  const key = keyMap.get(ch.toLowerCase());
  if (!key) return;
  key.classList.add("key-pop");
  setTimeout(() => key.classList.remove("key-pop"), 100);
}

// Accept optional speed multiplier (1 = normal, 1.5 = slower)
async function typeInField(text: string, speedMult: number = 1) {
  inputField.innerHTML = '<span class="input-cursor"></span>';
  sendBtn.classList.remove("ready");

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    // Highlight the key
    if (ch === " ") {
      const spaceKey = document.querySelector<HTMLSpanElement>(".key-space");
      if (spaceKey) {
        spaceKey.classList.add("key-pop");
        setTimeout(() => spaceKey.classList.remove("key-pop"), 100);
      }
    } else {
      popKey(ch);
    }
    vibrate(2);
    SfxEngine.tick();

    // Add character before cursor
    const cursor = inputField.querySelector(".input-cursor")!;
    cursor.insertAdjacentText("beforebegin", ch);

    // Variable speed — faster for short words, slight pauses on spaces
    let delay = ch === " " ? 80 : 40 + Math.random() * 50;
    delay *= speedMult;

    // 400ms pause after comma
    if (ch === ",") {
      delay += 400;
    }

    await wait(delay);
  }

  sendBtn.classList.add("ready");
}

async function sendFromField() {
  sendBtn.classList.add("sending");
  await wait(120);
  sendBtn.classList.remove("sending", "ready");
  inputField.textContent = "";
}

// ---- Two-Phase Chat Sequence ----

async function playMessages(
  messages: [number, "left" | "right", number, number][],
  texts: Record<number, string>,
  options?: { slowTypingIndex?: number; seenBreathingIndex?: number }
) {
  const typingLeft = $<HTMLDivElement>("#typing-row-left");

  for (const [msgIndex, side, readPause, typingDur] of messages) {
    const msgRow = $<HTMLDivElement>(`[data-msg="${msgIndex}"]`);

    // Pause — reading the previous message
    await wait(readPause);

    if (side === "left") {
      // Receiver typing — show dots
      typingLeft.style.display = "flex";
      vibrate(3);
      await wait(typingDur);
      typingLeft.style.display = "none";
      msgRow.style.display = "flex";
      SfxEngine.pop();
      vibrate(5);
    } else {
      // Sender typing — type character by character in the input field
      const speedMult = msgIndex === options?.slowTypingIndex ? 1.5 : 1;
      await typeInField(texts[msgIndex], speedMult);
      await wait(250); // brief pause before sending
      await sendFromField();
      msgRow.style.display = "flex";
      SfxEngine.pop();
      vibrate(5);

      // Show read receipt after a beat
      const receipt = msgRow.querySelector<HTMLSpanElement>(".read-receipt");
      if (receipt) {
        await wait(400);
        receipt.style.display = "block";

        // Let "Seen" breathe — extra wait after the designated msg
        if (msgIndex === options?.seenBreathingIndex) {
          await wait(800);
        }
      }
    }
  }
}

async function startChatSequence() {
  const typingRight = $<HTMLDivElement>("#typing-row-right");
  const headerName = $<HTMLSpanElement>(".chat-header-name");

  // ---- Phase 1: "Early days" ----
  const phase1Timings = buildTimings(config.chat.phase1.messages, 0);
  await playMessages(phase1Timings, msgTexts);

  // Let the last message breathe
  await wait(2800);

  // ---- Mid-chat blackout (time skip) ----
  overlay.classList.add("active", "blackout");
  await wait(700); // fully dark

  // Confession text during blackout
  const blackoutText = document.createElement("p");
  blackoutText.className = "blackout-text";
  blackoutText.textContent = config.chat.blackoutText;
  overlay.appendChild(blackoutText);
  blackoutText.classList.add("visible");
  await wait(2500); // text fades in, holds, fades out
  blackoutText.remove();

  // Hide all phase-1 messages during blackout
  for (let i = 0; i < phase1Count; i++) {
    const row = document.querySelector<HTMLDivElement>(`[data-msg="${i}"]`);
    if (row) row.style.display = "none";
  }

  // Change header name for phase 2
  headerName.textContent = config.chat.phase2.headerName;

  // Brief pause in darkness
  await wait(600);

  // Fade out overlay to reveal clean chat
  overlay.classList.remove("active");
  await wait(700);
  overlay.classList.remove("blackout");

  // ---- Phase 2: "Today" ----
  await playMessages(phase2Timings, msgTexts, {
    slowTypingIndex: lastRightInPhase2GlobalIndex,
    seenBreathingIndex: lastRightInPhase2GlobalIndex,
  });

  // Let the final message sit and breathe
  await wait(3000);

  // False-start typing — sender starts to reply, then hesitates
  typingRight.style.display = "flex";
  await wait(800);
  typingRight.style.display = "none";
  await wait(600); // silence before blackout

  // ---- Blackout → Ask screen ----
  overlay.classList.add("active", "blackout");
  await wait(700);          // fade to black
  showScreen("ask");        // swap screens while hidden

  // Heartbeat pulse in the dark — three beats
  overlay.classList.add("pulse-glow");
  SfxEngine.heartbeat();
  vibrate([100, 80, 100]);
  await wait(600);
  SfxEngine.heartbeat();
  vibrate([100, 80, 100]);
  await wait(600);
  SfxEngine.heartbeat();
  vibrate([100, 80, 100]);
  await wait(600);
  overlay.classList.remove("pulse-glow");

  // Gentle lift — slow fade-out reveals ask screen underneath
  await wait(300);
  overlay.classList.add("blackout-lift");
  overlay.classList.remove("active");   // triggers 1.4s fade-out
  askScreen.classList.add("reveal");    // start word-by-word + heart + glow
  SfxEngine.swell();

  // Start ambient pad
  stopAmbientPad = SfxEngine.ambientPad();

  // Ascending tones synced with each word's CSS animation delay
  const wordCount = config.ask.words.length;
  for (let w = 0; w < wordCount; w++) {
    setTimeout(() => SfxEngine.wordTone(w), 800 + w * 250);
  }
  spawnBokehOrbs();
  spawnAskParticles();
  startHeartbeat();

  // Clean up overlay classes after transition completes
  await wait(1500);
  overlay.classList.remove("blackout", "blackout-lift");
}

// ---- Ambient pad control ----

let stopAmbientPad: (() => void) | null = null;

// ---- Ask screen particles ----

function spawnBokehOrbs() {
  const container = $<HTMLDivElement>("#ask-bokeh");
  const colors = [
    "rgba(253, 186, 116, 0.35)",
    "rgba(249, 112, 102, 0.25)",
    "rgba(255, 255, 255, 0.2)",
    "rgba(253, 232, 138, 0.3)",
    "rgba(251, 146, 60, 0.2)",
  ];

  for (let i = 0; i < 8; i++) {
    const orb = document.createElement("div");
    orb.className = "bokeh-orb";
    const size = 40 + Math.random() * 50;
    orb.style.width = `${size}px`;
    orb.style.height = `${size}px`;
    orb.style.left = `${10 + Math.random() * 80}%`;
    orb.style.top = `${10 + Math.random() * 80}%`;
    orb.style.background = colors[Math.floor(Math.random() * colors.length)];
    orb.style.setProperty("--delay", `${Math.random() * 2}s`);
    orb.style.setProperty("--dur", `${4 + Math.random() * 4}s`);
    orb.style.setProperty("--peak", `${0.2 + Math.random() * 0.2}`);
    orb.style.setProperty("--dx", `${-15 + Math.random() * 30}px`);
    orb.style.setProperty("--dy", `${-15 + Math.random() * 30}px`);
    container.appendChild(orb);
  }
}

function spawnAskParticles() {
  const container = $<HTMLDivElement>("#ask-particles");
  const hearts = ["\u2764", "\u2665"];

  for (let i = 0; i < 25; i++) {
    const isHeart = i < 4;
    const p = document.createElement("span");
    p.className = "ask-particle";

    if (isHeart) {
      p.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      p.style.fontSize = `${6 + Math.random() * 4}px`;
      p.style.width = "auto";
      p.style.height = "auto";
      p.style.background = "none";
      p.style.color = Math.random() > 0.5 ? "var(--coral)" : "var(--peach)";
    } else {
      const size = 3 + Math.random() * 5;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = Math.random() > 0.5 ? "var(--coral)" : "var(--peach)";
      if (Math.random() > 0.6) {
        p.style.filter = "blur(2px)";
      }
    }

    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.setProperty("--delay", `${Math.random() * 2}s`);
    p.style.setProperty("--dur", `${1.5 + Math.random() * 2}s`);
    container.appendChild(p);
  }
}

// ---- Sparkles on match screen ----

function spawnSparkles() {
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    const size = 3 + Math.random() * 4;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.setProperty("--delay", `${Math.random() * 2}s`);
    sparkle.style.setProperty("--dur", `${1.5 + Math.random() * 1.5}s`);
    sparklesContainer.appendChild(sparkle);
  }
}

// ---- No button multi-dodge ----

let noClickCount = 0;

const dodgePositions = [
  "translateX(80px) translateY(-20px) rotate(5deg)",
  "translateX(-70px) translateY(-30px) rotate(-8deg)",
  "translateX(60px) translateY(40px) rotate(6deg)",
  "translateX(-50px) translateY(-50px) rotate(-4deg)",
];

const noTexts = ["No", "Really?", "Pookie please"];
const nudgeTexts = ["", "Nice try", "You wound me", "I had a feeling"];

btnNo.addEventListener("click", () => {
  if (noClickCount >= 4) return;
  noClickCount++;

  // Bigger Yes growth (0.05 per click) + glow
  const yesScale = 1 + noClickCount * 0.05;
  btnYes.style.transform = `scale(${yesScale})`;
  const glowIntensity = noClickCount * 0.1;
  btnYes.style.boxShadow = `0 4px 20px rgba(249, 112, 102, ${0.35 + glowIntensity})`;

  if (noClickCount < 4) {
    // Sequential positions instead of random
    SfxEngine.boing();
    const dodge = dodgePositions[(noClickCount - 1) % dodgePositions.length];
    btnNo.style.transform = dodge;

    // Update text
    if (noClickCount <= 2) {
      btnNo.textContent = noTexts[noClickCount];
    }
    if (noClickCount === 3) {
      btnNo.style.fontSize = "0.8rem";
    }

    // Show nudge
    if (nudgeTexts[noClickCount]) {
      askNudge.textContent = nudgeTexts[noClickCount];
      askNudge.classList.add("visible");
    }
  } else {
    // 4th click — fade out entirely
    btnNo.classList.add("faded");
    askNudge.textContent = "I had a feeling";
    askNudge.classList.add("visible");

    // Pulse the Yes button gently
    btnYes.classList.add("pulse");
    btnYes.addEventListener("animationend", () => {
      btnYes.classList.remove("pulse");
    }, { once: true });
  }
});

// ---- Yes button ----

btnYes.addEventListener("click", () => {
  vibrate(10);
  SfxEngine.confirm();
  stopHeartbeat();

  // Stop ambient pad
  if (stopAmbientPad) {
    stopAmbientPad();
    stopAmbientPad = null;
  }

  btnYes.classList.add("confirmed");

  // White flash before plan
  overlay.classList.add("white-flash", "active");
  setTimeout(() => {
    overlay.classList.remove("white-flash", "active");
    showScreen("plan");
    spawnConfetti();
    SfxEngine.sparkle();
    startAmbientHearts();

  }, 100);
});

// ---- Confetti on plan screen ----

function spawnConfetti() {
  const container = $<HTMLDivElement>("#plan-confetti");
  const colors = ["#f97066", "#fdba74", "#fde68a", "#fb923c", "#f9a87c", "#fca5a5"];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.textContent = "\u2764";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.fontSize = `${10 + Math.random() * 10}px`;
    piece.style.setProperty("--delay", `${Math.random() * 0.6}s`);
    piece.style.setProperty("--dur", `${1.5 + Math.random() * 1.5}s`);
    piece.style.setProperty("--rot", `${200 + Math.random() * 400}deg`);
    piece.addEventListener("animationend", () => piece.remove());
    container.appendChild(piece);
  }
}

// ---- Ambient hearts on plan screen ----

function startAmbientHearts() {
  const container = $<HTMLDivElement>(".hearts");
  const hearts = ["\u2764\uFE0F", "\uD83E\uDE77", "\uD83D\uDC95"];

  function spawnHeart() {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${10 + Math.random() * 80}%`;
    heart.style.bottom = "-20px";
    const duration = 5 + Math.random() * 3; // 5–8s
    heart.style.animation = `float-up ${duration}s linear forwards`;
    heart.style.fontSize = `${0.7 + Math.random() * 0.7}rem`; // 0.7–1.4rem
    heart.addEventListener("animationend", () => heart.remove());
    container.appendChild(heart);
  }

  // Gentle initial burst staggered after text finishes
  setTimeout(() => spawnHeart(), 3500);
  setTimeout(() => spawnHeart(), 4200);
  setTimeout(() => spawnHeart(), 5000);
  setTimeout(() => spawnHeart(), 5600);

  // Continuous trickle
  function scheduleNext() {
    const delay = 1800 + Math.random() * 1400; // 1.8–3.2s
    setTimeout(() => {
      // Only spawn if plan screen is still active
      const planScreen = document.querySelector('[data-screen="plan"]');
      if (planScreen?.classList.contains("active")) {
        spawnHeart();
        scheduleNext();
      }
    }, delay);
  }

  // Start the trickle after the initial burst
  setTimeout(scheduleNext, 5200);
}

// ---- Haptic heartbeat on ask screen (with decay) ----

let heartbeatTimeout: number | undefined;

function startHeartbeat() {
  if (prefersReducedMotion) return;

  let beatCount = 0;

  function beat() {
    beatCount++;
    SfxEngine.heartbeat();
    vibrate([100, 80, 100]);

    // Decay — after 6 beats total, stop
    if (beatCount >= 6) return;

    // After 3rd beat, slow down to 2200ms
    const nextInterval = beatCount < 3 ? 1500 : 2200;
    heartbeatTimeout = window.setTimeout(beat, nextInterval);
  }

  // First beat after initial interval
  heartbeatTimeout = window.setTimeout(beat, 1500);
}

function stopHeartbeat() {
  if (heartbeatTimeout !== undefined) {
    clearTimeout(heartbeatTimeout);
    heartbeatTimeout = undefined;
  }
}

// ---- Parallax on ask screen (device tilt) ----

window.addEventListener("deviceorientation", (e) => {
  if (!askScreen.classList.contains("active")) return;
  const x = Math.max(-15, Math.min(15, e.gamma || 0)) / 15 * 10;
  const y = Math.max(-15, Math.min(15, (e.beta || 0) - 45)) / 15 * 10;
  askGlow.style.transform = `translate(${x}px, ${y}px)`;
});
