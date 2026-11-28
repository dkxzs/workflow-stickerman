// engine/character_renderer.mjs
// Stickman 2.0 — Expressive Thin-Line Cartoon Character Renderer
// Inspired by sleek illustrated stickman explainers: thin crisp ink outlines,
// warm skin tone with shading, colorful outfits, hair/hats, expressive hands & shoes,
// 2-segment arm/leg kinematics, rich facial expressions, and wrist-attached props.

const INK = '#1e1c1a';
const SKIN_DEFAULT = '#f7d5b5';
const SKIN_SHADE = '#e6b891';
const SKIN_ANGRY = '#f26b63';
const SKIN_ANGRY_SHADE = '#d94840';
const RED = '#d7372c';
const TEAL = '#2a9d8f';
const GOLD = '#f4b400';
const BLUE = '#3b82f6';
const MUTED = '#8c857b';

// Sleek cartoon stroke widths (much finer than legacy 12-14px strokes)
const LIMB_STROKE = 6.5;
const OUTLINE_STROKE = 4.2;
const FACE_STROKE = 3.6;

/**
 * Expanded 2-segment pose rig table.
 * Coordinates are relative to shoulder (for arms) or hip (for legs) in character local space
 * (hipY = 630, shoulderY = 435, floorY = 900; facing right dir = 1).
 * Arms: (elx, ely) = elbow, (hx, hy) = wrist/hand.
 * Legs: (kx, ky) = knee, (fx, fy) = foot/ankle (relative to hipY, where +270 = FLOOR_Y).
 * hipDy: vertical shift of hip (e.g., sitting/kneeling/jumping).
 */
export const POSE_RIGS_V2 = {
  // --- Original 8 canonical poses (upgraded with 2-segment limbs) ---
  idle_neutral: {
    lelx: -36, lely: 68, lhx: -28, lhy: 138,
    relx: 36,  rely: 68, rhx: 28,  rhy: 138,
    lkx: -22, lky: 135, lfx: -26, lfy: 266,
    rkx: 22,  rky: 135, rfx: 26,  rfy: 266,
    hipDy: 0, lean: 0, tilt: 0,
  },
  thinking: {
    lelx: -44, lely: 62, lhx: -14, lhy: 112,
    relx: 58,  rely: 58, rhx: 18,  rhy: -32,
    lkx: -20, lky: 135, lfx: -24, lfy: 266,
    rkx: 24,  rky: 135, rfx: 30,  rfy: 266,
    hipDy: 0, lean: 3, tilt: 7,
  },
  idea_lightbulb: {
    lelx: -38, lely: 68, lhx: -30, lhy: 136,
    relx: 62,  rely: -12, rhx: 52, rhy: -128,
    lkx: -24, lky: 135, lfx: -28, lfy: 266,
    rkx: 24,  rky: 135, rfx: 30,  rfy: 266,
    hipDy: 0, lean: -2, tilt: -5,
  },
  stressed_headache: {
    lelx: -78, lely: 12, lhx: -48, lhy: -66,
    relx: 78,  rely: 12, rhx: 48,  rhy: -66,
    lkx: -26, lky: 135, lfx: -32, lfy: 266,
    rkx: 26,  rky: 135, rfx: 32,  rfy: 266,
    hipDy: 6, lean: 7, tilt: 9,
  },
  running_hurry: {
    lelx: -64, lely: 32, lhx: -92, lhy: 82,
    relx: 68,  rely: 22, rhx: 108, rhy: -24,
    lkx: -48, lky: 128, lfx: -96, lfy: 244,
    rkx: 54,  rky: 116, rfx: 86,  rfy: 252,
    hipDy: -8, lean: 15, tilt: 5,
  },
  pointing_target: {
    lelx: -36, lely: 68, lhx: -26, lhy: 136,
    relx: 94,  rely: 24, rhx: 196, rhy: 14,
    lkx: -22, lky: 135, lfx: -28, lfy: 266,
    rkx: 26,  rky: 135, rfx: 34,  rfy: 266,
    hipDy: 0, lean: 5, tilt: 0,
  },
  shocked_fall: {
    lelx: -82, lely: -12, lhx: -116, lhy: -72,
    relx: 82,  rely: -12, rhx: 116,  rhy: -72,
    lkx: -44, lky: 124, lfx: -76, lfy: 240,
    rkx: 56,  rky: 108, rfx: 92,  rfy: 210,
    hipDy: -18, lean: -14, tilt: -8,
  },
  celebrate_win: {
    lelx: -74, lely: -18, lhx: -94, lhy: -116,
    relx: 74,  rely: -18, rhx: 94,  rhy: -116,
    lkx: -28, lky: 132, lfx: -38, lfy: 266,
    rkx: 28,  rky: 132, rfx: 38,  rfy: 266,
    hipDy: 0, lean: -3, tilt: -4,
  },

  // --- New expressive poses inspired by reference sheet ---
  kneeling_offer: {
    lelx: 42,  lely: 46, lhx: 96,  lhy: 12,
    relx: 54,  rely: 34, rhx: 112, rhy: -2,
    lkx: -10, lky: 118, lfx: -95, lfy: 158,
    rkx: 78,  rky: 74,  rfx: 74,  rfy: 162,
    hipDy: 104, lean: 4, tilt: -3,
  },
  singing_mic: {
    lelx: -42, lely: 44, lhx: -18, lhy: -26,
    relx: 78,  rely: 12, rhx: 142, rhy: -54,
    lkx: -30, lky: 135, lfx: -48, lfy: 266,
    rkx: 32,  rky: 135, rfx: 52,  rfy: 266,
    hipDy: 0, lean: -6, tilt: -8,
  },
  balancing: {
    lelx: -88, lely: 16, lhx: -154, lhy: 32,
    relx: 88,  rely: 16, rhx: 154,  rhy: 22,
    lkx: -42, lky: 116, lfx: -68, lfy: 232,
    rkx: 44,  rky: 116, rfx: 68,  rfy: 232,
    hipDy: -20, lean: 2, tilt: 0,
  },
  lifting_weight: {
    lelx: -66, lely: 46, lhx: -32, lhy: 104,
    relx: 74,  rely: 42, rhx: 86,  rhy: -18,
    lkx: -24, lky: 135, lfx: -30, lfy: 266,
    rkx: 24,  rky: 135, rfx: 30,  rfy: 266,
    hipDy: 0, lean: -2, tilt: 2,
  },
  painting: {
    lelx: 28,  lely: 64, lhx: 64,  lhy: 82,
    relx: 68,  rely: 44, rhx: 128, rhy: 18,
    lkx: -22, lky: 135, lfx: -26, lfy: 266,
    rkx: 22,  rky: 135, rfx: 28,  rfy: 266,
    hipDy: 0, lean: 4, tilt: 4,
  },
  slipping_fall: {
    lelx: -74, lely: 26, lhx: -124, lhy: 64,
    relx: 78,  rely: -18, rhx: 128, rhy: -68,
    lkx: 34,  lky: 112, lfx: 88,  lfy: 196,
    rkx: 78,  rky: 68,  rfx: 144, rfy: 116,
    hipDy: -28, lean: -24, tilt: -14,
  },
  dancing: {
    lelx: -68, lely: 28, lhx: -112, lhy: 78,
    relx: 68,  rely: -18, rhx: 96,  rhy: -96,
    lkx: -44, lky: 118, lfx: -54, lfy: 252,
    rkx: 48,  rky: 114, rfx: 32,  rfy: 256,
    hipDy: -6, lean: 6, tilt: -5,
  },
  sitting: {
    lelx: -28, lely: 68, lhx: 18,  lhy: 112,
    relx: 38,  rely: 64, rhx: 74,  rhy: 102,
    lkx: 82,  lky: 18,  lfx: 74,  lfy: 176,
    rkx: 102, rky: 22,  rfx: 96,  rfy: 176,
    hipDy: 86, lean: 2, tilt: 0,
  },
  walking: {
    lelx: -46, lely: 58, lhx: -64, lhy: 118,
    relx: 48,  rely: 56, rhx: 68,  rhy: 112,
    lkx: -30, lky: 132, lfx: -56, lfy: 264,
    rkx: 34,  rky: 132, rfx: 58,  rfy: 264,
    hipDy: 0, lean: 6, tilt: 2,
  },
  presenting: {
    lelx: -42, lely: 62, lhx: -22, lhy: 122,
    relx: 74,  rely: 46, rhx: 146, rhy: 4,
    lkx: -22, lky: 135, lfx: -26, lfy: 266,
    rkx: 24,  rky: 135, rfx: 32,  rfy: 266,
    hipDy: 0, lean: 3, tilt: -2,
  },
};

