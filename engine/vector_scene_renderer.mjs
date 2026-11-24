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
const DESK_TOP_Y = 660;

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
  if (!clean) return [];
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
  'void', 'studio',
]);

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

  // Mouth sync & talking head nod
  const isTalking = t < duration - 0.25;
  const mouthOpen = isTalking ? Math.abs(Math.sin(t * 14)) * 14 : 0;
  const talkNod = isTalking ? Math.sin(t * 10) * 3.5 : 0;

  // Pose (interpolated) + idle sway: torso sways, head follows ~3 frames later
  const pose = resolvePose(scene, prevScene, t);
  const sway = (ff) => Math.sin((ff / fps) * 2.2) * 1.5;
  const torsoLean = pose.lean + sway(f);
  const headLean = pose.lean + sway(f - 3) + pose.tilt;
  const rad = (d) => (d * Math.PI) / 180;
  const shoulderX = heroX + Math.sin(rad(torsoLean)) * (hipY - shoulderY) * dir;
  const headX = shoulderX + Math.sin(rad(headLean)) * (headRadius + 10) * dir;
  const headY = shoulderY - Math.cos(rad(headLean)) * (headRadius + 10) + breath * 0.6 + talkNod;

  const props = Array.isArray(scene.visual?.props) ? scene.visual.props : [];
  const mood = resolveMood(scene.visual);
  const { eyeSVG, mouthSVG } = renderFace(headX, headY, mood, blink, mouthOpen);

  // Arms and props interaction
  let armsSVG = "";
  let extraPropsSVG = "";
  let deskPropsSVG = "";

  // Check if scene is at desk and phone placement from visual.props
  const isDeskScene = bgType === "office" || bgType === "room" || props.includes("desk_edge") || props.includes("desk_silhouette") || props.includes("phone_on_desk");
  const phoneOnDesk = props.includes("phone_on_desk");
  const phoneInHand = !phoneOnDesk && props.includes("phone_in_hand");

  if (isDeskScene) {
    const mugX = 250;
    const mugY = DESK_TOP_Y;
    const steamY1 = mugY - 70 - ((t * 40) % 55);
    const deskPhoneX = 390;

    deskPropsSVG = `
      <!-- Desk Legs -->
      <line x1="160" y1="${DESK_TOP_Y + 28}" x2="160" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <line x1="780" y1="${DESK_TOP_Y + 28}" x2="780" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <!-- Desk Surface -->
      <rect x="120" y="${DESK_TOP_Y}" width="700" height="28" rx="8" fill="#dfd7ca" stroke="${INK}" stroke-width="6"/>

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

  // STORYBOARD INFO CARD (pop-in with easeOutBack over 0.35s)
  const cardCx = posX <= 0.5 ? 0.72 * W : 0.28 * W;
  const cardCy = 480;
  const cardScale = Math.max(0.05, easeOutBack(Math.min(1, Math.max(0, t / POSE_BLEND_SEC))));
  extraPropsSVG = renderCard(scene.visual?.card, cardCx, cardCy, scene.visual?.accent_color_focus, cardScale);

  // Camera transform (applied to world layers 1-4; header & caption remain fixed)
  const camTransform = computeCameraTransform(
    scene.visual?.camera,
    f,
    totalFrames,
    targetHeroX,
    440,
    scene.visual?.card ? cardCx : null
  );
  const camAttr = camTransform ? ` transform="${camTransform}"` : '';

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

      <!-- 3. STICKMAN CHARACTER -->
      <g id="stickman_character">
        <!-- Ground Shadow -->
        <ellipse cx="${heroX}" cy="${FLOOR_Y + 4}" rx="68" ry="14" fill="#c4bdb2"/>

        <!-- Legs -->
        <path d="M ${heroX - 18} ${hipY} Q ${heroX - 35} ${hipY + 140} ${heroX - 45} ${FLOOR_Y}" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M ${heroX + 18} ${hipY} Q ${heroX + 35} ${hipY + 140} ${heroX + 45} ${FLOOR_Y}" stroke="${INK}" stroke-width="12" fill="none" stroke-linecap="round"/>

        <!-- Torso -->
        <path d="M ${heroX} ${hipY} Q ${(heroX + shoulderX) / 2 - 3} ${hipY - 110} ${shoulderX} ${shoulderY}" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/>

        <!-- Arms & Prop Interaction -->
        <g id="arms">${armsSVG}</g>

        <!-- Head & Expression -->
        <circle cx="${headX}" cy="${headY}" r="${headRadius}" fill="${WHITE}" stroke="${INK}" stroke-width="8"/>
        ${eyeSVG}
        ${mouthSVG}
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
