// engine/vector_scene_renderer.mjs
// Meticulous 1080p SVG Vector Scene Renderer with Dynamic LOD Backgrounds & Expressive Stickman

import { getBackgroundSVG } from './backgrounds.mjs';
import { iconSVG as drawIconSVG } from './icons.mjs';

const INK = '#1e1c1a';
const WHITE = '#fbfaf8';
const RED = '#d7372c';
const TEAL = '#2a9d8f';
const GOLD = '#f4b400';
const BLUE = '#4285f4';
const MUTED = '#8c857b';

const W = 1920;
const H = 1080;
const FLOOR_Y = 900;
const DESK_TOP_Y = 740;
const CHAR_SCALE = 0.56;

// Helper for XML/SVG escaping
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Helper for wavy underline
export function getWavyLine(cx, y, width, color = RED) {
  let d = `M ${cx - width / 2} ${y}`;
  const steps = 18;
  const stepW = width / steps;
  for (let i = 0; i < steps; i++) {
    const x1 = cx - width / 2 + (i + 0.5) * stepW;
    const y1 = y + (i % 2 === 0 ? 5 : -5);
    const x2 = cx - width / 2 + (i + 1) * stepW;
    const y2 = y;
    d += ` Q ${x1} ${y1} ${x2} ${y2}`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`;
}

/**
 * Render storyboard info card at (cx, cy) with optional scale. Returns empty string when card is absent.
 */
export function renderCard(card, cx, cy, accent, scale = 1) {
  if (!card) return '';
  const cardW = 440;
  const cardH = 260;
  const maxTextW = 380;

  const rawTitle = String(card.title ?? '').trim().toUpperCase();
  const rawSub = String(card.subtitle ?? '').trim().toUpperCase();
  const icon = card.icon;
  const titleColor = esc(accent || INK);

  // Auto-shrink font size to fit inside 440px card width (380px inner margin)
  const titleSize = Math.max(16, Math.min(30, Math.floor(maxTextW / Math.max(1, rawTitle.length * 0.65))));
  const subSize = Math.max(11, Math.min(16, Math.floor(maxTextW / Math.max(1, rawSub.length * 0.65))));

  const titleAttr = rawTitle.length * titleSize * 0.62 > maxTextW
    ? ` textLength="${maxTextW}" lengthAdjust="spacingAndGlyphs"`
    : '';
  const subAttr = rawSub.length * subSize * 0.62 > maxTextW
    ? ` textLength="${maxTextW}" lengthAdjust="spacingAndGlyphs"`
    : '';

  const iconMarkup = icon ? drawIconSVG(icon, 0, -42, 1) : '';
  const titleY = icon ? 58 : 4;
  const subY = icon ? 92 : 42;
  const scalePart = scale === 1 ? '' : ` scale(${scale.toFixed(4)})`;

  return `
    <g id="info_card" transform="translate(${cx}, ${cy})${scalePart}" filter="url(#cardShadow)">
      <rect x="${-cardW / 2}" y="${-cardH / 2}" width="${cardW}" height="${cardH}" rx="22" fill="#ffffff" stroke="#d2cdc6" stroke-width="3"/>
      ${iconMarkup}
      ${rawTitle ? `<text x="0" y="${titleY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="${titleSize}" fill="${titleColor}" letter-spacing="1"${titleAttr}>${esc(rawTitle)}</text>` : ''}
      ${rawSub ? `<text x="0" y="${subY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${subSize}" fill="${MUTED}" letter-spacing="2"${subAttr}>${esc(rawSub)}</text>` : ''}
    </g>
  `;
}

/**
 * Render top section header from visual.header {title, subtitle}. Returns '' when absent.
 */
export function renderHeader(header) {
  const title = String(header?.title ?? '').trim().toUpperCase();
  if (!title) return '';
  const subtitle = String(header?.subtitle ?? '').trim().toUpperCase();
  const maxW = 0.80 * W;

  const titleSize = Math.max(20, Math.min(52, Math.floor(maxW / Math.max(1, title.length * 0.65))));
  const estTitleW = title.length * titleSize * 0.62;
  const titleAttr = estTitleW > maxW
    ? ` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"`
    : '';
  const underlineW = Math.min(maxW, Math.max(160, estTitleW + 40));

  let subSVG = '';
  if (subtitle) {
    const subSize = Math.max(14, Math.min(22, Math.floor(maxW / Math.max(1, subtitle.length * 0.62))));
    const subAttr = subtitle.length * subSize * 0.62 > maxW
      ? ` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"`
      : '';
    subSVG = `<text y="52" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${subSize}" fill="${MUTED}" letter-spacing="2"${subAttr}>${esc(subtitle)}</text>`;
  }

  return `
    <g id="top_header" transform="translate(${W / 2}, 92)">
      <text text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="${titleSize}" fill="${INK}" letter-spacing="2"${titleAttr}>${esc(title)}</text>
      ${getWavyLine(0, 18, underlineW)}
      ${subSVG}
    </g>
  `;
}

/**
 * Wrap text into at most 2 lines (~40 chars each) for bottom caption.
 */
export function wrapCaptionLines(text, maxChars = 40) {
  const clean = String(text ?? '').trim().replace(/\s+/g, ' ');
  if (!clean || clean === '...' || clean === '[pause]' || clean === '[silent]') return [];
  if (clean.length <= maxChars) return [clean];

  const words = clean.split(' ');
  const lines = [];
  let current = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else if (lines.length === 0) {
      lines.push(current);
      current = word;
    } else {
      // Already on line 2; append remaining words if they fit, otherwise truncate cleanly
      const rest = [current, ...words.slice(i)].join(' ');
      if (rest.length <= maxChars + 8) {
        current = rest;
      } else {
        current = rest.slice(0, maxChars + 5).trimEnd() + '...';
      }
      break;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

/**
 * Render bottom caption (white text, dark outline) inside 90% safe width, max 2 lines.
 */
export function renderCaption(narrationText) {
  const lines = wrapCaptionLines(narrationText, 40);
  if (lines.length === 0) return '';

  const maxSafeW = 0.90 * W;
  const maxLen = Math.max(...lines.map(l => l.length));
  const fontSize = Math.max(20, Math.min(36, Math.floor(maxSafeW / Math.max(1, maxLen * 0.62))));
  const lineHeight = Math.round(fontSize * 1.28);
  const startY = lines.length === 2 ? 975 : 1005;

  const tspans = lines
    .map((line, idx) => `<tspan x="${W / 2}" dy="${idx === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`)
    .join('');

  return `
    <g id="bottom_caption">
      <text x="${W / 2}" y="${startY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff" stroke="${INK}" stroke-width="8" stroke-linejoin="round" paint-order="stroke fill">${tspans}</text>
    </g>
  `;
}

const KNOWN_BACKGROUNDS = new Set([
  'office', 'room', 'street', 'city', 'nature', 'park',
  'hospital', 'clinic', 'classroom', 'school', 'water', 'ocean', 'lake',
  'void', 'studio', 'bedroom_night', 'street_night', 'arcade', 'sleep_lab',
]);

/**
 * Render 1964 Vintage Newspaper & Polaroid Portrait Dossier Card for Randy Gardner (100% copyright-safe vector sketch).
 */
export function renderDossierCard(cx, cy, scale = 1) {
  const scalePart = scale === 1 ? '' : ` scale(${scale.toFixed(4)})`;
  return `
    <g id="info_card" transform="translate(${cx}, ${cy})${scalePart}" filter="url(#cardShadow)">
      <!-- Vintage 1964 Newspaper Clipping Backing -->
      <rect x="-240" y="-165" width="480" height="330" rx="16" fill="#f5efe2" stroke="${INK}" stroke-width="4"/>
      <rect x="-220" y="-148" width="440" height="34" rx="4" fill="${INK}"/>
      <text x="0" y="-125" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="#f5efe2" letter-spacing="3">SAN DIEGO SCIENCE ARCHIVE • 1964</text>

      <!-- Left Polaroid Portrait Frame with 1960s Student Sketch -->
      <g transform="translate(-115, 10) rotate(-3)">
        <rect x="-85" y="-105" width="170" height="200" rx="6" fill="#ffffff" stroke="${INK}" stroke-width="3"/>
        <rect x="-73" y="-93" width="146" height="142" fill="#e2e8f0" stroke="${INK}" stroke-width="2"/>
        <!-- Shoulders & 1960s Collar -->
        <path d="M -58 49 C -52 10 52 10 58 49 Z" fill="#334155" stroke="${INK}" stroke-width="3"/>
        <polygon points="-18,16 0,38 18,16 8,10 -8,10" fill="#ffffff" stroke="${INK}" stroke-width="2"/>
        <!-- Head & 1960s Parted Hair -->
        <circle cx="0" cy="-24" r="34" fill="#fbfaf8" stroke="${INK}" stroke-width="3.5"/>
        <path d="M -34 -30 C -34 -62 34 -62 34 -28 C 22 -44 -10 -46 -34 -30 Z" fill="${INK}"/>
        <!-- Determined teenage face -->
        <circle cx="-11" cy="-22" r="3.5" fill="${INK}"/>
        <circle cx="11" cy="-22" r="3.5" fill="${INK}"/>
        <path d="M -9 -6 Q 0 -2 9 -6" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
        <text x="0" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="${INK}" letter-spacing="1">RANDY GARDNER</text>
      </g>

      <!-- Right Dossier Facts -->
      <g transform="translate(85, -55)">
        <text x="-85" y="0" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="${RED}">SUBJECT #01</text>
        <line x1="-85" y1="10" x2="115" y2="10" stroke="${INK}" stroke-width="2"/>
        <text x="-85" y="42" font-family="Arial, sans-serif" font-weight="800" font-size="17" fill="${INK}">AGE: 17 YEARS OLD</text>
        <text x="-85" y="74" font-family="Arial, sans-serif" font-weight="800" font-size="17" fill="${INK}">CITY: SAN DIEGO, CA</text>
        <text x="-85" y="106" font-family="Arial, sans-serif" font-weight="800" font-size="17" fill="${INK}">GOAL: 264 HOURS</text>
        <rect x="-85" y="128" width="195" height="34" rx="6" fill="#fee2e2" stroke="${RED}" stroke-width="2.5"/>
        <text x="12" y="151" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="${RED}" letter-spacing="1">NO STIMULANTS</text>
      </g>
    </g>
  `;
}

/**
 * Determine background type and detail level based on scene metadata.
 */
function determineBackground(scene) {
  const bgField = String(scene.visual?.background || '').trim().toLowerCase();
  const type = KNOWN_BACKGROUNDS.has(bgField) ? bgField : 'office';

  let detail = 'high';
  if (type === 'void' || type === 'studio') {
    detail = 'low';
  }

  return { type, detail };
}

/**
 * Pose rig table (names match engine/vocab.py :: POSES).
 * Hand/elbow offsets are (dx, dy) relative to the shoulder, written for a hero facing right
 * (dir = 1); dx is multiplied by dir at render time. "l" = rear arm, "r" = front arm.
 * lean = torso lean (degrees, + toward facing side), tilt = extra head tilt (degrees).
 */
export const POSE_RIGS = {
  idle_neutral:      { lx: -35, ly: 150, lcx: -45, lcy: 90, rx: 35,  ry: 150, rcx: 45,  rcy: 90,  lean: 0,   tilt: 0 },
  thinking:          { lx: -10, ly: 120, lcx: -50, lcy: 80, rx: 16,  ry: -40, rcx: 60,  rcy: 70,  lean: 2,   tilt: 6 },
  idea_lightbulb:    { lx: -35, ly: 150, lcx: -45, lcy: 90, rx: 45,  ry: -150, rcx: 75, rcy: -30, lean: -2,  tilt: -4 },
  stressed_headache: { lx: -50, ly: -70, lcx: -85, lcy: 20, rx: 50,  ry: -70, rcx: 85,  rcy: 20,  lean: 6,   tilt: 8 },
  running_hurry:     { lx: -70, ly: 60,  lcx: -60, lcy: 10, rx: 80,  ry: 40,  rcx: 60,  rcy: 0,   lean: 12,  tilt: 4 },
  pointing_target:   { lx: -30, ly: 140, lcx: -45, lcy: 80, rx: 220, ry: 40,  rcx: 100, rcy: 30,  lean: 4,   tilt: 0 },
  shocked_fall:      { lx: -110, ly: -60, lcx: -80, lcy: 40, rx: 110, ry: -60, rcx: 80, rcy: 40,  lean: -10, tilt: -6 },
  celebrate_win:     { lx: -90, ly: -120, lcx: -70, lcy: 0, rx: 90,  ry: -120, rcx: 70, rcy: 0,   lean: -3,  tilt: 0 },
};

export function easeOutBack(x) {
  return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
}

function rigFor(scene) {
  return POSE_RIGS[scene?.visual?.stickman_pose] || POSE_RIGS.idle_neutral;
}

const POSE_BLEND_SEC = 0.35;

/**
 * Pose values for time t: lerped from prevScene's pose to the current pose over the first 0.35s.
 */
export function resolvePose(scene, prevScene, t) {
  const cur = rigFor(scene);
  const prev = prevScene ? rigFor(prevScene) : cur;
  const x = Math.min(1, Math.max(0, t / POSE_BLEND_SEC));
  const e = easeOutBack(x);
  const out = {};
  for (const k of Object.keys(cur)) out[k] = prev[k] + (cur[k] - prev[k]) * e;
  return out;
}

export const MOODS = ['neutral', 'eager', 'happy', 'flat', 'deadpan', 'sad'];

const FRAMING_ZOOM = { wide: 1.0, medium: 1.08, close_up: 1.35, close: 1.35 };

export function computeCameraTransform(camera, f, totalFrames, focusX, focusY, cardCx = null) {
  const cam = camera || {};
  const framing = cam.framing || 'wide';
  const move = cam.movement || 'static';
  let zoom = FRAMING_ZOOM[framing] ?? 1.0;

  const p = totalFrames > 1 ? f / (totalFrames - 1) : 0;
  const ease = p * p * (3 - 2 * p);

  let cx = W / 2;
  let cy = H / 2;
  if ((framing === 'close_up' || framing === 'close') && cardCx !== null) {
    zoom = 1.18;
    cx = (focusX + cardCx) / 2;
    cy = 0.6 * focusY + 0.4 * cy;
  } else if (framing === 'close_up' || framing === 'close') {
    cx = 0.85 * focusX + 0.15 * cx;
    cy = 0.85 * focusY + 0.15 * cy;
  }

  if (move === 'zoom_in') {
    zoom += 0.15 * ease;
  } else if (move === 'zoom_out') {
    zoom = Math.max(1.0, zoom + 0.15 - 0.15 * ease);
  } else if (move === 'pan_left' || move === 'pan_right') {
    zoom = Math.max(zoom, 1.10);
    const span = 0.03 * W;
    cx += move === 'pan_left' ? (span - 2 * span * ease) : (-span + 2 * span * ease);
  } else if (move === 'shake') {
    zoom = Math.max(zoom, 1.04);
    const amp = 10 * Math.exp(-f / 6);
    cx += amp * Math.sin(f * 2.3);
    cy += amp * 0.6 * Math.cos(f * 2.9);
  }

  const w = W / zoom;
  const h = H / zoom;
  const left = Math.min(Math.max(cx - w / 2, 0), W - w);
  const top = Math.min(Math.max(cy - h / 2, 0), H - h);
  if (zoom === 1 && left === 0 && top === 0) return '';
  return `translate(${(-left * zoom).toFixed(2)}, ${(-top * zoom).toFixed(2)}) scale(${zoom.toFixed(4)})`;
}

export function resolveMood(visual) {
  const m = visual?.mood;
  return MOODS.includes(m) ? m : 'neutral';
}

function renderFace(headX, headY, mood, blink, mouthOpen) {
  let eyeSVG = '';
  if (blink) {
    eyeSVG = `
      <line x1="${headX - 34}" y1="${headY - 6}" x2="${headX - 10}" y2="${headY - 6}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${headX + 10}" y1="${headY - 6}" x2="${headX + 34}" y2="${headY - 6}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
  } else if (mood === 'deadpan') {
    eyeSVG = `
      <line x1="${headX - 34}" y1="${headY - 6}" x2="${headX - 10}" y2="${headY - 6}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${headX - 22}" cy="${headY - 2}" r="4" fill="${INK}"/>
      <line x1="${headX + 10}" y1="${headY - 6}" x2="${headX + 34}" y2="${headY - 6}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${headX + 22}" cy="${headY - 2}" r="4" fill="${INK}"/>
      <line x1="${headX - 35}" y1="${headY - 24}" x2="${headX - 10}" y2="${headY - 24}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${headX + 10}" y1="${headY - 24}" x2="${headX + 35}" y2="${headY - 24}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
  } else if (mood === 'flat') {
    eyeSVG = `
      <circle cx="${headX - 22}" cy="${headY - 6}" r="13" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX - 22}" cy="${headY - 6}" r="5" fill="${INK}"/>
      <circle cx="${headX + 22}" cy="${headY - 6}" r="13" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX + 22}" cy="${headY - 6}" r="5" fill="${INK}"/>
      <line x1="${headX - 35}" y1="${headY - 25}" x2="${headX - 10}" y2="${headY - 25}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <line x1="${headX + 10}" y1="${headY - 25}" x2="${headX + 35}" y2="${headY - 25}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    `;
  } else if (mood === 'sad') {
    eyeSVG = `
      <circle cx="${headX - 22}" cy="${headY - 4}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX - 22}" cy="${headY - 1}" r="5" fill="${INK}"/>
      <circle cx="${headX + 22}" cy="${headY - 4}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX + 22}" cy="${headY - 1}" r="5" fill="${INK}"/>
      <line x1="${headX - 35}" y1="${headY - 20}" x2="${headX - 10}" y2="${headY - 28}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${headX + 10}" y1="${headY - 28}" x2="${headX + 35}" y2="${headY - 20}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
  } else if (mood === 'eager' || mood === 'happy') {
    const r = mood === 'eager' ? 16 : 15;
    eyeSVG = `
      <circle cx="${headX - 22}" cy="${headY - 6}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX - 18}" cy="${headY - 8}" r="6" fill="${INK}"/>
      <circle cx="${headX + 22}" cy="${headY - 6}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX + 26}" cy="${headY - 8}" r="6" fill="${INK}"/>
      <path d="M ${headX - 35} ${headY - 24} Q ${headX - 22} ${headY - 34} ${headX - 10} ${headY - 24}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M ${headX + 10} ${headY - 24} Q ${headX + 22} ${headY - 34} ${headX + 35} ${headY - 24}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
  } else {
    // neutral
    eyeSVG = `
      <circle cx="${headX - 22}" cy="${headY - 6}" r="15" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX - 18}" cy="${headY - 6}" r="6" fill="${INK}"/>
      <circle cx="${headX + 22}" cy="${headY - 6}" r="15" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${headX + 26}" cy="${headY - 6}" r="6" fill="${INK}"/>
      <line x1="${headX - 35}" y1="${headY - 26}" x2="${headX - 10}" y2="${headY - 26}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${headX + 10}" y1="${headY - 26}" x2="${headX + 35}" y2="${headY - 26}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
  }

  let mouthSVG = '';
  if (mouthOpen > 2) {
    mouthSVG = `<ellipse cx="${headX}" cy="${headY + 30}" rx="14" ry="${mouthOpen}" fill="${RED}" stroke="${INK}" stroke-width="4"/>`;
  } else if (mood === 'happy') {
    mouthSVG = `<path d="M ${headX - 22} ${headY + 22} Q ${headX} ${headY + 44} ${headX + 22} ${headY + 22}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  } else if (mood === 'eager') {
    mouthSVG = `<path d="M ${headX - 18} ${headY + 24} Q ${headX} ${headY + 38} ${headX + 18} ${headY + 24}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  } else if (mood === 'sad') {
    mouthSVG = `<path d="M ${headX - 18} ${headY + 34} Q ${headX} ${headY + 20} ${headX + 18} ${headY + 34}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  } else if (mood === 'flat' || mood === 'deadpan') {
    mouthSVG = `<line x1="${headX - 18}" y1="${headY + 28}" x2="${headX + 18}" y2="${headY + 28}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  } else {
    mouthSVG = `<line x1="${headX - 14}" y1="${headY + 28}" x2="${headX + 14}" y2="${headY + 28}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  }
  return { eyeSVG, mouthSVG };
}

/**
 * Render complete 1080p SVG frame for a given scene at frame f.
 */
export function renderSceneFrameSVG(scene, f, totalFrames, fps = 30, prevScene = null) {
  const t = f / fps;
  const duration = totalFrames / fps;
  const breath = Math.sin(t * 3.5) * 3;
  const blink = (t % 3.2 > 3.05 && t % 3.2 < 3.2);

  const { type: bgType, detail: bgDetail } = determineBackground(scene);

  // Character staging + slide-in on first scene or when position.x changes
  const pos = scene.visual?.position || { x: 0.25, y: 0.82 };
  const posX = pos.x !== undefined ? pos.x : (pos.anchor === "bottom_right" ? 1420 / W : 0.25);
  const targetHeroX = posX * W;
  const prevPosX = prevScene?.visual?.position?.x;
  let heroX = targetHeroX;
  if (!prevScene || (prevPosX !== undefined && Math.abs(prevPosX - posX) > 0.01)) {
    const startX = !prevScene ? (targetHeroX < W / 2 ? -120 : W + 120) : prevPosX * W;
    const sx = Math.min(1, Math.max(0, t / POSE_BLEND_SEC));
    const se = 1 - Math.pow(1 - sx, 3);
    heroX = startX + (targetHeroX - startX) * se;
  }

  const dir = targetHeroX < W / 2 ? 1 : -1;
  const hipY = 630 + breath * 0.3;
  const shoulderY = 410;
  const headRadius = 66;

  const props = Array.isArray(scene.visual?.props) ? scene.visual.props : [];

  // Mouth sync & talking head nod:
  // When "actor_mode" is in props, the stickman is acting out the story rather than lip-syncing the narrator.
  const rawNarration = String(scene.narration_text ?? '').trim();
  const isSilentBeat = !rawNarration || rawNarration === '...' || rawNarration === '[pause]' || rawNarration === '[silent]';
  const isActorMode = props.includes('actor_mode');
  const isTalking = !isSilentBeat && !isActorMode && t < duration - 0.25;
  const mouthOpen = isTalking ? Math.abs(Math.sin(t * 14)) * 14 : 0;
  const talkNod = isTalking ? Math.sin(t * 10) * 3.5 : 0;

  // Pose (interpolated) + idle sway: torso sways, head follows ~3 frames later
  const pose = resolvePose(scene, prevScene, t);
  const sway = (ff) => Math.sin((ff / fps) * 2.2) * 1.5;
  const tremor = props.includes('tremor') ? Math.sin(t * 42) * 3.5 : 0;
  const torsoLean = pose.lean + sway(f);
  const headLean = pose.lean + sway(f - 3) + pose.tilt;
  const rad = (d) => (d * Math.PI) / 180;
  const shoulderX = heroX + tremor + Math.sin(rad(torsoLean)) * (hipY - shoulderY) * dir;
  const headX = shoulderX + Math.sin(rad(headLean)) * (headRadius + 10) * dir;
  const headY = shoulderY - Math.cos(rad(headLean)) * (headRadius + 10) + breath * 0.6 + talkNod;

  const mood = resolveMood(scene.visual);
  const { eyeSVG, mouthSVG } = renderFace(headX, headY, mood, blink, mouthOpen);

  // Character condition overlays (dark circles, sweat drops, theta waves, blurred vision)
  let actorFxSVG = '';
  if (props.includes('dark_circles')) {
    actorFxSVG += `
      <path d="M ${headX - 35} ${headY + 9} Q ${headX - 22} ${headY + 19} ${headX - 9} ${headY + 9}" fill="none" stroke="#6b5b7b" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      <path d="M ${headX + 9} ${headY + 9} Q ${headX + 22} ${headY + 19} ${headX + 35} ${headY + 9}" fill="none" stroke="#6b5b7b" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
    `;
  }
  if (props.includes('sweat_drops') || scene.visual?.stickman_pose === 'stressed_headache') {
    const dropY = headY - 18 + ((t * 35) % 18);
    actorFxSVG += `
      <path d="M ${headX + 48 * dir} ${dropY} C ${headX + 42 * dir} ${dropY + 12} ${headX + 54 * dir} ${dropY + 12} ${headX + 48 * dir} ${dropY} Z" fill="#38bdf8" stroke="${INK}" stroke-width="2.5"/>
      <line x1="${headX - 55}" y1="${headY - 78}" x2="${headX - 42}" y2="${headY - 64}" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
      <line x1="${headX}" y1="${headY - 88}" x2="${headX}" y2="${headY - 72}" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
      <line x1="${headX + 55}" y1="${headY - 78}" x2="${headX + 42}" y2="${headY - 64}" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
    `;
  }
  if (props.includes('blur_vision')) {
    const blurShift = Math.sin(t * 7) * 9;
    actorFxSVG += `
      <circle cx="${headX + blurShift}" cy="${headY}" r="${headRadius + 6}" fill="none" stroke="${RED}" stroke-width="3" opacity="0.35" stroke-dasharray="10 6"/>
      <circle cx="${headX - blurShift}" cy="${headY}" r="${headRadius + 12}" fill="none" stroke="${BLUE}" stroke-width="3" opacity="0.3" stroke-dasharray="12 8"/>
    `;
  }
  if (props.includes('microsleep_wave')) {
    const waveShift = Math.sin(t * 5) * 12;
    actorFxSVG += `
      <g transform="translate(${headX}, ${headY - 98})">
        <path d="M -70 0 Q -35 ${-18 + waveShift} 0 0 T 70 0" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
        <text x="0" y="-22" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="${RED}" letter-spacing="2">THETA MICROSLEEP</text>
      </g>
    `;
  }

  // Arms and props interaction
  let armsSVG = "";
  let extraPropsSVG = "";
  let deskPropsSVG = "";

  // Check if scene has a side desk (placed BESIDE the character so it never cuts across the character's body)
  const isDeskScene = props.includes("desk_edge") || props.includes("desk_silhouette") || props.includes("phone_on_desk");
  const phoneOnDesk = props.includes("phone_on_desk");
  const phoneInHand = !phoneOnDesk && props.includes("phone_in_hand");

  if (isDeskScene) {
    const deskX = dir === 1 ? 70 : 1510;
    const deskW = 310;
    const mugX = deskX + 95;
    const mugY = DESK_TOP_Y;
    const steamY1 = mugY - 70 - ((t * 40) % 55);
    const deskPhoneX = deskX + 190;

    deskPropsSVG = `
      <!-- Side Desk Legs -->
      <line x1="${deskX + 25}" y1="${DESK_TOP_Y + 28}" x2="${deskX + 25}" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <line x1="${deskX + deskW - 25}" y1="${DESK_TOP_Y + 28}" x2="${deskX + deskW - 25}" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <!-- Side Desk Surface -->
      <rect x="${deskX}" y="${DESK_TOP_Y}" width="${deskW}" height="28" rx="8" fill="#dfd7ca" stroke="${INK}" stroke-width="6"/>

      <!-- Coffee Mug -->
      <ellipse cx="${mugX}" cy="${mugY + 2}" rx="28" ry="7" fill="#c4bdb2"/>
      <rect x="${mugX - 22}" y="${mugY - 44}" width="44" height="44" rx="7" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <path d="M ${mugX - 22} ${mugY - 34} C ${mugX - 38} ${mugY - 34} ${mugX - 38} ${mugY - 12} ${mugX - 22} ${mugY - 12}" fill="none" stroke="${INK}" stroke-width="4"/>
      <path d="M ${mugX} ${steamY1} Q ${mugX - 6} ${steamY1 - 12} ${mugX + 4} ${steamY1 - 24}" fill="none" stroke="${MUTED}" stroke-width="3" opacity="0.55"/>

      <!-- Phone on desk (Only when placed down!) -->
      ${phoneOnDesk ? `
        <ellipse cx="${deskPhoneX + 35}" cy="${DESK_TOP_Y + 2}" rx="42" ry="7" fill="#c4bdb2"/>
        <rect x="${deskPhoneX}" y="${DESK_TOP_Y - 9}" width="70" height="13" rx="4" fill="#202124" stroke="${INK}" stroke-width="3"/>
      ` : ''}
    `;
  }

  // ARMS from interpolated pose rig (offsets relative to shoulder, mirrored by dir)
  const armPath = (sign, hx, hy, cx, cy) => {
    const sx = shoulderX + sign * 22 * dir;
    return `<path d="M ${sx} ${shoulderY + 10} Q ${shoulderX + cx * dir} ${shoulderY + cy} ${shoulderX + hx * dir} ${shoulderY + hy}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  };
  const lHandX = shoulderX + pose.lx * dir;
  const lHandY = shoulderY + pose.ly;
  const rHandX = shoulderX + pose.rx * dir;
  const rHandY = shoulderY + pose.ry;
  armsSVG = `
      ${armPath(-1, pose.lx, pose.ly, pose.lcx, pose.lcy)}
      ${armPath(1, pose.rx, pose.ry, pose.rcx, pose.rcy)}
      <circle cx="${lHandX}" cy="${lHandY}" r="8" fill="${INK}"/>
      <circle cx="${rHandX}" cy="${rHandY}" r="8" fill="${INK}"/>
  `;

  if (phoneInHand) {
    // Phone held in the front hand
    const phoneGlow = props.includes("phone_glow") || props.includes("smartphone_glow");
    const screenColor = phoneGlow ? BLUE : '#333538';
    armsSVG += `
      <rect x="${rHandX - 22}" y="${rHandY - 39}" width="44" height="78" rx="8" fill="#18191c" stroke="${INK}" stroke-width="5"/>
      <rect x="${rHandX - 16}" y="${rHandY - 31}" width="32" height="60" rx="4" fill="${screenColor}"/>
      ${phoneGlow ? `<rect x="${rHandX - 14}" y="${rHandY + 8}" width="28" height="6" rx="2" fill="#ffffff" opacity="0.8"/>` : ''}
    `;
  }

  // Interactive Story Props held or acted out by Randy
  if (props.includes('act_coin_toss')) {
    const cycle = (t * 1.4) % 1;
    const coinY = rHandY - 30 - 240 * (4 * cycle * (1 - cycle));
    const coinRx = Math.max(4, Math.abs(Math.cos(t * 16)) * 22);
    armsSVG += `
      <ellipse cx="${rHandX + 18 * dir}" cy="${coinY}" rx="22" ry="${coinRx}" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
      <path d="M ${rHandX + 18 * dir} ${rHandY - 20} L ${rHandX + 18 * dir} ${coinY + 30}" stroke="${GOLD}" stroke-width="3" stroke-dasharray="6 6" opacity="0.7"/>
    `;
  }
  if (props.includes('act_football')) {
    // Randy holds an American football while wearing a Charger-gold helmet stripe in his delusion
    const fx = rHandX + 12 * dir;
    const fy = rHandY - 10;
    armsSVG += `
      <g transform="translate(${fx}, ${fy}) rotate(${-20 * dir})">
        <ellipse cx="0" cy="0" rx="38" ry="22" fill="#8b4513" stroke="${INK}" stroke-width="4"/>
        <line x1="-18" y1="0" x2="18" y2="0" stroke="#ffffff" stroke-width="3"/>
        <line x1="-10" y1="-6" x2="-10" y2="6" stroke="#ffffff" stroke-width="2.5"/>
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#ffffff" stroke-width="2.5"/>
        <line x1="10" y1="-6" x2="10" y2="6" stroke="#ffffff" stroke-width="2.5"/>
      </g>
    `;
  }
  if (props.includes('act_blind_touch')) {
    // Small testing table in front of Randy with mystery object + floating '?' above head
    const tx = shoulderX + 145 * dir;
    const ty = hipY + 25;
    armsSVG += `
      <rect x="${tx - 55}" y="${ty}" width="110" height="16" rx="4" fill="#dfd7ca" stroke="${INK}" stroke-width="4"/>
      <line x1="${tx - 38}" y1="${ty + 16}" x2="${tx - 38}" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="8"/>
      <line x1="${tx + 38}" y1="${ty + 16}" x2="${tx + 38}" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="8"/>
      <circle cx="${tx}" cy="${ty - 14}" r="14" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
      <text x="${headX + 55 * dir}" y="${headY - 75 - Math.sin(t * 6) * 8}" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="${RED}">?</text>
    `;
  }
  if (props.includes('act_serial_sevens')) {
    const nums = ['100', '93', '86', '79', '72', '65... ?'];
    const shown = nums[Math.min(nums.length - 1, Math.floor((t / Math.max(1, duration)) * nums.length))];
    actorFxSVG += `
      <g transform="translate(${headX}, ${headY - 115})">
        <rect x="-85" y="-34" width="170" height="52" rx="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
        <text x="0" y="2" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="30" fill="${RED}">${shown}</text>
      </g>
    `;
  }

  // STORYBOARD INFO CARD or 1964 DOSSIER CARD (pop-in with easeOutBack over 0.35s)
  const cardCx = posX <= 0.5 ? 0.72 * W : 0.28 * W;
  const cardCy = 480;
  const cardScale = Math.max(0.05, easeOutBack(Math.min(1, Math.max(0, t / POSE_BLEND_SEC))));
  if (props.includes('dossier_randy')) {
    extraPropsSVG = renderDossierCard(cardCx, cardCy, cardScale);
  } else {
    extraPropsSVG = renderCard(scene.visual?.card, cardCx, cardCy, scene.visual?.accent_color_focus, cardScale);
  }

  // Optional Day 4 Street-Sign Shadow Hallucination Figure
  if (props.includes('street_sign_shadow')) {
    const sx = posX <= 0.5 ? 1120 : 800;
    const pulse = 0.75 + Math.sin(t * 6) * 0.2;
    extraPropsSVG += `
      <g transform="translate(${sx}, ${FLOOR_Y})" opacity="${pulse.toFixed(2)}">
        <line x1="0" y1="0" x2="0" y2="-340" stroke="#0f172a" stroke-width="12"/>
        <path d="M -55 -210 Q 0 -310 55 -210 L 42 0 L -42 0 Z" fill="#0f172a"/>
        <circle cx="0" cy="-340" r="46" fill="#0f172a" stroke="${RED}" stroke-width="3"/>
        <circle cx="-14" cy="-344" r="6" fill="#fef08a"/>
        <circle cx="14" cy="-344" r="6" fill="#fef08a"/>
      </g>
    `;
  }

  // Optional 1960s Glaring TV Prop on Day 2
  if (props.includes('act_tv_glare')) {
    const tvX = posX <= 0.5 ? 920 : 1000;
    const glare = 0.22 + Math.abs(Math.sin(t * 12)) * 0.18;
    extraPropsSVG += `
      <g transform="translate(${tvX}, ${FLOOR_Y - 180})">
        <polygon points="0,45 ${-240 * dir},-55 ${-240 * dir},145" fill="#fef08a" opacity="${glare.toFixed(2)}"/>
        <rect x="-55" y="0" width="110" height="86" rx="10" fill="#78350f" stroke="${INK}" stroke-width="5"/>
        <rect x="-42" y="12" width="70" height="62" rx="6" fill="#fef08a" stroke="${INK}" stroke-width="3"/>
        <line x1="-15" y1="0" x2="-40" y2="-38" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <line x1="15" y1="0" x2="40" y2="-38" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <line x1="-35" y1="86" x2="-45" y2="180" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
        <line x1="35" y1="86" x2="45" y2="180" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      </g>
    `;
  }

  // Walking / stumbling leg animation when running_hurry or act_stumble_walk
  const isWalking = scene.visual?.stickman_pose === 'running_hurry' || props.includes('act_stumble_walk');
  const legStride = isWalking ? Math.sin(t * 10) * 38 : 0;
  const happyBounce = (scene.visual?.mood === 'happy' && scene.visual?.stickman_pose === 'celebrate_win')
    ? Math.abs(Math.sin(t * 8)) * 18
    : 0;
  // Camera transform (applied to world layers 1-4; header & caption remain fixed)
  const camTransform = computeCameraTransform(
    scene.visual?.camera,
    f,
    totalFrames,
    targetHeroX,
    680,
    scene.visual?.card ? cardCx : null
  );
  const camAttr = camTransform ? ` transform="${camTransform}"` : '';
  const charScaleTransform = `translate(${heroX}, ${FLOOR_Y - happyBounce}) scale(${CHAR_SCALE}) translate(${-heroX}, ${-FLOOR_Y})`;

  // Compose Full SVG
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#1e1c1a" flood-opacity="0.08"/>
      </filter>
    </defs>

    <g id="camera_rig"${camAttr}>
      <!-- 1. DYNAMIC FLEXIBLE BACKGROUND (Type: ${bgType}, Detail: ${bgDetail}) -->
      ${getBackgroundSVG(bgType, bgDetail, W, H, FLOOR_Y)}

      <!-- 2. DESK & PROPS (If in office/room) -->
      ${deskPropsSVG}

      <!-- 3. STICKMAN CHARACTER (harmonious 0.56 scale anchored at floor) -->
      <g id="stickman_character" transform="${charScaleTransform}">
        <!-- Ground Shadow -->
        <ellipse cx="${heroX}" cy="${FLOOR_Y + 4}" rx="68" ry="14" fill="#c4bdb2"/>

        <!-- Legs -->
        <path d="M ${heroX - 18} ${hipY} Q ${heroX - 35 + legStride * 0.5} ${hipY + 140} ${heroX - 45 + legStride} ${FLOOR_Y}" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M ${heroX + 18} ${hipY} Q ${heroX + 35 - legStride * 0.5} ${hipY + 140} ${heroX + 45 - legStride} ${FLOOR_Y}" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>

        <!-- Torso -->
        <path d="M ${heroX} ${hipY} Q ${(heroX + shoulderX) / 2 - 3} ${hipY - 110} ${shoulderX} ${shoulderY}" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/>

        <!-- Arms & Prop Interaction -->
        <g id="arms">${armsSVG}</g>

        <!-- Head & Expression -->
        <circle cx="${headX}" cy="${headY}" r="${headRadius}" fill="${WHITE}" stroke="${INK}" stroke-width="8"/>
        ${eyeSVG}
        ${mouthSVG}
        ${actorFxSVG}
      </g>

      <!-- 4. RIGHT SIDE INFO CARD / DIAGRAMS -->
      ${extraPropsSVG}
    </g>

    <!-- 5. TOP HEADER (from visual.header only) -->
    ${renderHeader(scene.visual?.header)}

    <!-- 6. BOTTOM CAPTION (from narration_text, max 2 lines) -->
    ${renderCaption(scene.narration_text)}
  </svg>
  `;
}
