// engine/vector_scene_renderer.mjs
// Stickman 2.0 1080p Scene Renderer
// Supports:
// - Sleek thin-line Stickman 2.0 with outfits, hair/hats, expressive faces & 2-segment limbs
// - Colorful 2D illustrated image backgrounds (assets/backgrounds/) + procedural fallback
// - Multi-layout staging (explainer_split, story_action, dialogue, closeup, custom_image)
// - Multi-character cast (visual.characters[]) + backward-compatible single hero

import { getBackgroundSVG, loadImageDataURI } from './backgrounds.mjs';
import { iconSVG as drawIconSVG } from './icons.mjs';
import {
  renderStickmanV2,
  POSE_RIGS_V2,
  MOODS_V2,
  OUTFITS,
  HAIRS,
  HAND_PROPS,
} from './character_renderer.mjs';

const INK = '#1e1c1a';
const RED = '#d7372c';
const GOLD = '#f4b400';
const BLUE = '#4285f4';
const MUTED = '#8c857b';

const W = 1920;
const H = 1080;
const FLOOR_Y = 900;
const DESK_TOP_Y = 740;
const CHAR_SCALE = 0.78;
const POSE_BLEND_SEC = 0.35;

export const POSE_RIGS = POSE_RIGS_V2;
export const MOODS = MOODS_V2;
export { OUTFITS, HAIRS, HAND_PROPS };

