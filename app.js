// ---------------------------------------------------------------------------
// App logic. Same engine as Shop Fractions: a "deck" is an array of card
// indexes.
//   - Start of round: filter CARDS by the chosen deck, shuffle the indexes.
//   - Right   -> card leaves the deck (+ confetti).
//   - Missed  -> card goes back in a few spots later, so you see it again
//                soon (a poor man's spaced repetition).
//   - Empty   -> round over.
//
// Two modes, one engine:
//   "quiz":  pick from 4 answers (the right one + 3 confusable wrong ones)
//   "flash": think of the answer, flip, then grade yourself Got it / Missed
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const REINSERT_GAP = 3;   // how many cards later a missed one comes back

let deck = [];            // card indexes still to clear this round
let roundSize = 0;
let current = null;       // { i: card index, answered: bool }
let firstTry = 0;
let seenMiss = new Set();

// Fisher–Yates shuffle: the standard unbiased way to shuffle an array.
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Turn a card's `art` key into SVG markup. "dimset:ext" means: call the
// dimset() function with "ext" (which part of the picture to highlight).
function drawArt(key) {
  if (!key) return "";
  const [name, arg] = key.split(":");
  const a = ART[name];
  return typeof a === "function" ? a(arg) : a || "";
}

// localStorage can throw (private mode etc.), so wrap it.
function load(key, allowed, fallback) {
  try { const v = localStorage.getItem(key); return allowed.includes(v) ? v : fallback; }
  catch { return fallback; }
}
function save(key, v) { try { localStorage.setItem(key, v); } catch {} }

function startRound() {
  const want = $("deck").value;
  deck = shuffle(CARDS.map((c, i) => (want === "all" || c.deck === want ? i : -1)).filter((i) => i >= 0));
  roundSize = deck.length;
  firstTry = 0;
  seenMiss = new Set();
  $("done").hidden = true;
  $("card").hidden = false;
  next();
}

function next() {
  if (deck.length === 0) return finish();

  const i = deck[0];
  const c = CARDS[i];
  current = { i, answered: false };
  const quiz = $("mode").value === "quiz";

  // Front
  const art = drawArt(c.art);
  $("art").innerHTML = art;
  $("art").hidden = !art;
  $("prompt").textContent = c.q;

  // Back (filled now, hidden until answered). Picture repeats on the back
  // so you see the answer next to the thing it names.
  $("art-back").innerHTML = art;
  $("art-back").hidden = !art;
  $("answer").textContent = c.a;
  $("why").textContent = c.why;
  $("verdict").textContent = "";

  $("card").classList.remove("flipped", "right", "wrong");
  $("next").hidden = true;
  $("grade").hidden = true;
  $("progress").textContent = `${roundSize - deck.length} / ${roundSize} cleared`;

  $("choices").hidden = !quiz;
  $("flip").hidden = quiz;
  if (quiz) buildChoices(c);
  else $("flip").focus();
}

// Quiz mode: right answer + its 3 hand-picked wrong answers, shuffled.
function buildChoices(c) {
  const box = $("choices");
  box.replaceChildren();               // clear last card's buttons
  for (const text of shuffle([c.a, ...c.wrong])) {
    const b = document.createElement("button");
    b.className = "choice";
    b.textContent = text;
    b.addEventListener("click", () => pick(text, b));
    box.append(b);
  }
}

function pick(text, btn) {
  if (current.answered) return;
  const right = text === CARDS[current.i].a;
  // Lock all buttons; mark the correct one (and your wrong pick, if any).
  for (const b of $("choices").children) {
    b.disabled = true;
    if (b.textContent === CARDS[current.i].a) b.classList.add("correct");
  }
  if (!right) btn.classList.add("picked-wrong");
  resolve(right, right ? "Correct" : `Not ${text}`);
}

// Flashcard mode: flip first, THEN grade. Flipping isn't answering. The
// honesty is on you: if you hesitated, it's a miss.
function flip() {
  $("card").classList.add("flipped");
  $("flip").hidden = true;
  $("grade").hidden = false;
  $("gotit").focus();
}
function grade(right) {
  if (current.answered) return;
  $("grade").hidden = true;
  resolve(right, right ? "Got it" : "It'll come back around");
}

// Common ending for every answer: flip, color, score, confetti, show Next.
function resolve(right, message) {
  current.answered = true;
  $("card").classList.add("flipped", right ? "right" : "wrong");
  $("verdict").textContent = (right ? "✓ " : "✗ ") + message;
  $("next").hidden = false;
  $("next").focus();                  // Enter again = next card

  const i = deck.shift();
  if (right) {
    if (!seenMiss.has(i)) firstTry++;
    confetti(deck.length === 0 ? 220 : 50);
  } else {
    seenMiss.add(i);
    deck.splice(Math.min(REINSERT_GAP, deck.length), 0, i);
  }
}

function finish() {
  current = null;
  for (const id of ["card", "choices", "flip", "grade", "next"]) $(id).hidden = true;
  $("progress").textContent = "";
  $("summary").textContent =
    `${firstTry} of ${roundSize} right on the first try.` +
    (seenMiss.size ? " Missed ones kept coming back until you got them." : " Clean sweep.");
  $("done").hidden = false;
}

// ---------------------------------------------------------------------------
// Confetti. Same as Shop Fractions: a <canvas> plus a tiny particle loop.
// Gravity + drag each frame; the loop stops when no particles are left.
// ---------------------------------------------------------------------------
const canvas = $("confetti");
const ctx = canvas.getContext("2d");
const COLORS = ["#f2b33d", "#4caf7d", "#e8e6e1", "#5aa9e6", "#d9574a"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let parts = [];
let running = false;

function sizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", sizeCanvas);
sizeCanvas();

function confetti(count) {
  if (reduceMotion) return;
  const r = $("card").getBoundingClientRect();
  const ox = r.left + r.width / 2, oy = r.bottom - 20;
  for (let n = 0; n < count; n++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = 7 + Math.random() * 9;
    parts.push({
      x: ox, y: oy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of parts) {
    p.vy += 0.35; p.vx *= 0.99;
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w * Math.cos(p.rot * 2), p.h);
    ctx.restore();
  }
  parts = parts.filter((p) => p.y < innerHeight + 20);
  if (parts.length) requestAnimationFrame(tick);
  else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}

// --- wire up events -------------------------------------------------------
$("flip").addEventListener("click", flip);
$("gotit").addEventListener("click", () => grade(true));
$("missed").addEventListener("click", () => grade(false));
$("next").addEventListener("click", next);
$("restart").addEventListener("click", startRound);

$("deck").value = load("deck", ["all", "lines", "symbols", "reading"], "all");
$("mode").value = load("mode", ["quiz", "flash"], "quiz");
$("deck").addEventListener("change", (e) => { save("deck", e.target.value); startRound(); });
$("mode").addEventListener("change", (e) => {
  save("mode", e.target.value);
  if (current && !current.answered) next(); // re-ask the same card the new way
});

startRound();

// --- service worker registration (this is what makes it work offline) -----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