export const OUTFITS = [
  'casual', 'hoodie', 'suit', 'jacket', 'tank_top', 'artist', 'disco', 'lab_coat', 'classic',
];

export const HAIRS = [
  'none', 'messy', 'spiky', 'parted', 'ponytail', 'beret', 'cap', 'beanie', 'crown',
];

export const HAND_PROPS = [
  'none', 'mic', 'dumbbell', 'paintbrush', 'ring_box', 'phone',
  'coffee_mug', 'book', 'money', 'magnifying_glass', 'megaphone', 'laptop',
];

export const MOODS_V2 = [
  'neutral', 'eager', 'happy', 'flat', 'deadpan', 'sad',
  'angry', 'shocked', 'laughing', 'focused', 'singing',
];

const OUTFIT_DEFAULTS = {
  casual:   { primary: '#f59e0b', secondary: '#1e293b', shoe: '#334155' },
  hoodie:   { primary: '#facc15', secondary: '#ca8a04', shoe: '#2563eb' },
  suit:     { primary: '#27272a', secondary: '#ffffff', shoe: '#18181b' },
  jacket:   { primary: '#dc2626', secondary: '#ffffff', shoe: '#18181b' },
  tank_top: { primary: '#22c55e', secondary: '#15803d', shoe: '#16a34a' },
  artist:   { primary: '#f8fafc', secondary: '#7c3aed', shoe: '#6d28d9' },
  disco:    { primary: '#0ea5e9', secondary: '#e0f2fe', shoe: '#e0f2fe' },
  lab_coat: { primary: '#f8fafc', secondary: '#0284c7', shoe: '#334155' },
  classic:  { primary: INK,       secondary: INK,       shoe: INK },
};

function easeOutBack(x) {
  return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
}

export function resolvePoseV2(poseName, prevPoseName, t, blendSec = 0.35) {
  const cur = POSE_RIGS_V2[poseName] || POSE_RIGS_V2.idle_neutral;
  const prev = prevPoseName ? (POSE_RIGS_V2[prevPoseName] || POSE_RIGS_V2.idle_neutral) : cur;
  const x = Math.min(1, Math.max(0, t / blendSec));
  const e = easeOutBack(x);
  const out = {};
  for (const k of Object.keys(cur)) {
    out[k] = prev[k] + (cur[k] - prev[k]) * e;
  }
  return out;
}

/**
 * Render expressive cartoon face with warm skin tone or angry flush.
 */
