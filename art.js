// ---------------------------------------------------------------------------
// Drawings. Every line type and symbol is drawn as SVG (a tiny vector picture
// written as text) instead of a Unicode character.
//
// Why: phone fonts are missing a lot of GD&T glyphs (⌭ ⏥ ⌰ ⌯ ...). A missing
// glyph shows as an empty box, which defeats the point of a recognition drill.
// SVG draws the same on every phone.
//
// Mental model of SVG here:
//   viewBox="0 0 W H"  = a W x H grid; the picture scales to fit its box.
//   <line x1 y1 x2 y2> = straight line.   <circle cx cy r> = circle.
//   stroke-width       = line thickness (THICK vs THIN matters for lines!).
//   stroke-dasharray   = dash pattern: "dash gap dash gap ..." in grid units.
//   currentColor       = "use the text color", so it follows the theme.
// ---------------------------------------------------------------------------

const THICK = 4.5;
const THIN = 1.6;

// Wrap shapes in an <svg>. `cls` lets CSS size line pictures vs symbols.
const svg = (w, h, body, cls) =>
  `<svg class="${cls}" viewBox="0 0 ${w} ${h}" fill="none" stroke="currentColor" ` +
  `stroke-linecap="butt" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

// Filled triangle pointing from (x1,y1) toward (x2,y2), tip at (x2,y2).
// Used for dimension/leader/cutting-plane arrowheads.
function arrowHead(x1, y1, x2, y2, len = 9, half = 3.5) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - len * Math.cos(a), by = y2 - len * Math.sin(a);
  const px = -Math.sin(a) * half, py = Math.cos(a) * half;
  return `<polygon points="${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}" fill="currentColor" stroke="none"/>`;
}

// One horizontal line across the picture with a given weight + dash pattern.
const hline = (sw, dash = "") =>
  svg(220, 60, `<line x1="10" y1="30" x2="210" y2="30" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`, "art-line");

const ART = {
  // ---- Alphabet of lines -------------------------------------------------
  object:  hline(THICK),
  hidden:  hline(THIN, "9 5"),
  center:  hline(THIN, "34 6 7 6"),        // long, short, long ...
  phantom: hline(THIN, "34 6 7 6 7 6"),    // long, short, short, long ...
  chain:   hline(THICK, "34 7 8 7"),       // looks like a THICK center line

  symmetry: svg(220, 60,
    `<line x1="40" y1="30" x2="180" y2="30" stroke-width="${THIN}" stroke-dasharray="30 6 7 6"/>` +
    // the two short parallel ticks at each end are what make it a symmetry line
    `<line x1="30" y1="18" x2="30" y2="42" stroke-width="${THIN}"/><line x1="36" y1="18" x2="36" y2="42" stroke-width="${THIN}"/>` +
    `<line x1="184" y1="18" x2="184" y2="42" stroke-width="${THIN}"/><line x1="190" y1="18" x2="190" y2="42" stroke-width="${THIN}"/>`,
    "art-line"),

  cutting: svg(220, 70,
    `<polyline points="20,22 20,56 200,56 200,22" stroke-width="${THICK}" stroke-dasharray="16 7"/>` +
    arrowHead(20, 40, 20, 8, 14, 7) + arrowHead(200, 40, 200, 8, 14, 7) +
    `<text x="6" y="18" font-size="14" fill="currentColor" stroke="none" font-family="system-ui">A</text>` +
    `<text x="206" y="18" font-size="14" fill="currentColor" stroke="none" font-family="system-ui">A</text>`,
    "art-line"),

  section: svg(220, 80,
    `<defs><clipPath id="hc"><rect x="50" y="10" width="120" height="60"/></clipPath></defs>` +
    `<g clip-path="url(#hc)" stroke-width="${THIN}">` +
    Array.from({ length: 20 }, (_, k) => {
      const x = 10 + k * 10; // 45° lines: rise = run
      return `<line x1="${x}" y1="80" x2="${x + 70}" y2="10"/>`;
    }).join("") +
    `</g><rect x="50" y="10" width="120" height="60" stroke-width="${THICK}"/>`,
    "art-line"),

  longbreak: svg(220, 60,
    `<polyline points="10,30 100,30 104,14 112,46 116,30 210,30" stroke-width="${THIN}"/>`,
    "art-line"),

  shortbreak: svg(220, 60,
    `<path d="M10 32 C 30 18, 45 44, 65 30 S 100 20, 118 34 S 150 42, 170 28 S 200 26, 210 34" stroke-width="${THICK}"/>`,
    "art-line"),

  sbreak: svg(220, 80,
    `<line x1="20" y1="15" x2="95" y2="15" stroke-width="${THICK}"/><line x1="20" y1="65" x2="95" y2="65" stroke-width="${THICK}"/>` +
    `<line x1="20" y1="15" x2="20" y2="65" stroke-width="${THICK}"/>` +
    `<path d="M95 15 C 110 25, 110 40, 95 40 C 80 40, 80 55, 95 65" stroke-width="${THICK}"/>` +
    `<path d="M125 15 C 110 25, 110 40, 125 40 C 140 40, 140 55, 125 65" stroke-width="${THICK}"/>` +
    `<line x1="125" y1="15" x2="200" y2="15" stroke-width="${THICK}"/><line x1="125" y1="65" x2="200" y2="65" stroke-width="${THICK}"/>` +
    `<line x1="200" y1="15" x2="200" y2="65" stroke-width="${THICK}"/>`,
    "art-line"),

  // Extension + dimension picture. `hl` = which part to highlight.
  dimset: (hl) => svg(220, 90,
    `<rect x="50" y="55" width="120" height="28" stroke-width="${THICK}"/>` +
    // extension lines: small gap above the part, run a bit past the dimension line
    `<g stroke-width="${hl === "ext" ? 3.2 : THIN}" ${hl === "ext" ? 'stroke="var(--accent)"' : ""}>` +
    `<line x1="50" y1="50" x2="50" y2="10"/><line x1="170" y1="50" x2="170" y2="10"/></g>` +
    `<g ${hl === "dim" ? 'stroke="var(--accent)" fill="var(--accent)" color="var(--accent)"' : ""}>` +
    `<line x1="52" y1="20" x2="92" y2="20" stroke-width="${hl === "dim" ? 3.2 : THIN}"/>` +
    `<line x1="128" y1="20" x2="168" y2="20" stroke-width="${hl === "dim" ? 3.2 : THIN}"/>` +
    arrowHead(80, 20, 51, 20) + arrowHead(140, 20, 169, 20) + `</g>` +
    `<text x="110" y="25" font-size="14" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui">3.00</text>`,
    "art-line"),

  leader: svg(220, 80,
    `<circle cx="60" cy="45" r="22" stroke-width="${THICK}"/>` +
    `<line x1="77" y1="31" x2="140" y2="16" stroke-width="${THIN}"/><line x1="140" y1="16" x2="156" y2="16" stroke-width="${THIN}"/>` +
    arrowHead(110, 23, 77, 31) +
    `<text x="160" y="21" font-size="14" fill="currentColor" stroke="none" font-family="system-ui">⌀.25</text>`,
    "art-line"),
};

