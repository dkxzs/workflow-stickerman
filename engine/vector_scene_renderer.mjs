// engine/vector_scene_renderer.mjs
// Meticulous 1080p SVG Vector Scene Renderer with Dynamic LOD Backgrounds & Expressive Stickman

import { getBackgroundSVG } from './backgrounds.mjs';

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
 * Render vector icon matching engine/icons.py (15 vocab.ICONS + generic fallback).
 */
export function renderIconSVG(name) {
  switch (name) {
    case 'lightbulb':
      return `
        <g>
          <circle cx="0" cy="-10" r="32" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
          <rect x="-13" y="20" width="26" height="20" rx="3" fill="${MUTED}" stroke="${INK}" stroke-width="3"/>
          <line x1="-35" y1="-30" x2="-47" y2="-37" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
          <line x1="-20" y1="-45" x2="-27" y2="-57" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
          <line x1="0" y1="-50" x2="0" y2="-64" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
          <line x1="20" y1="-45" x2="27" y2="-57" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
          <line x1="35" y1="-30" x2="47" y2="-37" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
        </g>`;
    case 'brain':
      return `
        <g>
          <ellipse cx="-25" cy="0" rx="27" ry="34" fill="#ffe6eb" stroke="${RED}" stroke-width="4"/>
          <ellipse cx="25" cy="0" rx="27" ry="34" fill="#ffe6eb" stroke="${RED}" stroke-width="4"/>
          <line x1="0" y1="-30" x2="0" y2="30" stroke="${RED}" stroke-width="3"/>
          <path d="M -38 -14 Q -26 -24 -14 -14" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
          <path d="M 14 -14 Q 26 -24 38 -14" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
          <path d="M -36 12 Q -24 24 -12 12" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
          <path d="M 12 12 Q 24 24 36 12" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
          <line x1="4" y1="34" x2="10" y2="50" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>
        </g>`;
    case 'clock':
      return `
        <g>
          <circle cx="0" cy="0" r="46" fill="${WHITE}" stroke="${INK}" stroke-width="6"/>
          <line x1="0" y1="-36" x2="0" y2="-43" stroke="${INK}" stroke-width="3"/>
          <line x1="36" y1="0" x2="43" y2="0" stroke="${INK}" stroke-width="3"/>
          <line x1="0" y1="36" x2="0" y2="43" stroke="${INK}" stroke-width="3"/>
          <line x1="-36" y1="0" x2="-43" y2="0" stroke="${INK}" stroke-width="3"/>
          <line x1="0" y1="0" x2="11" y2="-19" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
          <line x1="0" y1="0" x2="28" y2="14" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="5" fill="${INK}"/>
        </g>`;
    case 'bell_off':
      return `
        <g>
          <path d="M -40 -12 A 40 40 0 0 1 40 -12 L 48 30 L -48 30 Z" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
          <line x1="-52" y1="30" x2="52" y2="30" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
          <circle cx="0" cy="38" r="9" fill="${INK}"/>
          <line x1="-56" y1="-50" x2="56" y2="50" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>
        </g>`;
    case 'lock':
      return `
        <g>
          <path d="M -24 -8 L -24 -34 A 24 28 0 0 1 24 -34 L 24 -8" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
          <rect x="-40" y="-12" width="80" height="56" rx="10" fill="${INK}"/>
          <circle cx="0" cy="13" r="7" fill="${WHITE}"/>
          <polygon points="-5,16 5,16 8,34 -8,34" fill="${WHITE}"/>
        </g>`;
    case 'phone':
      return `
        <g>
          <rect x="-30" y="-52" width="60" height="104" rx="12" fill="${INK}"/>
          <rect x="-25" y="-44" width="50" height="80" rx="8" fill="#f8fafc"/>
          <circle cx="0" cy="-11" r="13" fill="${BLUE}"/>
          <circle cx="0" cy="45" r="4" fill="${WHITE}"/>
        </g>`;
    case 'mail_empty':
      return `
        <g>
          <rect x="-52" y="-34" width="104" height="68" fill="${WHITE}" stroke="${MUTED}" stroke-width="6"/>
          <polyline points="-52,-34 0,6 52,-34" fill="none" stroke="${MUTED}" stroke-width="6" stroke-linejoin="round"/>
        </g>`;
    case 'check':
      return `
        <g>
          <circle cx="0" cy="0" r="46" fill="${TEAL}"/>
          <polyline points="-20,2 -6,18 24,-16" fill="none" stroke="${WHITE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`;
    case 'cross':
      return `
        <g>
          <circle cx="0" cy="0" r="46" fill="${RED}"/>
          <line x1="-18" y1="-18" x2="18" y2="18" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
          <line x1="18" y1="-18" x2="-18" y2="18" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
        </g>`;
    case 'question':
      return `
        <g>
          <circle cx="0" cy="0" r="46" fill="${BLUE}"/>
          <text x="0" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="62" fill="${WHITE}">?</text>
        </g>`;
    case 'warning':
      return `
        <g>
          <polygon points="0,-50 -54,42 54,42" fill="${GOLD}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
          <line x1="0" y1="-14" x2="0" y2="10" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
          <circle cx="0" cy="23" r="5" fill="${INK}"/>
        </g>`;
    case 'chart_up':
      return `
        <g>
          <line x1="-52" y1="44" x2="54" y2="44" stroke="${MUTED}" stroke-width="5" stroke-linecap="round"/>
          <rect x="-47" y="24" width="22" height="20" fill="${TEAL}"/>
          <rect x="-11" y="8" width="22" height="36" fill="${TEAL}"/>
          <rect x="25" y="-10" width="22" height="54" fill="${TEAL}"/>
          <polyline points="-44,-22 -6,-34 12,-30 46,-58" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <polygon points="46,-58 26,-56 44,-38" fill="${INK}"/>
        </g>`;
    case 'chart_down':
      return `
        <g>
          <line x1="-52" y1="44" x2="54" y2="44" stroke="${MUTED}" stroke-width="5" stroke-linecap="round"/>
          <rect x="-47" y="-10" width="22" height="54" fill="${RED}"/>
          <rect x="-11" y="8" width="22" height="36" fill="${RED}"/>
          <rect x="25" y="24" width="22" height="20" fill="${RED}"/>
          <polyline points="-44,-58 -6,-32 12,-44 46,-18" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <polygon points="46,-18 26,-20 42,-38" fill="${INK}"/>
        </g>`;
    case 'coin':
      return `
        <g>
          <circle cx="0" cy="0" r="44" fill="${GOLD}" stroke="${INK}" stroke-width="5"/>
          <circle cx="0" cy="0" r="32" fill="none" stroke="#c88c00" stroke-width="3"/>
          <text x="0" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="50" fill="${INK}">$</text>
        </g>`;
    case 'heart':
      return `
        <g>
          <circle cx="-23" cy="-15" r="25" fill="${RED}"/>
          <circle cx="23" cy="-15" r="25" fill="${RED}"/>
          <polygon points="-46,-4 46,-4 0,50" fill="${RED}"/>
        </g>`;
    default:
      return `
        <g>
          <circle cx="0" cy="0" r="40" fill="#ebf2ff" stroke="${BLUE}" stroke-width="4"/>
          <line x1="0" y1="-20" x2="0" y2="4" stroke="${BLUE}" stroke-width="9" stroke-linecap="round"/>
          <circle cx="0" cy="17" r="5" fill="${BLUE}"/>
        </g>`;
  }
}

