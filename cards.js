// Card data — from the Alphabet of Lines handouts (Machine Fundamentals
// pp. 580–582, Print Reading pp. 10–16) and the ANSI Y14.5 symbol chart.
//
// One object per card. To add a card: add one line, then bump VERSION in sw.js.
//
//   deck:  "lines" | "symbols" | "reading"   (the Deck dropdown filters on this)
//   art:   key into ART (art.js) for a picture, or omit for a text-only card
//   q:     the question
//   a:     the right answer
//   wrong: 3 wrong answers for Quiz mode. Pick CONFUSABLE ones (center vs
//          phantom), not silly ones. Easy distractors teach nothing.
//   why:   one or two lines shown after answering
const CARDS = [
  // ---- Lines: recognition (picture -> name) ------------------------------
  { deck: "lines", art: "object",     q: "Name this line", a: "Object (visible) line", wrong: ["Chain line", "Extension line", "Dimension line"], why: "Thick and continuous. Edges you can see in this view." },
  { deck: "lines", art: "hidden",     q: "Name this line", a: "Hidden line", wrong: ["Center line", "Cutting plane line", "Phantom line"], why: "Thin, short, even dashes. Edges behind material that you can't see from this view." },
  { deck: "lines", art: "center",     q: "Name this line", a: "Center line", wrong: ["Phantom line", "Chain line", "Hidden line"], why: "Thin. Long – SHORT – long. One short dash." },
  { deck: "lines", art: "phantom",    q: "Name this line", a: "Phantom line", wrong: ["Center line", "Chain line", "Long break line"], why: "Thin. Long – short – SHORT – long. Two short dashes = ghost part." },
  { deck: "lines", art: "chain",      q: "Name this line", a: "Chain line", wrong: ["Center line", "Phantom line", "Cutting plane line"], why: "THICK long–short. A special requirement applies along that stretch (see the note)." },
  { deck: "lines", art: "symmetry",   q: "Name this line", a: "Symmetry line", wrong: ["Center line", "Long break line", "Dimension line"], why: "A center line with two short parallel ticks at each end. The other half is identical." },
  { deck: "lines", art: "cutting",    q: "Name this line", a: "Cutting plane line", wrong: ["Hidden line", "Chain line", "Leader line"], why: "Thick, dashed, with bent arrows. Shows where the section is cut. Arrows = which way you look." },
  { deck: "lines", art: "section",    q: "What are the 45° lines inside this box?", a: "Section lines (hatching)", wrong: ["Hidden lines", "Knurl pattern", "Phantom lines"], why: "Thin 45° lines = solid material that the cutting plane passed through." },
  { deck: "lines", art: "longbreak",  q: "Name this line", a: "Long break line", wrong: ["Short break line", "Chain line", "Phantom line"], why: "Thin and straight with zigzags. Shortens a long part that doesn't change along its length." },
  { deck: "lines", art: "shortbreak", q: "Name this line", a: "Short break line", wrong: ["Long break line", "Object line", "Leader line"], why: "Freehand and wavy, like torn paper. Breaks out part of a view." },
  { deck: "lines", art: "sbreak",     q: "What kind of break is this?", a: "S-break (round bar or tube)", wrong: ["Long break", "Short break", "Cutting plane"], why: "Round parts get the 'S' break. A tube shows its hollow center in the S." },
  { deck: "lines", art: "dimset:ext", q: "What are the highlighted lines?", a: "Extension lines", wrong: ["Dimension lines", "Leader lines", "Object lines"], why: "Thin. They carry an edge out so it can be dimensioned. Note the small gap from the part." },
  { deck: "lines", art: "dimset:dim", q: "What is the highlighted line?", a: "Dimension line", wrong: ["Extension line", "Leader line", "Center line"], why: "Thin, arrowheads at both ends, number in the middle. Sits between the extension lines." },
  { deck: "lines", art: "leader",     q: "What is the angled line from the note to the hole?", a: "Leader line", wrong: ["Dimension line", "Extension line", "Cutting plane line"], why: "The arrow touches the feature and the shoulder holds the note." },

  // ---- Lines: concepts ----------------------------------------------------
  { deck: "lines", q: "Which way do cutting plane arrows point?", a: "The direction you look at the section", wrong: ["Toward the scrap side", "Toward datum A", "Toward the title block"], why: "Arrows = line of sight. Stand behind them and look where they point." },
  { deck: "lines", q: "Why is there a small gap between an extension line and the part?", a: "So it isn't mistaken for part of the outline", wrong: ["It shows a tolerance", "It means the edge is chamfered", "To save ink"], why: "Keeps the annotation visually separate from the geometry." },
  { deck: "lines", q: "In a section view, white space (no hatching) means:", a: "Empty space: a hole or bore", wrong: ["Solid material", "A weld", "A hidden feature"], why: "Hatched = solid metal that was cut. White = nothing there." },
  { deck: "lines", q: "Which lines are drawn THICK?", a: "Object, cutting plane, chain", wrong: ["Object, hidden, center", "Center, phantom, chain", "Dimension, extension, leader"], why: "Thick lines show the part or a cut through it. Thin lines are notes about the part." },

  // ---- GD&T symbols -------------------------------------------------------
  { deck: "symbols", art: "position",      q: "Name this symbol", a: "Position", wrong: ["Concentricity", "Circularity", "Diameter"], why: "Location of a hole or feature relative to the datums. The most common GD&T callout." },
  { deck: "symbols", art: "flatness",      q: "Name this symbol", a: "Flatness", wrong: ["Parallelism", "Straightness", "Angularity"], why: "Form control: the whole surface lies between two parallel planes. No datum needed." },
  { deck: "symbols", art: "straightness",  q: "Name this symbol", a: "Straightness", wrong: ["Flatness", "Profile of a line", "Symmetry"], why: "Form control: a line element is straight." },
  { deck: "symbols", art: "circularity",   q: "Name this symbol", a: "Circularity (roundness)", wrong: ["Cylindricity", "Concentricity", "Diameter"], why: "Each cross-section is round. 2D, one slice at a time." },
  { deck: "symbols", art: "cylindricity",  q: "Name this symbol", a: "Cylindricity", wrong: ["Circularity", "Total runout", "Parallelism"], why: "Round + straight + no taper over the whole length. 3D roundness." },
  { deck: "symbols", art: "profileLine",   q: "Name this symbol", a: "Profile of a line", wrong: ["Profile of a surface", "Arc length", "Circular runout"], why: "Open arc = one cross-section of a contour (2D)." },
  { deck: "symbols", art: "profileSurf",   q: "Name this symbol", a: "Profile of a surface", wrong: ["Profile of a line", "Counterbore", "Spherical radius"], why: "Closed half-moon = the whole surface (3D)." },
  { deck: "symbols", art: "angularity",    q: "Name this symbol", a: "Angularity", wrong: ["Perpendicularity", "Countersink", "Slope"], why: "At a set angle to a datum." },
  { deck: "symbols", art: "perpendicular", q: "Name this symbol", a: "Perpendicularity", wrong: ["Straightness", "Angularity", "Depth"], why: "Square (90°) to a datum." },
  { deck: "symbols", art: "parallelism",   q: "Name this symbol", a: "Parallelism", wrong: ["Flatness", "Symmetry", "Cylindricity"], why: "Parallel to a datum. Example from page 16: ∥ .002 A." },
  { deck: "symbols", art: "concentricity", q: "Name this symbol", a: "Concentricity / coaxiality", wrong: ["Circularity", "Position", "Total runout"], why: "Shares the datum axis. Dropped in ASME 2018 but still on older prints." },
  { deck: "symbols", art: "symmetry",      q: "Name this symbol", a: "Symmetry", wrong: ["Parallelism", "Flatness", "Straightness"], why: "Centered on a datum plane. Also dropped in 2018." },
  { deck: "symbols", art: "circRunout",    q: "Name this symbol", a: "Circular runout", wrong: ["Total runout", "Angularity", "Leader"], why: "One arrow = wobble at each single cross-section while spinning." },
  { deck: "symbols", art: "totalRunout",   q: "Name this symbol", a: "Total runout", wrong: ["Circular runout", "Cylindricity", "Parallelism"], why: "Two arrows = wobble over the WHOLE surface while spinning." },
  { deck: "symbols", art: "mmc",           q: "Name this modifier", a: "Maximum Material Condition (MMC)", wrong: ["Least Material Condition (LMC)", "Regardless of Feature Size (RFS)", "Metric"], why: "Most metal: smallest hole, largest shaft. Gives bonus tolerance." },
  { deck: "symbols", art: "lmc",           q: "Name this modifier", a: "Least Material Condition (LMC)", wrong: ["Maximum Material Condition (MMC)", "Leader", "Regardless of Feature Size (RFS)"], why: "Least metal: largest hole, smallest shaft. Protects wall thickness." },
  { deck: "symbols", art: "rfs",           q: "Name this modifier", a: "Regardless of Feature Size (RFS)", wrong: ["Spherical", "Symmetry", "Maximum Material Condition (MMC)"], why: "Tolerance is the same at any size. This is the default." },
  { deck: "symbols", art: "projected",     q: "Name this modifier", a: "Projected tolerance zone", wrong: ["Position", "Profile", "Perpendicularity"], why: "The zone extends above the hole. Common on threaded holes." },

  // ---- Reading: dimensioning symbols + callouts --------------------------
  { deck: "reading", art: "counterbore", q: "Name this symbol", a: "Counterbore / spotface", wrong: ["Countersink", "Depth", "Square"], why: "Flat-bottom step for a cap screw head. A spotface is a shallow flat seat." },
  { deck: "reading", art: "countersink", q: "Name this symbol", a: "Countersink", wrong: ["Counterbore", "Angularity", "Conical taper"], why: "A cone recess so a flat-head screw sits flush. The V is the cone." },
  { deck: "reading", art: "depth",       q: "Name this symbol", a: "Depth / deep", wrong: ["Perpendicularity", "Datum target", "Dimension origin"], why: "How deep a hole or bore goes." },
  { deck: "reading", art: "diameter",    q: "Name this symbol", a: "Diameter", wrong: ["Position", "Circularity", "Not to scale"], why: "Size across a circle." },
  { deck: "reading", art: "square",      q: "Name this symbol", a: "Square (shape)", wrong: ["Basic dimension", "Datum feature", "Counterbore"], why: "The feature is square in shape." },
  { deck: "reading", q: "A number in a box, like [3.750], is a:", a: "Basic dimension", wrong: ["Reference dimension", "Datum feature", "Inspection-only dimension"], why: "Theoretically exact. The GD&T frame supplies the tolerance." },
  { deck: "reading", q: "A number in parentheses, like (2.500), is a:", a: "Reference dimension", wrong: ["Basic dimension", "Negative dimension", "Optional feature"], why: "For information only. It isn't inspected." },
  { deck: "reading", q: "An underlined dimension means:", a: "Not to scale: trust the number", wrong: ["Critical dimension", "Minimum size", "Basic dimension"], why: "The drawing changed but this feature wasn't redrawn. Never scale a print anyway." },
  { deck: "reading", q: "What does 8X mean?", a: "The feature repeats 8 times", wrong: ["8 times the scale", "8 thou tolerance", "Detail view 8"], why: "Number of places." },
  { deck: "reading", q: "Read it: 2X ⌀.136 ↧ .500", a: "Two holes, .136 diameter, .500 deep", wrong: ["One hole, .136 radius, .500 long", "Two holes, .500 diameter, .136 deep", ".136 hole every .500"], why: "How many → what size → how deep." },
  { deck: "reading", q: "In the frame  [ Position | ⌀0.5 MMC | A | B | C ],  datum A is:", a: "The primary datum: the part locates on it first", wrong: ["The least important datum", "The hole being toleranced", "The 0.5 zone"], why: "Datums are listed by priority: A primary, B secondary, C tertiary. That's also the order of the setup." },
  { deck: "reading", q: "On an EB print, 'Plan' and 'Elevation' are:", a: "Plan = top view, Elevation = front view", wrong: ["Plan = front, Elevation = top", "Both are section views", "Plan = side, Elevation = isometric"], why: "Architect terms. A floor plan is drawn looking down." },
  { deck: "reading", q: "A boxed letter attached to a surface, like [A]:", a: "Datum feature", wrong: ["Section view label", "Detail view", "Revision letter"], why: "A reference surface or axis you measure and set up from." },
];