// ---- GD&T + dimensioning symbols (48x48 grid, uniform weight) -----------
const sym = (body) => svg(48, 48, `<g stroke-width="3" stroke-linecap="round">${body}</g>`, "art-sym");
const circled = (letter) => sym(
  `<circle cx="24" cy="24" r="17"/>` +
  `<text x="24" y="31" font-size="20" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui">${letter}</text>`
);

Object.assign(ART, {
  straightness:  sym(`<line x1="8" y1="24" x2="40" y2="24"/>`),
  flatness:      sym(`<polygon points="16,14 42,14 32,34 6,34"/>`),
  circularity:   sym(`<circle cx="24" cy="24" r="15"/>`),
  cylindricity:  sym(`<circle cx="24" cy="24" r="9"/><line x1="8" y1="40" x2="22" y2="4"/><line x1="26" y1="44" x2="40" y2="8"/>`),
  profileLine:   sym(`<path d="M8 34 A16 16 0 0 1 40 34"/>`),
  profileSurf:   sym(`<path d="M8 34 A16 16 0 0 1 40 34 Z"/>`),
  angularity:    sym(`<polyline points="36,12 8,38 42,38"/>`),
  perpendicular: sym(`<line x1="8" y1="40" x2="40" y2="40"/><line x1="24" y1="40" x2="24" y2="8"/>`),
  parallelism:   sym(`<line x1="10" y1="40" x2="22" y2="8"/><line x1="26" y1="40" x2="38" y2="8"/>`),
  position:      sym(`<circle cx="24" cy="24" r="12"/><line x1="24" y1="4" x2="24" y2="44"/><line x1="4" y1="24" x2="44" y2="24"/>`),
  concentricity: sym(`<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="8"/>`),
  symmetry:      sym(`<line x1="14" y1="15" x2="34" y2="15"/><line x1="6" y1="24" x2="42" y2="24"/><line x1="14" y1="33" x2="34" y2="33"/>`),
  circRunout:    sym(`<line x1="12" y1="40" x2="32" y2="14"/>` + arrowHead(14, 38, 38, 7, 12, 5)),
  totalRunout:   sym(`<line x1="6" y1="40" x2="22" y2="40"/><line x1="6" y1="40" x2="20" y2="18"/><line x1="22" y1="40" x2="36" y2="18"/>` +
                     arrowHead(8, 37, 25, 8, 12, 5) + arrowHead(24, 37, 41, 8, 12, 5)),
  mmc: circled("M"),
  lmc: circled("L"),
  rfs: circled("S"),
  projected: circled("P"),
  counterbore:   sym(`<polyline points="10,12 10,36 38,36 38,12"/>`),
  countersink:   sym(`<polyline points="8,12 24,38 40,12"/>`),
  depth:         sym(`<line x1="12" y1="8" x2="36" y2="8"/><line x1="24" y1="8" x2="24" y2="32"/>` + arrowHead(24, 20, 24, 42, 12, 6)),
  square:        sym(`<rect x="10" y="10" width="28" height="28"/>`),
  diameter:      sym(`<circle cx="24" cy="24" r="13"/><line x1="8" y1="40" x2="40" y2="8"/>`),
});