/**
 * Render storyboard info card at (cx, cy). Returns empty string when card is absent.
 */
export function renderCard(card, cx, cy, accent) {
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

  const iconSVG = icon ? `<g transform="translate(0, -42)">${renderIconSVG(icon)}</g>` : '';
  const titleY = icon ? 58 : 4;
  const subY = icon ? 92 : 42;

  return `
    <g id="info_card" transform="translate(${cx}, ${cy})" filter="url(#cardShadow)">
      <rect x="${-cardW / 2}" y="${-cardH / 2}" width="${cardW}" height="${cardH}" rx="22" fill="#ffffff" stroke="#d2cdc6" stroke-width="3"/>
      ${iconSVG}
      ${rawTitle ? `<text x="0" y="${titleY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="${titleSize}" fill="${titleColor}" letter-spacing="1"${titleAttr}>${esc(rawTitle)}</text>` : ''}
      ${rawSub ? `<text x="0" y="${subY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${subSize}" fill="${MUTED}" letter-spacing="2"${subAttr}>${esc(rawSub)}</text>` : ''}
    </g>
  `;
}

/**
 * Determine background type and detail level based on scene metadata.
 */
function determineBackground(scene) {
  const desc = (scene.visual?.description || "").toLowerCase();
  const props = (scene.visual?.props || []).join(" ").toLowerCase();
  const bgField = (scene.visual?.background || "").toLowerCase();

  // Background environment type
  let type = "office";
  if (desc.includes("hospital") || desc.includes("clinic") || desc.includes("doctor")) {
    type = "hospital";
  } else if (desc.includes("street") || desc.includes("city") || desc.includes("outside") || desc.includes("road")) {
    type = "street";
  } else if (desc.includes("park") || desc.includes("tree") || desc.includes("nature") || desc.includes("hill")) {
    type = "nature";
  } else if (desc.includes("school") || desc.includes("class") || desc.includes("blackboard") || desc.includes("lecture")) {
    type = "classroom";
  } else if (desc.includes("water") || desc.includes("ocean") || desc.includes("sea") || desc.includes("lake") || desc.includes("swim")) {
    type = "water";
  } else if (desc.includes("brain") || desc.includes("void") || desc.includes("abstract") || desc.includes("metaphor") || bgField.includes("void")) {
    type = "void";
  } else {
    type = "office";
  }

  // Level of detail: User rule: "những chỗ nào cần chi tiết thì phải chi tiết vào, những chỗ nào cần ít thì vẽ ít lại"
  // High detail for hero physical scenes (office desk, detailed street, hospital)
  // Low detail for quick metaphorical cuts, abstract diagrams, fast comparisons
  let detail = "high";
  if (type === "void") {
    detail = "low";
  } else if (desc.includes("brain") || desc.includes("diagram") || desc.includes("metaphor") || desc.includes("simple")) {
    detail = "low";
  } else if (scene.actual_duration_sec && scene.actual_duration_sec < 2.2 && !desc.includes("desk")) {
    detail = "low"; // Fast transitional cuts keep background clean to focus on action
  } else {
    detail = "high"; // Hero scenes get rich architectural depth
  }

  return { type, detail };
}

/**
 * Render complete 1080p SVG frame for a given scene at frame f.
 */
export function renderSceneFrameSVG(scene, f, totalFrames, fps = 30) {
  const t = f / fps;
  const duration = totalFrames / fps;
  const progress = totalFrames > 1 ? f / (totalFrames - 1) : 0;
  const breath = Math.sin(t * 3.5) * 3;
  const blink = (t % 3.2 > 3.05 && t % 3.2 < 3.2);

  const { type: bgType, detail: bgDetail } = determineBackground(scene);

  // Character staging
  const pos = scene.visual?.position || { x: 0.25, y: 0.82 };
  const posX = pos.x !== undefined ? pos.x : (pos.anchor === "bottom_right" ? 1420 / W : 0.25);
  const heroX = posX * W;
  const dir = heroX < W / 2 ? 1 : -1;
  const hipY = 630 + breath * 0.3;
  const shoulderX = heroX;
  const shoulderY = 410;
  const headRadius = 66;
  const headY = shoulderY - headRadius - 10 + breath * 0.6;

  // Mouth sync
  const isTalking = t < duration - 0.25;
  const mouthOpen = isTalking ? Math.abs(Math.sin(t * 14)) * 14 : 0;

  // Pose interpretation
  const poseName = scene.visual?.stickman_pose || "idle_neutral";
  const actionName = scene.visual?.action || "";
  const desc = (scene.visual?.description || "").toLowerCase();

  // Face & Expression logic
  const expr = (scene.visual?.expression || "neutral").toLowerCase();
  let eyeSVG = "";
  let mouthSVG = "";

  if (expr.includes("deadpan") || expr.includes("disbelief")) {
    // Deadpan horizontal slit eyes, flat line mouth
    eyeSVG = `
      <circle cx="${shoulderX - 22}" cy="${headY - 6}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX - 22}" cy="${headY - 6}" r="5" fill="${INK}"/>
      <circle cx="${shoulderX + 22}" cy="${headY - 6}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX + 22}" cy="${headY - 6}" r="5" fill="${INK}"/>
      <line x1="${shoulderX - 35}" y1="${headY - 26}" x2="${shoulderX - 10}" y2="${headY - 26}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${shoulderX + 10}" y1="${headY - 26}" x2="${shoulderX + 35}" y2="${headY - 26}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
    mouthSVG = `<line x1="${shoulderX - 18}" y1="${headY + 28}" x2="${shoulderX + 18}" y2="${headY + 28}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  } else if (expr.includes("sarcastic") || expr.includes("smirk")) {
    // Sarcastic half-lidded eyes with asymmetric smirk
    eyeSVG = `
      <circle cx="${shoulderX - 22}" cy="${headY - 6}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX - 19}" cy="${headY - 6}" r="5" fill="${INK}"/>
      <circle cx="${shoulderX + 22}" cy="${headY - 6}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX + 25}" cy="${headY - 6}" r="5" fill="${INK}"/>
      <line x1="${shoulderX - 35}" y1="${headY - 26}" x2="${shoulderX - 10}" y2="${headY - 28}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${shoulderX + 10}" y1="${headY - 30}" x2="${shoulderX + 35}" y2="${headY - 24}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
    mouthSVG = `<path d="M ${shoulderX - 12} ${headY + 30} Q ${shoulderX + 8} ${headY + 44} ${shoulderX + 26} ${headY + 22}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  } else if (expr.includes("thinking") || expr.includes("puzzled") || poseName.includes("chin_on_hand")) {
    // Squinting thoughtful eyes looking upward
    eyeSVG = `
      <circle cx="${shoulderX - 22}" cy="${headY - 6}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX - 20}" cy="${headY - 10}" r="5" fill="${INK}"/>
      <circle cx="${shoulderX + 22}" cy="${headY - 6}" r="14" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX + 24}" cy="${headY - 10}" r="5" fill="${INK}"/>
      <line x1="${shoulderX - 35}" y1="${headY - 24}" x2="${shoulderX - 10}" y2="${headY - 28}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${shoulderX + 10}" y1="${headY - 28}" x2="${shoulderX + 35}" y2="${headY - 24}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;
    mouthSVG = `<path d="M ${shoulderX - 10} ${headY + 30} Q ${shoulderX + 10} ${headY + 32} ${shoulderX + 20} ${headY + 26}" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else {
    // Standard attentive animated face with blink & talking mouth
    eyeSVG = blink ? `
      <line x1="${shoulderX - 34}" y1="${headY - 6}" x2="${shoulderX - 10}" y2="${headY - 6}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${shoulderX + 10}" y1="${headY - 6}" x2="${shoulderX + 34}" y2="${headY - 6}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    ` : `
      <circle cx="${shoulderX - 22}" cy="${headY - 6}" r="15" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX - 18}" cy="${headY - 6}" r="6" fill="${INK}"/>
      <circle cx="${shoulderX + 22}" cy="${headY - 6}" r="15" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <circle cx="${shoulderX + 26}" cy="${headY - 6}" r="6" fill="${INK}"/>
      <line x1="${shoulderX - 35}" y1="${headY - 26}" x2="${shoulderX - 10}" y2="${headY - 26}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="${shoulderX + 10}" y1="${headY - 26}" x2="${shoulderX + 35}" y2="${headY - 26}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    `;

    mouthSVG = mouthOpen > 2 ? `
      <ellipse cx="${shoulderX}" cy="${headY + 30}" rx="14" ry="${mouthOpen}" fill="${RED}" stroke="${INK}" stroke-width="4"/>
    ` : `
      <ellipse cx="${shoulderX}" cy="${headY + 30}" rx="10" ry="5" fill="${INK}"/>
    `;
  }

  // Arms and props interaction
  let armsSVG = "";
  let extraPropsSVG = "";
  let deskPropsSVG = "";

  // Check if scene is at desk
  const isDeskScene = bgType === "office" || desc.includes("desk") || desc.includes("phone");
  const phoneOnDesk = desc.includes("put it down") || desc.includes("resting on desk") || desc.includes("12 seconds later");
  const phoneInHand = !phoneOnDesk && (desc.includes("phone") || desc.includes("unlock") || desc.includes("notif"));

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

  // ARM POSES
  if (actionName.includes("chin_scratch") || poseName.includes("thinking") || poseName.includes("chin_on_hand")) {
    // Thoughtful pose: Lead arm bent with hand cupping chin, Rear arm crossing chest
    armsSVG = `
      <path d="M ${shoulderX - 22 * dir} ${shoulderY + 10} Q ${heroX - 50 * dir} ${shoulderY + 80} ${heroX - 10 * dir} ${shoulderY + 120}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M ${shoulderX + 22 * dir} ${shoulderY + 10} Q ${heroX + 60 * dir} ${shoulderY + 70} ${heroX + 16 * dir} ${headY + 36}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <circle cx="${heroX + 16 * dir}" cy="${headY + 36}" r="8" fill="${INK}"/>
    `;
  } else if (actionName.includes("slow_clap") || poseName.includes("celebrate_win")) {
    // Sarcastic slow clapping: Hands meeting together in front of chest
    const clapCycle = Math.sin(t * 8) * 12;
    armsSVG = `
      <path d="M ${shoulderX - 22 * dir} ${shoulderY + 10} Q ${heroX - 40 * dir} ${shoulderY + 70} ${heroX + (-8 + clapCycle) * dir} ${shoulderY + 100}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M ${shoulderX + 22 * dir} ${shoulderY + 10} Q ${heroX + 40 * dir} ${shoulderY + 70} ${heroX + (8 - clapCycle) * dir} ${shoulderY + 100}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <circle cx="${heroX + (-8 + clapCycle) * dir}" cy="${shoulderY + 100}" r="8" fill="${INK}"/>
      <circle cx="${heroX + (8 - clapCycle) * dir}" cy="${shoulderY + 100}" r="8" fill="${INK}"/>
    `;
  } else if (actionName.includes("point") || poseName.includes("pointing")) {
    // Pointing toward diagram or card
    armsSVG = `
      <path d="M ${shoulderX - 22 * dir} ${shoulderY + 10} Q ${heroX - 45 * dir} ${shoulderY + 80} ${heroX - 30 * dir} ${shoulderY + 140}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M ${shoulderX + 22 * dir} ${shoulderY + 10} Q ${heroX + 100 * dir} ${shoulderY + 30} ${heroX + 220 * dir} ${shoulderY + 40}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <circle cx="${heroX + 225 * dir}" cy="${shoulderY + 40}" r="8" fill="${INK}"/>
    `;
  } else if (phoneInHand) {
    // Standard phone check
    const phoneX = heroX;
    const phoneY = shoulderY + 130;
    const phoneGlow = !desc.includes("void") && !desc.includes("deadpan");
    const screenColor = phoneGlow ? BLUE : '#333538';

    armsSVG = `
      <path d="M ${shoulderX - 22 * dir} ${shoulderY + 10} Q ${heroX - 55 * dir} ${shoulderY + 80} ${phoneX - 18 * dir} ${phoneY + 25}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M ${shoulderX + 22 * dir} ${shoulderY + 10} Q ${heroX + 55 * dir} ${shoulderY + 80} ${phoneX + 18 * dir} ${phoneY + 25}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <rect x="${phoneX - 22}" y="${phoneY - 15}" width="44" height="78" rx="8" fill="#18191c" stroke="${INK}" stroke-width="5"/>
      <rect x="${phoneX - 16}" y="${phoneY - 7}" width="32" height="60" rx="4" fill="${screenColor}"/>
      ${phoneGlow ? `<rect x="${phoneX - 14}" y="${phoneY + 32}" width="28" height="6" rx="2" fill="#ffffff" opacity="0.8"/>` : ''}
    `;
  } else {
    // Hands resting naturally
    armsSVG = `
      <path d="M ${shoulderX - 22 * dir} ${shoulderY + 10} Q ${heroX - 45 * dir} ${shoulderY + 90} ${heroX - 35 * dir} ${shoulderY + 150}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M ${shoulderX + 22 * dir} ${shoulderY + 10} Q ${heroX + 45 * dir} ${shoulderY + 90} ${heroX + 35 * dir} ${shoulderY + 150}" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
    `;
  }

  // STORYBOARD INFO CARD
  const cardCx = posX <= 0.5 ? 0.72 * W : 0.28 * W;
  const cardCy = 480;
  extraPropsSVG = renderCard(scene.visual?.card, cardCx, cardCy, scene.visual?.accent_color_focus);

  // Compose Full SVG
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#1e1c1a" flood-opacity="0.08"/>
      </filter>
    </defs>

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
      <path d="M ${heroX} ${hipY} Q ${heroX - 3} ${hipY - 110} ${shoulderX} ${shoulderY}" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/>

      <!-- Arms & Prop Interaction -->
      ${armsSVG}

      <!-- Head & Expression -->
      <circle cx="${shoulderX}" cy="${headY}" r="${headRadius}" fill="${WHITE}" stroke="${INK}" stroke-width="8"/>
      ${eyeSVG}
      ${mouthSVG}
    </g>

    <!-- 4. RIGHT SIDE INFO CARD / DIAGRAMS -->
    ${extraPropsSVG}

    <!-- 5. TOP HEADLINE (Subtle subtitle) -->
    <g transform="translate(${W / 2}, 110)">
      <text text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="${INK}" letter-spacing="2">
        ${esc((scene.narration_text || "").toUpperCase())}
      </text>
      ${getWavyLine(0, 16, Math.min(650, (scene.narration_text || "").length * 18))}
    </g>
  </svg>
  `;
}