// Helper for XML/SVG escaping
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function easeOutBack(x) {
  return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
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
      <rect x="${-cardW / 2}" y="${-cardH / 2}" width="${cardW}" height="${cardH}" rx="22" fill="#ffffff" fill-opacity="0.95" stroke="${INK}" stroke-width="3.5"/>
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
    subSVG = `<text y="52" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${subSize}" fill="#ffffff" stroke="${INK}" stroke-width="4" paint-order="stroke fill" letter-spacing="2"${subAttr}>${esc(subtitle)}</text>`;
  }

  return `
    <g id="top_header" transform="translate(${W / 2}, 92)">
      <text text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="${titleSize}" fill="${INK}" stroke="#ffffff" stroke-width="8" stroke-linejoin="round" paint-order="stroke fill" letter-spacing="2"${titleAttr}>${esc(title)}</text>
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
  'office', 'cozy_office', 'room',
  'street', 'city', 'city_street',
  'nature', 'park', 'park_sunny',
  'cafe', 'cozy_cafe',
  'stage', 'stage_spotlight',
  'hospital', 'clinic', 'classroom', 'school', 'water', 'ocean', 'lake',
  'void', 'studio', 'bedroom_night', 'street_night', 'arcade', 'sleep_lab',
]);

function determineBackground(scene) {
  const raw = String(scene.visual?.background || '').trim();
  const lower = raw.toLowerCase();
  const isImagePath = /\.(png|jpe?g|webp)$/i.test(raw);
  const type = isImagePath ? raw : (KNOWN_BACKGROUNDS.has(lower) ? lower : 'office');
  let detail = 'high';
  if (type === 'void' || type === 'studio') {
    detail = 'low';
  }
  return { type, detail };
}

const FRAMING_ZOOM = { wide: 1.0, medium: 1.08, close_up: 1.35, close: 1.35 };

export function computeCameraTransform(camera, f, totalFrames, focusX, focusY, cardCx = null, layout = null) {
  const cam = camera || {};
  const framing = layout === 'closeup' ? 'close_up' : (cam.framing || 'wide');
  const move = cam.movement || 'static';
  let zoom = layout === 'closeup' ? 1.52 : (FRAMING_ZOOM[framing] ?? 1.0);

  const p = totalFrames > 1 ? f / (totalFrames - 1) : 0;
  const ease = p * p * (3 - 2 * p);

  let cx = W / 2;
  let cy = H / 2;
  if ((framing === 'close_up' || framing === 'close') && cardCx !== null && layout !== 'closeup') {
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

/**
 * Render speech bubble above a character when `speech` text is provided.
 */
function renderSpeechBubble(text, headX, headY, dir) {
  const clean = String(text ?? '').trim();
  if (!clean) return '';
  const bx = headX + 85 * dir;
  const by = headY - 125;
  const bw = Math.min(340, Math.max(140, clean.length * 16 + 44));
  const bh = 60;
  return `
    <g transform="translate(${bx}, ${by})" filter="url(#cardShadow)">
      <rect x="${-bw / 2}" y="${-bh / 2}" width="${bw}" height="${bh}" rx="20" fill="#ffffff" stroke="${INK}" stroke-width="3.5"/>
      <polygon points="${-14 * dir},${bh / 2 - 2} ${-28 * dir},${bh / 2 + 20} ${4 * dir},${bh / 2 - 2}" fill="#ffffff" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <text x="0" y="7" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="22" fill="${INK}">${esc(clean)}</text>
    </g>
  `;
}

/**
 * Render complete 1080p SVG frame for a given scene at frame f.
 */
export function renderSceneFrameSVG(scene, f, totalFrames, fps = 30, prevScene = null) {
  const t = f / fps;
  const duration = totalFrames / fps;
  const visual = scene.visual || {};
  const props = Array.isArray(visual.props) ? visual.props : [];
  const layout = visual.layout || (visual.custom_image ? 'custom_image' : (Array.isArray(visual.characters) && visual.characters.length > 1 ? 'dialogue' : (visual.card ? 'explainer_split' : 'story_action')));

  // --- Hybrid Mode: Full Custom AI-Illustrated Scene ---
  if (layout === 'custom_image' || visual.custom_image) {
    const imgUri = loadImageDataURI(visual.custom_image);
    const camTransform = computeCameraTransform(
      visual.camera || { framing: 'wide', movement: 'zoom_in' },
      f, totalFrames, W / 2, H / 2, null, 'custom_image'
    );
    const camAttr = camTransform ? ` transform="${camTransform}"` : '';
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <g id="camera_rig"${camAttr}>
        ${imgUri
          ? `<image href="${imgUri}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`
          : getBackgroundSVG('office', 'high', W, H, FLOOR_Y)}
      </g>
      ${renderHeader(visual.header)}
      ${renderCaption(scene.narration_text)}
    </svg>
    `;
  }

  const { type: bgType, detail: bgDetail } = determineBackground(scene);

  // Character staging + slide-in on first scene or when position.x changes
  const pos = visual.position || { x: layout === 'story_action' || layout === 'closeup' ? 0.5 : 0.25, y: 0.82 };
  const posX = pos.x !== undefined ? pos.x : (pos.anchor === 'bottom_right' ? 1420 / W : 0.25);
  const targetHeroX = posX * W;
  const prevPosX = prevScene?.visual?.position?.x;
  let heroX = targetHeroX;
  if (!prevScene || (prevPosX !== undefined && Math.abs(prevPosX - posX) > 0.01)) {
    const startX = !prevScene ? (targetHeroX < W / 2 ? -120 : W + 120) : prevPosX * W;
    const sx = Math.min(1, Math.max(0, t / POSE_BLEND_SEC));
    const se = 1 - Math.pow(1 - sx, 3);
    heroX = startX + (targetHeroX - startX) * se;
  }

  const dir = visual.facing === 'left' ? -1 : (visual.facing === 'right' ? 1 : (targetHeroX <= W / 2 ? 1 : -1));
  const rawNarration = String(scene.narration_text ?? '').trim();
  const isSilentBeat = !rawNarration || rawNarration === '...' || rawNarration === '[pause]' || rawNarration === '[silent]';
  const isActorMode = props.includes('actor_mode');
  const isTalking = !isSilentBeat && !isActorMode && t < duration - 0.25;

  // Side Desk Props (backward-compatible)
  let deskPropsSVG = '';
  const isDeskScene = props.includes('desk_edge') || props.includes('desk_silhouette') || props.includes('phone_on_desk');
  const phoneOnDesk = props.includes('phone_on_desk');
  const phoneInHand = !phoneOnDesk && props.includes('phone_in_hand');

  if (isDeskScene) {
    const deskX = dir === 1 ? 70 : 1510;
    const deskW = 310;
    const mugX = deskX + 95;
    const mugY = DESK_TOP_Y;
    const steamY1 = mugY - 70 - ((t * 40) % 55);
    const deskPhoneX = deskX + 190;

    deskPropsSVG = `
      <line x1="${deskX + 25}" y1="${DESK_TOP_Y + 28}" x2="${deskX + 25}" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <line x1="${deskX + deskW - 25}" y1="${DESK_TOP_Y + 28}" x2="${deskX + deskW - 25}" y2="${FLOOR_Y}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <rect x="${deskX}" y="${DESK_TOP_Y}" width="${deskW}" height="28" rx="8" fill="#dfd7ca" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="${mugX}" cy="${mugY + 2}" rx="28" ry="7" fill="#c4bdb2"/>
      <rect x="${mugX - 22}" y="${mugY - 44}" width="44" height="44" rx="7" fill="#ffffff" stroke="${INK}" stroke-width="3.5"/>
      <path d="M ${mugX - 22} ${mugY - 34} C ${mugX - 38} ${mugY - 34} ${mugX - 38} ${mugY - 12} ${mugX - 22} ${mugY - 12}" fill="none" stroke="${INK}" stroke-width="3.5"/>
      <path d="M ${mugX} ${steamY1} Q ${mugX - 6} ${steamY1 - 12} ${mugX + 4} ${steamY1 - 24}" fill="none" stroke="${MUTED}" stroke-width="3" opacity="0.55"/>
      ${phoneOnDesk ? `
        <ellipse cx="${deskPhoneX + 35}" cy="${DESK_TOP_Y + 2}" rx="42" ry="7" fill="#c4bdb2"/>
        <rect x="${deskPhoneX}" y="${DESK_TOP_Y - 9}" width="70" height="13" rx="4" fill="#202124" stroke="${INK}" stroke-width="3"/>
      ` : ''}
    `;
  }

  // Render Characters (Multi-character cast OR single hero)
  let charactersSVG = '';
  let focusX = targetHeroX;
  let focusY = 640;

  if (Array.isArray(visual.characters) && visual.characters.length > 0) {
    const count = visual.characters.length;
    visual.characters.forEach((ch, idx) => {
      const defaultX = count === 2 ? (idx === 0 ? 0.30 : 0.70) : (0.22 + (idx / Math.max(1, count - 1)) * 0.56);
      const cx = (ch.x !== undefined ? ch.x : defaultX) * W;
      const cDir = ch.dir !== undefined ? ch.dir : (cx <= W / 2 ? 1 : -1);
      const cScale = ch.scale || (layout === 'story_action' || layout === 'dialogue' ? 0.84 : CHAR_SCALE);
      const prevCh = prevScene?.visual?.characters?.[idx];
      const rendered = renderStickmanV2({
        id: idx === 0 ? 'stickman_character' : `stickman_character_${idx + 1}`,
        heroX: cx,
        floorY: FLOOR_Y,
        scale: cScale,
        dir: cDir,
        poseName: ch.pose || 'idle_neutral',
        prevPoseName: prevCh?.pose || null,
        mood: ch.mood || 'neutral',
        outfit: ch.outfit || 'casual',
        outfitColor: ch.outfit_color || null,
        hair: ch.hair || 'none',
        hairColor: ch.hair_color || '#2b241f',
        skinTone: ch.skin_tone || null,
        handProp: ch.hand_prop || 'none',
        props: ch.props || [],
        t, f, fps,
        isTalking: ch.talking !== undefined ? Boolean(ch.talking && isTalking) : (idx === 0 && isTalking),
      });
      charactersSVG += rendered.svg;
      if (ch.speech) {
        const sHeadX = cx + (rendered.headX - cx) * cScale;
        const sHeadY = FLOOR_Y - (FLOOR_Y - rendered.headY) * cScale;
        charactersSVG += renderSpeechBubble(ch.speech, sHeadX, sHeadY, cDir);
      }
      if (idx === 0) {
        focusX = count === 2 ? W / 2 : cx;
        focusY = layout === 'closeup' ? 460 : 610;
      }
    });
  } else {
    const handProp = visual.hand_prop || (phoneInHand ? 'phone' : 'none');
    const heroScale = layout === 'story_action' ? 0.84 : (layout === 'closeup' ? 0.88 : CHAR_SCALE);
    const rendered = renderStickmanV2({
      id: 'stickman_character',
      heroX,
      floorY: FLOOR_Y,
      scale: heroScale,
      dir,
      poseName: visual.stickman_pose || 'idle_neutral',
      prevPoseName: prevScene?.visual?.stickman_pose || null,
      mood: resolveMood(visual),
      outfit: visual.outfit || 'casual',
      outfitColor: visual.outfit_color || null,
      hair: visual.hair || 'none',
      hairColor: visual.hair_color || '#2b241f',
      skinTone: visual.skin_tone || null,
      handProp,
      props,
      t, f, fps,
      isTalking,
    });
    charactersSVG = rendered.svg;
    if (visual.speech) {
      const sHeadX = heroX + (rendered.headX - heroX) * heroScale;
      const sHeadY = FLOOR_Y - (FLOOR_Y - rendered.headY) * heroScale;
      charactersSVG += renderSpeechBubble(visual.speech, sHeadX, sHeadY, dir);
    }
    focusX = targetHeroX;
    focusY = layout === 'closeup' ? 430 : 620;
  }

  // Optional Info Card (only rendered when visual.card exists and layout isn't story_action/closeup/dialogue)
  const cardCx = posX <= 0.5 ? 0.72 * W : 0.28 * W;
  const cardCy = 480;
  const cardScale = Math.max(0.05, easeOutBack(Math.min(1, Math.max(0, t / POSE_BLEND_SEC))));
  const showCard = Boolean(visual.card) && layout !== 'closeup';
  const extraPropsSVG = showCard
    ? renderCard(visual.card, cardCx, cardCy, visual.accent_color_focus, cardScale)
    : '';

  const camTransform = computeCameraTransform(
    visual.camera,
    f,
    totalFrames,
    focusX,
    focusY,
    showCard ? cardCx : null,
    layout
  );
  const camAttr = camTransform ? ` transform="${camTransform}"` : '';

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#1e1c1a" flood-opacity="0.12"/>
      </filter>
    </defs>

    <g id="camera_rig"${camAttr}>
      <!-- 1. DYNAMIC FLEXIBLE BACKGROUND (Type: ${bgType}, Detail: ${bgDetail}) -->
      ${getBackgroundSVG(bgType, bgDetail, W, H, FLOOR_Y, {
        imagePath: visual.background_image || null,
        dimOpacity: layout === 'explainer_split' ? 0.10 : 0.04,
      })}

      <!-- 2. DESK & PROPS -->
      ${deskPropsSVG}

      <!-- 3. STICKMAN 2.0 CHARACTERS -->
      ${charactersSVG}

      <!-- 4. OPTIONAL INFO CARD -->
      ${extraPropsSVG}
    </g>

    <!-- 5. TOP HEADER (from visual.header only) -->
    ${renderHeader(visual.header)}

    <!-- 6. BOTTOM CAPTION (from narration_text, max 2 lines) -->
    ${renderCaption(scene.narration_text)}
  </svg>
  `;
}