function renderFaceV2(headX, headY, headR, mood, blink, mouthOpen, dir) {
  const lookShift = 5 * dir;
  const ex1 = headX - 18 + lookShift;
  const ex2 = headX + 18 + lookShift;
  const ey = headY - 6;

  let eyeSVG = '';
  let fxSVG = '';

  if (blink) {
    eyeSVG = `
      <path d="M ${ex1 - 9} ${ey} Q ${ex1} ${ey + 4} ${ex1 + 9} ${ey}" fill="none" stroke="${INK}" stroke-width="${FACE_STROKE}" stroke-linecap="round"/>
      <path d="M ${ex2 - 9} ${ey} Q ${ex2} ${ey + 4} ${ex2 + 9} ${ey}" fill="none" stroke="${INK}" stroke-width="${FACE_STROKE}" stroke-linecap="round"/>
    `;
  } else if (mood === 'angry') {
    eyeSVG = `
      <ellipse cx="${ex1}" cy="${ey + 2}" rx="6" ry="5" fill="#ffffff" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="${ex1 + 1 * dir}" cy="${ey + 2}" r="2.5" fill="${INK}"/>
      <ellipse cx="${ex2}" cy="${ey + 2}" rx="6" ry="5" fill="#ffffff" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="${ex2 + 1 * dir}" cy="${ey + 2}" r="2.5" fill="${INK}"/>
      <line x1="${ex1 - 12}" y1="${ey - 16}" x2="${ex1 + 10}" y2="${ey - 6}" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/>
      <line x1="${ex2 - 10}" y1="${ey - 6}" x2="${ex2 + 12}" y2="${ey - 16}" stroke="${INK}" stroke-width="4.2" stroke-linecap="round"/>
    `;
    // Anger vein + sweat
    fxSVG = `
      <path d="M ${headX + 26 * dir} ${headY - 34} L ${headX + 22 * dir} ${headY - 26} L ${headX + 30 * dir} ${headY - 24}" fill="none" stroke="#991b1b" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M ${headX - 34 * dir} ${headY - 22} Q ${headX - 38 * dir} ${headY - 12} ${headX - 32 * dir} ${headY - 12} Q ${headX - 28 * dir} ${headY - 12} ${headX - 34 * dir} ${headY - 22} Z" fill="#e0f2fe" stroke="${INK}" stroke-width="1.8"/>
    `;
  } else if (mood === 'shocked') {
    eyeSVG = `
      <circle cx="${ex1}" cy="${ey - 2}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="3.2"/>
      <circle cx="${ex1}" cy="${ey - 2}" r="3.2" fill="${INK}"/>
      <circle cx="${ex2}" cy="${ey - 2}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="3.2"/>
      <circle cx="${ex2}" cy="${ey - 2}" r="3.2" fill="${INK}"/>
      <path d="M ${ex1 - 11} ${ey - 22} Q ${ex1} ${ey - 29} ${ex1 + 10} ${ey - 21}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M ${ex2 - 10} ${ey - 21} Q ${ex2} ${ey - 29} ${ex2 + 11} ${ey - 22}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
    `;
  } else if (mood === 'laughing') {
    eyeSVG = `
      <path d="M ${ex1 - 10} ${ey + 2} Q ${ex1} ${ey - 11} ${ex1 + 10} ${ey + 2}" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>
      <path d="M ${ex2 - 10} ${ey + 2} Q ${ex2} ${ey - 11} ${ex2 + 10} ${ey + 2}" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>
      <path d="M ${ex1 - 10} ${ey - 15} Q ${ex1} ${ey - 22} ${ex1 + 10} ${ey - 15}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M ${ex2 - 10} ${ey - 15} Q ${ex2} ${ey - 22} ${ex2 + 10} ${ey - 15}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    `;
  } else if (mood === 'singing') {
    eyeSVG = `
      <path d="M ${ex1 - 9} ${ey - 4} L ${ex1 + 4} ${ey + 1} L ${ex1 - 9} ${ey + 6}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M ${ex2 + 9} ${ey - 4} L ${ex2 - 4} ${ey + 1} L ${ex2 + 9} ${ey + 6}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  } else if (mood === 'focused') {
    eyeSVG = `
      <ellipse cx="${ex1}" cy="${ey}" rx="4.2" ry="6.2" fill="${INK}"/>
      <ellipse cx="${ex2}" cy="${ey}" rx="4.2" ry="6.2" fill="${INK}"/>
      <line x1="${ex1 - 11}" y1="${ey - 15}" x2="${ex1 + 9}" y2="${ey - 8}" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
      <line x1="${ex2 - 9}" y1="${ey - 8}" x2="${ex2 + 11}" y2="${ey - 15}" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
    `;
  } else if (mood === 'deadpan') {
    eyeSVG = `
      <line x1="${ex1 - 10}" y1="${ey - 2}" x2="${ex1 + 10}" y2="${ey - 2}" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
      <circle cx="${ex1}" cy="${ey + 2}" r="3.4" fill="${INK}"/>
      <line x1="${ex2 - 10}" y1="${ey - 2}" x2="${ex2 + 10}" y2="${ey - 2}" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
      <circle cx="${ex2}" cy="${ey + 2}" r="3.4" fill="${INK}"/>
      <line x1="${ex1 - 11}" y1="${ey - 15}" x2="${ex1 + 10}" y2="${ey - 15}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <line x1="${ex2 - 10}" y1="${ey - 15}" x2="${ex2 + 11}" y2="${ey - 15}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
    `;
  } else if (mood === 'flat') {
    eyeSVG = `
      <ellipse cx="${ex1}" cy="${ey}" rx="4" ry="5.2" fill="${INK}"/>
      <ellipse cx="${ex2}" cy="${ey}" rx="4" ry="5.2" fill="${INK}"/>
      <line x1="${ex1 - 10}" y1="${ey - 14}" x2="${ex1 + 9}" y2="${ey - 14}" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <line x1="${ex2 - 9}" y1="${ey - 14}" x2="${ex2 + 10}" y2="${ey - 14}" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
    `;
  } else if (mood === 'sad') {
    eyeSVG = `
      <ellipse cx="${ex1}" cy="${ey + 2}" rx="4.2" ry="6" fill="${INK}"/>
      <ellipse cx="${ex2}" cy="${ey + 2}" rx="4.2" ry="6" fill="${INK}"/>
      <line x1="${ex1 - 12}" y1="${ey - 10}" x2="${ex1 + 8}" y2="${ey - 17}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <line x1="${ex2 - 8}" y1="${ey - 17}" x2="${ex2 + 12}" y2="${ey - 10}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
    `;
  } else if (mood === 'eager' || mood === 'happy') {
    // Sleek solid oval eyes like the reference image + subtle sparkle
    eyeSVG = `
      <ellipse cx="${ex1}" cy="${ey}" rx="4.4" ry="6.8" fill="${INK}"/>
      <circle cx="${ex1 - 1.2}" cy="${ey - 2.2}" r="1.4" fill="#ffffff"/>
      <ellipse cx="${ex2}" cy="${ey}" rx="4.4" ry="6.8" fill="${INK}"/>
      <circle cx="${ex2 - 1.2}" cy="${ey - 2.2}" r="1.4" fill="#ffffff"/>
      <path d="M ${ex1 - 9} ${ey - 15} Q ${ex1} ${ey - 22} ${ex1 + 9} ${ey - 15}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M ${ex2 - 9} ${ey - 15} Q ${ex2} ${ey - 22} ${ex2 + 9} ${ey - 15}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
    `;
  } else {
    // neutral — sleek dark oval dots like reference image
    eyeSVG = `
      <ellipse cx="${ex1}" cy="${ey}" rx="4.2" ry="6.2" fill="${INK}"/>
      <ellipse cx="${ex2}" cy="${ey}" rx="4.2" ry="6.2" fill="${INK}"/>
      <path d="M ${ex1 - 9} ${ey - 14} Q ${ex1} ${ey - 17} ${ex1 + 8} ${ey - 14}" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M ${ex2 - 8} ${ey - 14} Q ${ex2} ${ey - 17} ${ex2 + 9} ${ey - 14}" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
    `;
  }

  const mx = headX + lookShift * 0.7;
  const my = headY + 22;
  let mouthSVG = '';

  if (mood === 'angry') {
    mouthSVG = `
      <path d="M ${mx - 18} ${my + 6} Q ${mx} ${my - 8} ${mx + 18} ${my + 6} Q ${mx} ${my + 12} ${mx - 18} ${my + 6} Z" fill="#ffffff" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <line x1="${mx - 14}" y1="${my + 4}" x2="${mx + 14}" y2="${my + 4}" stroke="${INK}" stroke-width="2"/>
    `;
  } else if (mood === 'shocked') {
    mouthSVG = `
      <ellipse cx="${mx}" cy="${my + 4}" rx="15" ry="18" fill="#7f1d1d" stroke="${INK}" stroke-width="3.4"/>
      <ellipse cx="${mx}" cy="${my + 14}" rx="9" ry="5" fill="#f87171"/>
    `;
  } else if (mood === 'laughing') {
    mouthSVG = `
      <path d="M ${mx - 20} ${my - 4} Q ${mx} ${my - 2} ${mx + 20} ${my - 4} Q ${mx + 16} ${my + 22} ${mx} ${my + 22} Q ${mx - 16} ${my + 22} ${mx - 20} ${my - 4} Z" fill="#7f1d1d" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M ${mx - 11} ${my + 12} Q ${mx} ${my + 7} ${mx + 11} ${my + 12} Q ${mx} ${my + 20} ${mx - 11} ${my + 12} Z" fill="#f87171"/>
    `;
  } else if (mood === 'singing') {
    mouthSVG = `<ellipse cx="${mx}" cy="${my + 2}" rx="9" ry="12" fill="#7f1d1d" stroke="${INK}" stroke-width="3.2"/>`;
  } else if (mood === 'focused') {
    mouthSVG = `
      <path d="M ${mx - 14} ${my + 2} Q ${mx} ${my + 8} ${mx + 14} ${my}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M ${mx + 4} ${my + 4} Q ${mx + 12} ${my + 16} ${mx + 17} ${my + 6} Q ${mx + 13} ${my + 1} ${mx + 4} ${my + 4} Z" fill="#f472b6" stroke="${INK}" stroke-width="2.4"/>
    `;
  } else if (mouthOpen > 2) {
    mouthSVG = `
      <ellipse cx="${mx}" cy="${my + 2}" rx="12" ry="${Math.min(14, mouthOpen)}" fill="#991b1b" stroke="${INK}" stroke-width="3.2"/>
    `;
  } else if (mood === 'happy') {
    mouthSVG = `<path d="M ${mx - 18} ${my - 2} Q ${mx} ${my + 16} ${mx + 18} ${my - 2}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`;
  } else if (mood === 'eager') {
    mouthSVG = `<path d="M ${mx - 14} ${my} Q ${mx} ${my + 12} ${mx + 14} ${my}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
  } else if (mood === 'sad') {
    mouthSVG = `<path d="M ${mx - 15} ${my + 9} Q ${mx} ${my - 4} ${mx + 15} ${my + 9}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
  } else if (mood === 'flat' || mood === 'deadpan') {
    mouthSVG = `<line x1="${mx - 14}" y1="${my + 4}" x2="${mx + 14}" y2="${my + 4}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
  } else {
    mouthSVG = `<path d="M ${mx - 12} ${my + 2} Q ${mx} ${my + 9} ${mx + 12} ${my + 2}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  }

  return { eyeSVG, mouthSVG, fxSVG };
}

/**
 * Render hair or hat anchored to the top of the head.
 */
function renderHairOrHat(hair, headX, headY, headR, dir, hairColor = '#2b241f') {
  if (!hair || hair === 'none') return '';
  const topY = headY - headR;

  switch (hair) {
    case 'messy':
      return `
        <path d="M ${headX - 30} ${topY + 12} Q ${headX - 18} ${topY - 14} ${headX - 4} ${topY + 4} Q ${headX + 6} ${topY - 18} ${headX + 18} ${topY + 3} Q ${headX + 30} ${topY - 8} ${headX + 34} ${topY + 14}" fill="none" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'spiky':
      return `
        <path d="M ${headX - 42} ${topY + 22} L ${headX - 32} ${topY - 6} L ${headX - 14} ${topY + 4} L ${headX - 2} ${topY - 18} L ${headX + 12} ${topY + 2} L ${headX + 28} ${topY - 10} L ${headX + 42} ${topY + 20} Q ${headX} ${topY + 8} ${headX - 42} ${topY + 22} Z" fill="${hairColor}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      `;
    case 'parted':
      return `
        <path d="M ${headX - headR + 4} ${headY - 14} C ${headX - headR + 2} ${topY - 14} ${headX + headR - 2} ${topY - 14} ${headX + headR - 4} ${headY - 12} C ${headX + 26 * dir} ${topY + 12} ${headX - 12 * dir} ${topY + 6} ${headX - headR + 4} ${headY - 14} Z" fill="${hairColor}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      `;
    case 'ponytail':
      return `
        <path d="M ${headX - 46 * dir} ${topY + 22} C ${headX - 78 * dir} ${topY + 10} ${headX - 88 * dir} ${topY + 56} ${headX - 62 * dir} ${topY + 72} C ${headX - 66 * dir} ${topY + 48} ${headX - 52 * dir} ${topY + 36} ${headX - 42 * dir} ${topY + 34} Z" fill="${hairColor}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M ${headX - 44} ${topY + 20} C ${headX - 30} ${topY - 12} ${headX + 32} ${topY - 12} ${headX + 44} ${topY + 20} Q ${headX} ${topY + 6} ${headX - 44} ${topY + 20} Z" fill="${hairColor}" stroke="${INK}" stroke-width="3.2"/>
      `;
    case 'beret':
      return `
        <g transform="translate(${headX - 6 * dir}, ${topY + 8}) rotate(${-10 * dir})">
          <ellipse cx="0" cy="-6" rx="58" ry="20" fill="#7c3aed" stroke="${INK}" stroke-width="3.8"/>
          <path d="M -38 4 Q 0 12 38 4" fill="none" stroke="${INK}" stroke-width="3.5"/>
          <path d="M 0 -26 Q 4 -36 10 -34" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        </g>
      `;
    case 'cap':
      return `
        <g transform="translate(${headX}, ${topY + 12})">
          <path d="M -48 6 C -48 -26 48 -26 48 6 Z" fill="#2563eb" stroke="${INK}" stroke-width="3.8"/>
          <path d="M ${-48 * dir} 6 L ${72 * dir} 6 C ${76 * dir} 12 ${52 * dir} 16 ${20 * dir} 12 L ${-48 * dir} 6 Z" fill="#1d4ed8" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
        </g>
      `;
    case 'beanie':
      return `
        <g transform="translate(${headX}, ${topY + 14})">
          <path d="M -50 6 C -48 -30 48 -30 50 6 Z" fill="#dc2626" stroke="${INK}" stroke-width="3.8"/>
          <rect x="-53" y="-2" width="106" height="16" rx="8" fill="#b91c1c" stroke="${INK}" stroke-width="3.6"/>
          <circle cx="0" cy="-26" r="10" fill="#dc2626" stroke="${INK}" stroke-width="3.2"/>
        </g>
      `;
    case 'crown':
      return `
        <g transform="translate(${headX}, ${topY + 4})">
          <polygon points="-32,8 -38,-22 -14,-6 0,-28 14,-6 38,-22 32,8" fill="${GOLD}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
        </g>
      `;
    default:
      return '';
  }
}

/**
 * Render torso garment / outfit between shoulder and hip.
 */
function renderOutfitTorso(outfit, shoulderX, shoulderY, hipX, hipY, dir, primaryColor, secondaryColor) {
  const mx = (shoulderX + hipX) / 2;
  const my = (shoulderY + hipY) / 2;
  const dx = shoulderX - hipX;
  const dy = hipY - shoulderY;
  const angle = Math.atan2(dx, dy) * (180 / Math.PI);
  const torsoH = Math.hypot(dx, dy);

  if (outfit === 'classic') {
    return `<path d="M ${hipX} ${hipY} Q ${mx - 2} ${my} ${shoulderX} ${shoulderY}" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  }

  // Torso drawn in local upright coordinates centered at hip (0,0) up to (0, -torsoH)
  let bodyMarkup = '';
  const wTop = 34;
  const wBot = 40;

  if (outfit === 'hoodie') {
    bodyMarkup = `
      <path d="M ${-wTop} ${-torsoH + 6} Q 0 ${-torsoH - 12} ${wTop} ${-torsoH + 6} L ${wBot + 8} ${-8} Q 0 12 ${-wBot - 8} ${-8} Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <!-- Hood collar -->
      <path d="M -26 ${-torsoH + 4} Q 0 ${-torsoH + 26} 26 ${-torsoH + 4}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <!-- Drawstrings -->
      <line x1="-8" y1="${-torsoH + 16}" x2="-10" y2="${-torsoH + 54}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="8" y1="${-torsoH + 16}" x2="10" y2="${-torsoH + 54}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Kangaroo pocket -->
      <path d="M -24 -44 L 24 -44 L 30 -14 L -30 -14 Z" fill="${secondaryColor}" opacity="0.35" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
    `;
  } else if (outfit === 'suit') {
    bodyMarkup = `
      <path d="M ${-wTop} ${-torsoH + 4} L ${wTop} ${-torsoH + 4} L ${wBot} 4 L ${-wBot} 4 Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <!-- White shirt V -->
      <polygon points="-16,${-torsoH + 4} 0,${-torsoH + 58} 16,${-torsoH + 4}" fill="${secondaryColor}" stroke="${INK}" stroke-width="2.6"/>
      <!-- Bowtie -->
      <polygon points="-12,${-torsoH + 10} 0,${-torsoH + 16} -12,${-torsoH + 22}" fill="#18181b" stroke="${INK}" stroke-width="2"/>
      <polygon points="12,${-torsoH + 10} 0,${-torsoH + 16} 12,${-torsoH + 22}" fill="#18181b" stroke="${INK}" stroke-width="2"/>
      <circle cx="0" cy="${-torsoH + 16}" r="3.5" fill="#18181b"/>
      <!-- Buttons -->
      <circle cx="0" cy="-54" r="3.5" fill="#71717a"/>
      <circle cx="0" cy="-26" r="3.5" fill="#71717a"/>
    `;
  } else if (outfit === 'jacket') {
    bodyMarkup = `
      <path d="M ${-wTop - 2} ${-torsoH + 4} L ${wTop + 2} ${-torsoH + 4} L ${wBot + 4} 2 L ${-wBot - 4} 2 Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <!-- White inner tee -->
      <rect x="-13" y="${-torsoH + 4}" width="26" height="${torsoH - 4}" fill="${secondaryColor}" stroke="${INK}" stroke-width="2.6"/>
      <!-- Jacket lapels -->
      <polygon points="-13,${-torsoH + 4} -30,${-torsoH + 34} -13,${-torsoH + 46}" fill="${primaryColor}" stroke="${INK}" stroke-width="2.6"/>
      <polygon points="13,${-torsoH + 4} 30,${-torsoH + 34} 13,${-torsoH + 46}" fill="${primaryColor}" stroke="${INK}" stroke-width="2.6"/>
    `;
  } else if (outfit === 'tank_top') {
    bodyMarkup = `
      <path d="M -24 ${-torsoH + 6} Q 0 ${-torsoH + 26} 24 ${-torsoH + 6} L 34 2 Q 0 10 -34 2 Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <line x1="-18" y1="${-torsoH + 10}" x2="-18" y2="${-torsoH + 30}" stroke="${secondaryColor}" stroke-width="3" opacity="0.6"/>
      <line x1="18" y1="${-torsoH + 10}" x2="18" y2="${-torsoH + 30}" stroke="${secondaryColor}" stroke-width="3" opacity="0.6"/>
    `;
  } else if (outfit === 'artist') {
    bodyMarkup = `
      <path d="M ${-wTop} ${-torsoH + 4} L ${wTop} ${-torsoH + 4} L ${wBot + 6} 14 Q 0 22 ${-wBot - 6} 14 Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <!-- Paint splatters -->
      <circle cx="-14" cy="-76" r="7" fill="#ef4444" opacity="0.85"/>
      <circle cx="16" cy="-54" r="6" fill="#3b82f6" opacity="0.85"/>
      <circle cx="-6" cy="-32" r="5" fill="#facc15" opacity="0.9"/>
      <circle cx="12" cy="-20" r="4.5" fill="#22c55e" opacity="0.85"/>
    `;
  } else if (outfit === 'disco') {
    bodyMarkup = `
      <path d="M ${-wTop} ${-torsoH + 4} L ${wTop} ${-torsoH + 4} L ${wBot} 8 L ${-wBot} 8 Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <!-- Collar V & Belt -->
      <polygon points="-14,${-torsoH + 4} 0,${-torsoH + 42} 14,${-torsoH + 4}" fill="${SKIN_DEFAULT}" stroke="${INK}" stroke-width="2.4"/>
      <rect x="${-wBot + 2}" y="-22" width="${(wBot - 2) * 2}" height="12" rx="3" fill="${secondaryColor}" stroke="${INK}" stroke-width="2.6"/>
      <!-- Sparkles -->
      <circle cx="-16" cy="-94" r="2.5" fill="#ffffff"/>
      <circle cx="18" cy="-72" r="2.5" fill="#ffffff"/>
      <circle cx="-8" cy="-48" r="2.5" fill="#ffffff"/>
    `;
  } else if (outfit === 'lab_coat') {
    bodyMarkup = `
      <path d="M ${-wTop} ${-torsoH + 4} L ${wTop} ${-torsoH + 4} L ${wBot + 8} 34 L ${-wBot - 8} 34 Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <polygon points="-14,${-torsoH + 4} 0,${-torsoH + 56} 14,${-torsoH + 4}" fill="#e2e8f0" stroke="${INK}" stroke-width="2.4"/>
      <polygon points="-4,${-torsoH + 14} 4,${-torsoH + 14} 6,${-torsoH + 48} 0,${-torsoH + 56} -6,${-torsoH + 48}" fill="${secondaryColor}" stroke="${INK}" stroke-width="1.8"/>
      <line x1="0" y1="${-torsoH + 56}" x2="0" y2="34" stroke="${INK}" stroke-width="2.6"/>
      <rect x="12" y="-56" width="20" height="22" rx="3" fill="none" stroke="${INK}" stroke-width="2.2"/>
    `;
  } else {
    // casual tee
    bodyMarkup = `
      <path d="M ${-wTop} ${-torsoH + 6} Q 0 ${-torsoH - 6} ${wTop} ${-torsoH + 6} L ${wBot} 4 Q 0 14 ${-wBot} 4 Z" fill="${primaryColor}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}" stroke-linejoin="round"/>
      <path d="M -16 ${-torsoH + 4} Q 0 ${-torsoH + 18} 16 ${-torsoH + 4}" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
    `;
  }

  return `<g transform="translate(${hipX.toFixed(1)}, ${hipY.toFixed(1)}) rotate(${angle.toFixed(2)})">${bodyMarkup}</g>`;
}

/**
 * Render wrist-attached hand prop (mic, dumbbell, paintbrush, ring_box, phone, coffee_mug, etc.)
 */
function renderHandProp(propName, hx, hy, dir) {
  if (!propName || propName === 'none') return '';
  switch (propName) {
    case 'mic':
      return `
        <g transform="translate(${hx}, ${hy}) rotate(${-35 * dir})">
          <rect x="-4" y="-6" width="8" height="32" rx="3" fill="#334155" stroke="${INK}" stroke-width="2.6"/>
          <circle cx="0" cy="-14" r="11" fill="#64748b" stroke="${INK}" stroke-width="2.8"/>
          <line x1="-10" y1="-14" x2="10" y2="-14" stroke="#cbd5e1" stroke-width="2"/>
        </g>
      `;
    case 'dumbbell':
      return `
        <g transform="translate(${hx}, ${hy}) rotate(${15 * dir})">
          <rect x="-24" y="-4" width="48" height="8" rx="3" fill="#94a3b8" stroke="${INK}" stroke-width="2.6"/>
          <rect x="-32" y="-14" width="12" height="28" rx="4" fill="#475569" stroke="${INK}" stroke-width="2.8"/>
          <rect x="20" y="-14" width="12" height="28" rx="4" fill="#475569" stroke="${INK}" stroke-width="2.8"/>
        </g>
      `;
    case 'paintbrush':
      return `
        <g transform="translate(${hx}, ${hy}) rotate(${-25 * dir})">
          <line x1="${-16 * dir}" y1="8" x2="${32 * dir}" y2="-14" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
          <path d="M ${30 * dir} -13 L ${44 * dir} -22 L ${38 * dir} -8 Z" fill="#ef4444" stroke="${INK}" stroke-width="2.2"/>
        </g>
      `;
    case 'ring_box':
      return `
        <g transform="translate(${hx + 10 * dir}, ${hy - 12})">
          <rect x="-14" y="0" width="28" height="18" rx="3" fill="#1e293b" stroke="${INK}" stroke-width="2.6"/>
          <path d="M -14 0 L -18 -14 L 10 -14 L 14 0 Z" fill="#334155" stroke="${INK}" stroke-width="2.6"/>
          <circle cx="0" cy="-3" r="6" fill="none" stroke="${GOLD}" stroke-width="3"/>
          <polygon points="0,-13 4,-9 0,-5 -4,-9" fill="#38bdf8" stroke="${INK}" stroke-width="1.5"/>
        </g>
      `;
    case 'phone':
      return `
        <g transform="translate(${hx}, ${hy - 8}) rotate(${-10 * dir})">
          <rect x="-15" y="-26" width="30" height="52" rx="6" fill="#18191c" stroke="${INK}" stroke-width="3.2"/>
          <rect x="-11" y="-20" width="22" height="40" rx="3" fill="#38bdf8"/>
        </g>
      `;
    case 'coffee_mug':
      return `
        <g transform="translate(${hx + 8 * dir}, ${hy - 8})">
          <rect x="-14" y="-16" width="28" height="30" rx="5" fill="#ffffff" stroke="${INK}" stroke-width="3"/>
          <path d="M ${14 * dir} -10 C ${24 * dir} -10 ${24 * dir} 6 ${14 * dir} 6" fill="none" stroke="${INK}" stroke-width="3"/>
        </g>
      `;
    case 'book':
      return `
        <g transform="translate(${hx + 6 * dir}, ${hy - 6}) rotate(${-12 * dir})">
          <rect x="-18" y="-24" width="36" height="46" rx="4" fill="#2563eb" stroke="${INK}" stroke-width="3"/>
          <line x1="-10" y1="-24" x2="-10" y2="22" stroke="#93c5fd" stroke-width="3"/>
        </g>
      `;
    case 'money':
      return `
        <g transform="translate(${hx + 8 * dir}, ${hy - 4}) rotate(${-15 * dir})">
          <rect x="-22" y="-12" width="44" height="24" rx="3" fill="#22c55e" stroke="${INK}" stroke-width="2.8"/>
          <circle cx="0" cy="0" r="6" fill="#bbf7d0" stroke="${INK}" stroke-width="2"/>
        </g>
      `;
    case 'magnifying_glass':
      return `
        <g transform="translate(${hx + 10 * dir}, ${hy - 14}) rotate(${20 * dir})">
          <line x1="0" y1="14" x2="0" y2="34" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="16" fill="#e0f2fe" fill-opacity="0.7" stroke="${INK}" stroke-width="3.6"/>
        </g>
      `;
    case 'megaphone':
      return `
        <g transform="translate(${hx + 14 * dir}, ${hy - 10})">
          <polygon points="${-10 * dir},-6 ${26 * dir},-22 ${26 * dir},14 ${-10 * dir},4" fill="#ef4444" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
          <rect x="${-12 * dir}" y="2" width="8" height="16" rx="2" fill="#334155" stroke="${INK}" stroke-width="2.4"/>
        </g>
      `;
    case 'laptop':
      return `
        <g transform="translate(${hx + 16 * dir}, ${hy - 4})">
          <polygon points="-24,6 24,6 32,-18 -16,-18" fill="#cbd5e1" stroke="${INK}" stroke-width="2.8" stroke-linejoin="round"/>
          <line x1="-26" y1="6" x2="28" y2="6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
        </g>
      `;
    default:
      return '';
  }
}

/**
 * Render a complete Stickman 2.0 character SVG group.
 * Returns { svg, headX, headY, lHandX, lHandY, rHandX, rHandY, shoulderX, shoulderY, hipY }.
 */
export function renderStickmanV2(opts) {
  const {
    id = 'stickman_character',
    heroX,
    floorY = 900,
    scale = 0.62,
    dir = 1,
    poseName = 'idle_neutral',
    prevPoseName = null,
    mood = 'neutral',
    outfit = 'casual',
    outfitColor = null,
    hair = 'none',
    hairColor = '#2b241f',
    skinTone = null,
    handProp = 'none',
    props = [],
    t = 0,
    f = 0,
    fps = 30,
    isTalking = false,
    headRadius = 66,
  } = opts;

  const breath = Math.sin(t * 3.5) * 2.5;
  const blink = (t % 3.2 > 3.05 && t % 3.2 < 3.2);
  const mouthOpen = isTalking ? Math.abs(Math.sin(t * 14)) * 12 : 0;
  const talkNod = isTalking ? Math.sin(t * 10) * 2.0 : 0;

  const pose = resolvePoseV2(poseName, prevPoseName, t);
  const sway = (ff) => Math.sin((ff / fps) * 2.2) * 1.4;
  const tremor = props.includes('tremor') ? Math.sin(t * 42) * 3.2 : 0;
  const torsoLean = pose.lean + sway(f);
  const headLean = pose.lean + sway(f - 3) + pose.tilt;
  const rad = (d) => (d * Math.PI) / 180;

  const baseHipY = 630 + pose.hipDy + breath * 0.3;
  const torsoLen = 195;
  const shoulderX = heroX + tremor + Math.sin(rad(torsoLean)) * torsoLen * dir;
  const shoulderY = baseHipY - Math.cos(rad(torsoLean)) * torsoLen;
  // Rest head snugly on top of the shoulders/collar (no floating gap)
  const headOffset = outfit === 'classic' ? headRadius + 2 : headRadius - 4;
  const headX = shoulderX + Math.sin(rad(headLean)) * headOffset * dir;
  const headY = shoulderY - Math.cos(rad(headLean)) * headOffset + breath * 0.35 + talkNod;

  // Walking / running cycle overlay
  const isWalking = poseName === 'running_hurry' || poseName === 'walking' || props.includes('act_stumble_walk');
  const strideAmp = poseName === 'running_hurry' ? 42 : 28;
  const stride = isWalking ? Math.sin(t * 9.5) * strideAmp : 0;
  const happyBounce = (mood === 'happy' && poseName === 'celebrate_win')
    ? Math.abs(Math.sin(t * 8)) * 16
    : (poseName === 'dancing' ? Math.abs(Math.sin(t * 7)) * 10 : 0);

  // Palette for outfit
  const palette = OUTFIT_DEFAULTS[outfit] || OUTFIT_DEFAULTS.casual;
  const primaryColor = outfitColor || palette.primary;
  const secondaryColor = palette.secondary;
  const shoeColor = palette.shoe;
  const isSleeved = outfit === 'hoodie' || outfit === 'suit' || outfit === 'jacket' || outfit === 'disco' || outfit === 'lab_coat';
  const isLongPants = outfit === 'suit' || outfit === 'jacket' || outfit === 'disco';

  // Leg joints (2-segment: hip -> knee -> foot)
  const lHipX = heroX - 15 * dir;
  const rHipX = heroX + 15 * dir;
  const lKneeX = lHipX + (pose.lkx + stride * 0.45) * dir;
  const lKneeY = baseHipY + pose.lky;
  const lFootX = lHipX + (pose.lfx + stride) * dir;
  const lFootY = Math.min(floorY, baseHipY + pose.lfy);

  const rKneeX = rHipX + (pose.rkx - stride * 0.45) * dir;
  const rKneeY = baseHipY + pose.rky;
  const rFootX = rHipX + (pose.rfx - stride) * dir;
  const rFootY = Math.min(floorY, baseHipY + pose.rfy);

  const legStrokeColor = isLongPants ? primaryColor : INK;
  const legOuterW = isLongPants ? 18 : LIMB_STROKE;

  const drawLeg = (hx, hy, kx, ky, fx, fy) => {
    const pathD = `M ${hx} ${hy} L ${kx} ${ky} L ${fx} ${fy}`;
    if (isLongPants) {
      return `
        <path d="${pathD}" stroke="${INK}" stroke-width="${legOuterW + 6}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${pathD}" stroke="${legStrokeColor}" stroke-width="${legOuterW}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
    return `<path d="${pathD}" stroke="${INK}" stroke-width="${LIMB_STROKE}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  };

  const drawShoe = (fx, fy) => {
    if (outfit === 'classic') return '';
    return `<ellipse cx="${fx + 8 * dir}" cy="${fy + 1}" rx="15" ry="6.5" fill="${shoeColor}" stroke="${INK}" stroke-width="3.2"/>`;
  };

  // Arm joints (2-segment: shoulder -> elbow -> hand)
  const lShX = shoulderX - 24 * dir;
  const rShX = shoulderX + 24 * dir;
  const shY = shoulderY + 14;
  const lElX = shoulderX + pose.lelx * dir;
  const lElY = shY + pose.lely;
  const lHandX = shoulderX + pose.lhx * dir;
  const lHandY = shY + pose.lhy;

  const rElX = shoulderX + pose.relx * dir;
  const rElY = shY + pose.rely;
  const rHandX = shoulderX + pose.rhx * dir;
  const rHandY = shY + pose.rhy;

  const drawArm = (sx, sy, ex, ey, hx, hy) => {
    const pathD = `M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`;
    if (isSleeved) {
      return `
        <path d="${pathD}" stroke="${INK}" stroke-width="19" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${pathD}" stroke="${primaryColor}" stroke-width="12.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
    return `<path d="${pathD}" stroke="${INK}" stroke-width="${LIMB_STROKE}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  };

  const faceSkin = mood === 'angry' ? SKIN_ANGRY : (skinTone || SKIN_DEFAULT);
  const faceShade = mood === 'angry' ? SKIN_ANGRY_SHADE : SKIN_SHADE;

  const drawHand = (hx, hy) => {
    if (outfit === 'classic') {
      return `<circle cx="${hx}" cy="${hy}" r="6" fill="${INK}"/>`;
    }
    return `<circle cx="${hx}" cy="${hy}" r="9" fill="${faceSkin}" stroke="${INK}" stroke-width="3.2"/>`;
  };

  // Extra pose-specific ground props (e.g. skateboard for balancing, banana peel for slipping_fall)
  let poseWorldFx = '';
  if (poseName === 'balancing') {
    poseWorldFx = `
      <g transform="translate(${heroX}, ${floorY - 12})">
        <path d="M -98 -10 Q -85 6 -60 6 L 60 6 Q 85 6 98 -10" fill="none" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <circle cx="-48" cy="14" r="8" fill="#cbd5e1" stroke="${INK}" stroke-width="3"/>
        <circle cx="48" cy="14" r="8" fill="#cbd5e1" stroke="${INK}" stroke-width="3"/>
      </g>
    `;
  } else if (poseName === 'slipping_fall') {
    poseWorldFx = `
      <g transform="translate(${heroX + 75 * dir}, ${floorY - 4})">
        <path d="M -28 6 Q -10 -14 0 -16 Q 12 -14 30 6 Q 10 -2 0 4 Q -10 -2 -28 6 Z" fill="#facc15" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      </g>
    `;
  } else if (poseName === 'dancing') {
    poseWorldFx = `
      <path d="M ${heroX - 105} ${baseHipY + 80} Q ${heroX - 118} ${baseHipY + 115} ${heroX - 105} ${baseHipY + 150}" fill="none" stroke="${MUTED}" stroke-width="3" stroke-dasharray="8 6"/>
      <path d="M ${heroX + 105} ${baseHipY + 40} Q ${heroX + 118} ${baseHipY + 75} ${heroX + 105} ${baseHipY + 110}" fill="none" stroke="${MUTED}" stroke-width="3" stroke-dasharray="8 6"/>
    `;
  }

  // Face
  const { eyeSVG, mouthSVG, fxSVG } = renderFaceV2(headX, headY, headRadius, mood, blink, mouthOpen, dir);
  const hairSVG = renderHairOrHat(hair, headX, headY, headRadius, dir, hairColor);
  const torsoSVG = renderOutfitTorso(outfit, shoulderX, shoulderY, heroX, baseHipY, dir, primaryColor, secondaryColor);
  const propSVG = renderHandProp(handProp, rHandX, rHandY, dir);

  const charTransform = `translate(${heroX}, ${floorY - happyBounce}) scale(${scale}) translate(${-heroX}, ${-floorY})`;

  const svg = `
    <g id="${id}" transform="${charTransform}">
      <!-- Ground Shadow -->
      <ellipse cx="${heroX}" cy="${floorY + 5}" rx="64" ry="12" fill="#1e1c1a" opacity="0.16"/>

      ${poseWorldFx}

      <!-- Rear Arm -->
      <g id="arms">
        ${drawArm(lShX, shY, lElX, lElY, lHandX, lHandY)}
        ${drawHand(lHandX, lHandY)}

        <!-- Legs & Shoes -->
        ${drawLeg(lHipX, baseHipY, lKneeX, lKneeY, lFootX, lFootY)}
        ${drawShoe(lFootX, lFootY)}
        ${drawLeg(rHipX, baseHipY, rKneeX, rKneeY, rFootX, rFootY)}
        ${drawShoe(rFootX, rFootY)}

        <!-- Torso / Outfit -->
        ${torsoSVG}

        <!-- Front Arm & Prop -->
        ${drawArm(rShX, shY, rElX, rElY, rHandX, rHandY)}
        ${propSVG}
        ${drawHand(rHandX, rHandY)}
      </g>

      <!-- Head (warm skin tone with soft cartoon shading + crisp thin outline) -->
      <circle cx="${headX}" cy="${headY}" r="${headRadius}" fill="${faceSkin}" stroke="${INK}" stroke-width="${OUTLINE_STROKE}"/>
      <!-- Subtle cartoon shadow crescent at bottom-left of head -->
      <path d="M ${headX - headRadius * 0.72} ${headY + headRadius * 0.45} A ${headRadius - 2} ${headRadius - 2} 0 0 0 ${headX + headRadius * 0.65} ${headY + headRadius * 0.58} A ${headRadius * 1.15} ${headRadius * 1.15} 0 0 1 ${headX - headRadius * 0.72} ${headY + headRadius * 0.45} Z" fill="${faceShade}" opacity="0.45"/>
      <!-- Subtle top highlight -->
      <ellipse cx="${headX - 20}" cy="${headY - 34}" rx="16" ry="8" transform="rotate(-24 ${headX - 20} ${headY - 34})" fill="#ffffff" opacity="0.35"/>

      ${eyeSVG}
      ${mouthSVG}
      ${fxSVG}
      ${hairSVG}
    </g>
  `;

  return {
    svg,
    headX,
    headY,
    lHandX,
    lHandY,
    rHandX,
    rHandY,
    shoulderX,
    shoulderY,
    hipY: baseHipY,
  };
}
