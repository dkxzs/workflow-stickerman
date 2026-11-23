// engine/icons.mjs
// Flat vector SVG icons ported from engine/icons.py (matches engine/vocab.py :: ICONS).

const INK = '#1e1c1a';
const WHITE = '#fbfaf8';
const RED = '#d7372c';
const GOLD = '#f4b400';
const BLUE = '#4285f4';
const TEAL = '#2a9d8f';
const MUTED = '#8a857e';
const PINK = '#ffe6eb';
const SCREEN = '#f8fafc';

export const ICON_NAMES = [
  'lightbulb', 'brain', 'clock', 'bell_off', 'lock', 'phone', 'mail_empty',
  'check', 'cross', 'question', 'warning', 'chart_up', 'chart_down',
  'coin', 'heart',
];

const ICON_BODIES = {
  lightbulb: () => `
    <circle cx="0" cy="-10" r="32" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
    <rect x="-13" y="20" width="26" height="20" rx="3" fill="${MUTED}" stroke="${INK}" stroke-width="3"/>
    <line x1="-35" y1="-30" x2="-47" y2="-37" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
    <line x1="-20" y1="-45" x2="-27" y2="-57" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
    <line x1="0" y1="-50" x2="0" y2="-64" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
    <line x1="20" y1="-45" x2="27" y2="-57" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
    <line x1="35" y1="-30" x2="47" y2="-37" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>`,

  brain: () => `
    <ellipse cx="-25" cy="0" rx="27" ry="34" fill="${PINK}" stroke="${RED}" stroke-width="4"/>
    <ellipse cx="25" cy="0" rx="27" ry="34" fill="${PINK}" stroke="${RED}" stroke-width="4"/>
    <line x1="0" y1="-30" x2="0" y2="30" stroke="${RED}" stroke-width="3"/>
    <path d="M -38 -14 Q -26 -24 -14 -14" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
    <path d="M 14 -14 Q 26 -24 38 -14" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
    <path d="M -36 12 Q -24 24 -12 12" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
    <path d="M 12 12 Q 24 24 36 12" fill="none" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
    <line x1="4" y1="34" x2="10" y2="50" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>`,

  clock: () => `
    <circle cx="0" cy="0" r="46" fill="${WHITE}" stroke="${INK}" stroke-width="6"/>
    <line x1="0" y1="-36" x2="0" y2="-43" stroke="${INK}" stroke-width="3"/>
    <line x1="36" y1="0" x2="43" y2="0" stroke="${INK}" stroke-width="3"/>
    <line x1="0" y1="36" x2="0" y2="43" stroke="${INK}" stroke-width="3"/>
    <line x1="-36" y1="0" x2="-43" y2="0" stroke="${INK}" stroke-width="3"/>
    <line x1="0" y1="0" x2="11" y2="-19" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="28" y2="14" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="5" fill="${INK}"/>`,

  bell_off: () => `
    <path d="M -40 -12 A 40 40 0 0 1 40 -12 L 48 30 L -48 30 Z" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <line x1="-52" y1="30" x2="52" y2="30" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="0" cy="38" r="9" fill="${INK}"/>
    <line x1="-56" y1="-50" x2="56" y2="50" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>`,

  lock: () => `
    <path d="M -24 -8 L -24 -34 A 24 28 0 0 1 24 -34 L 24 -8" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <rect x="-40" y="-12" width="80" height="56" rx="10" fill="${INK}"/>
    <circle cx="0" cy="13" r="7" fill="${WHITE}"/>
    <polygon points="-5,16 5,16 8,34 -8,34" fill="${WHITE}"/>`,

  phone: () => `
    <rect x="-30" y="-52" width="60" height="104" rx="12" fill="${INK}"/>
    <rect x="-25" y="-44" width="50" height="80" rx="8" fill="${SCREEN}"/>
    <circle cx="0" cy="-11" r="13" fill="${BLUE}"/>
    <circle cx="0" cy="45" r="4" fill="${WHITE}"/>`,

  mail_empty: () => `
    <rect x="-52" y="-34" width="104" height="68" fill="${WHITE}" stroke="${MUTED}" stroke-width="6"/>
    <polyline points="-52,-34 0,6 52,-34" fill="none" stroke="${MUTED}" stroke-width="6" stroke-linejoin="round"/>`,

  check: () => `
    <circle cx="0" cy="0" r="46" fill="${TEAL}"/>
    <polyline points="-20,2 -6,18 24,-16" fill="none" stroke="${WHITE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,

  cross: () => `
    <circle cx="0" cy="0" r="46" fill="${RED}"/>
    <line x1="-18" y1="-18" x2="18" y2="18" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
    <line x1="18" y1="-18" x2="-18" y2="18" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>`,

  question: () => `
    <circle cx="0" cy="0" r="46" fill="${BLUE}"/>
    <text x="0" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="62" fill="${WHITE}">?</text>`,

  warning: () => `
    <polygon points="0,-50 -54,42 54,42" fill="${GOLD}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <line x1="0" y1="-14" x2="0" y2="10" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="0" cy="23" r="5" fill="${INK}"/>`,

  chart_up: () => `
    <line x1="-52" y1="44" x2="54" y2="44" stroke="${MUTED}" stroke-width="5" stroke-linecap="round"/>
    <rect x="-47" y="24" width="22" height="20" fill="${TEAL}"/>
    <rect x="-11" y="8" width="22" height="36" fill="${TEAL}"/>
    <rect x="25" y="-10" width="22" height="54" fill="${TEAL}"/>
    <polyline points="-44,-22 -6,-34 12,-30 46,-58" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="46,-58 26,-56 44,-38" fill="${INK}"/>`,

  chart_down: () => `
    <line x1="-52" y1="44" x2="54" y2="44" stroke="${MUTED}" stroke-width="5" stroke-linecap="round"/>
    <rect x="-47" y="-10" width="22" height="54" fill="${RED}"/>
    <rect x="-11" y="8" width="22" height="36" fill="${RED}"/>
    <rect x="25" y="24" width="22" height="20" fill="${RED}"/>
    <polyline points="-44,-58 -6,-32 12,-44 46,-18" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="46,-18 26,-20 42,-38" fill="${INK}"/>`,

  coin: () => `
    <circle cx="0" cy="0" r="44" fill="${GOLD}" stroke="${INK}" stroke-width="5"/>
    <circle cx="0" cy="0" r="32" fill="none" stroke="#c88c00" stroke-width="3"/>
    <text x="0" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="50" fill="${INK}">$</text>`,

  heart: () => `
    <circle cx="-23" cy="-15" r="25" fill="${RED}"/>
    <circle cx="23" cy="-15" r="25" fill="${RED}"/>
    <polygon points="-46,-4 46,-4 0,50" fill="${RED}"/>`,
};

function genericIcon() {
  return `
    <circle cx="0" cy="0" r="40" fill="#ebf2ff" stroke="${BLUE}" stroke-width="4"/>
    <line x1="0" y1="-20" x2="0" y2="4" stroke="${BLUE}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="0" cy="17" r="5" fill="${BLUE}"/>`;
}

/**
 * Return an SVG <g> fragment for `name` centered at (cx, cy) with uniform `scale`.
 * Unknown names fall back to a blue circle with "!".
 */
export function iconSVG(name, cx = 0, cy = 0, scale = 1) {
  const drawer = ICON_BODIES[name] || genericIcon;
  const transform = scale === 1
    ? `translate(${cx}, ${cy})`
    : `translate(${cx}, ${cy}) scale(${scale})`;
  return `<g transform="${transform}">${drawer()}</g>`;
}
