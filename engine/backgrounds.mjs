// engine/backgrounds.mjs
// Flexible Vector Background Library with Level-of-Detail (LOD)
// Supports High Detail (focus/hero scenes) and Lightweight/Minimalist (quick cuts/metaphors)

const INK = '#1e1c1a';

/**
 * Generates an SVG string for the requested background environment.
 * @param {string} type - 'office' | 'street' | 'nature' | 'hospital' | 'classroom' | 'water' | 'void'
 * @param {'high'|'low'} detail - Level of Detail ('high' for hero/focus, 'low' for minimalist)
 * @param {number} W - Canvas Width (default 1920)
 * @param {number} H - Canvas Height (default 1080)
 * @param {number} floorY - Horizon/Floor line Y (default 900)
 * @param {object} options - Optional overrides (e.g. time of day, colors)
 */
export function getBackgroundSVG(type = 'office', detail = 'high', W = 1920, H = 1080, floorY = 900, options = {}) {
  switch (type.toLowerCase()) {
    case 'office':
    case 'room':
      return renderOffice(detail, W, H, floorY, options);
    case 'street':
    case 'city':
      return renderStreet(detail, W, H, floorY, options);
    case 'nature':
    case 'park':
      return renderNature(detail, W, H, floorY, options);
    case 'hospital':
    case 'clinic':
      return renderHospital(detail, W, H, floorY, options);
    case 'classroom':
    case 'school':
      return renderClassroom(detail, W, H, floorY, options);
    case 'water':
    case 'ocean':
    case 'lake':
      return renderWater(detail, W, H, floorY, options);
    case 'void':
    case 'studio':
    default:
      return renderVoid(detail, W, H, floorY, options);
  }
}

// 1. OFFICE / ROOM
function renderOffice(detail, W, H, floorY, opts) {
  const wallBg = opts.wallBg || '#f8f6f0';
  const floorBg = opts.floorBg || '#ece6dc';

  if (detail === 'low') {
    // Minimalist Room
    return `
      <rect width="${W}" height="${H}" fill="${wallBg}"/>
      <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${floorBg}"/>
      <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="5"/>
    `;
  }

  // High Detail Room with Architectural Window, Sunlight Angle & Baseboard
  return `
    <!-- Wall & Floor Base -->
    <rect width="${W}" height="${H}" fill="${wallBg}"/>
    <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${floorBg}"/>
    <!-- Baseboard Molding -->
    <rect x="0" y="${floorY - 14}" width="${W}" height="14" fill="#dfd7ca"/>
    <line x1="0" y1="${floorY - 14}" x2="${W}" y2="${floorY - 14}" stroke="${INK}" stroke-width="2"/>
    <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="6"/>

    <!-- Left Architectural Window -->
    <g transform="translate(100, 180)">
      <rect width="190" height="300" rx="8" fill="#eef3fa" stroke="${INK}" stroke-width="5"/>
      <line x1="95" y1="0" x2="95" y2="300" stroke="${INK}" stroke-width="4"/>
      <line x1="0" y1="150" x2="190" y2="150" stroke="${INK}" stroke-width="4"/>
      <!-- Window Sill -->
      <rect x="-14" y="298" width="218" height="15" rx="3" fill="#dfd7ca" stroke="${INK}" stroke-width="4"/>
      <!-- Ambient Sunbeam polygon casting on wall & floor -->
      <polygon points="190,300 320,${floorY - 180} 90,${floorY - 180} 0,300" fill="#ffffff" opacity="0.30"/>
    </g>

    <!-- Wall Accent: Minimalist Wall Frame -->
    <g transform="translate(350, 240)">
      <rect width="100" height="130" rx="4" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
      <polygon points="20,110 50,60 70,85 85,70 90,110" fill="#cbd5e1"/>
      <circle cx="75" cy="45" r="8" fill="#f59e0b"/>
    </g>
  `;
}

// 2. STREET / CITY
function renderStreet(detail, W, H, floorY, opts) {
  const skyBg = opts.skyBg || '#f1f5f9';
  const roadBg = opts.roadBg || '#334155';

  if (detail === 'low') {
    // Minimalist Street
    return `
      <rect width="${W}" height="${H}" fill="${skyBg}"/>
      <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${roadBg}"/>
      <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="6"/>
      <!-- Single clean lamp post -->
      <line x1="220" y1="${floorY}" x2="220" y2="${floorY - 380}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M 220 ${floorY - 380} Q 220 ${floorY - 420} 260 ${floorY - 420}" fill="none" stroke="${INK}" stroke-width="7"/>
      <polygon points="245,${floorY - 420} 275,${floorY - 420} 280,${floorY - 400} 240,${floorY - 400}" fill="#475569" stroke="${INK}" stroke-width="3"/>
    `;
  }

  // High Detail Street with Distant Skyline, Road Dashes, Lamp with Warm Light Cone
  return `
    <rect width="${W}" height="${H}" fill="${skyBg}"/>

    <!-- Distant City Skyline Silhouettes -->
    <g fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2">
      <rect x="80" y="460" width="140" height="440"/>
      <rect x="250" y="380" width="180" height="520"/>
      <rect x="460" y="520" width="120" height="380"/>
      <rect x="620" y="420" width="200" height="480"/>
      <rect x="1350" y="450" width="160" height="450"/>
      <rect x="1540" y="360" width="190" height="540"/>
      <rect x="1760" y="500" width="130" height="400"/>
    </g>

    <!-- Sidewalk Curb -->
    <rect x="0" y="${floorY - 25}" width="${W}" height="25" fill="#cbd5e1" stroke="${INK}" stroke-width="4"/>

    <!-- Asphalt Road Plane -->
    <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${roadBg}"/>
    <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="6"/>

    <!-- Dashed Road Markings -->
    <g stroke="#f8fafc" stroke-width="8" stroke-dasharray="45 35" stroke-linecap="round" opacity="0.85">
      <line x1="0" y1="${floorY + 80}" x2="${W}" y2="${floorY + 80}"/>
    </g>

    <!-- Detailed Street Lamp with Glow Cone -->
    <g transform="translate(180, 0)">
      <!-- Warm Light Cone -->
      <polygon points="50,${floorY - 480} -80,${floorY} 180,${floorY}" fill="#fef08a" opacity="0.18"/>
      <!-- Cast shadow at base -->
      <ellipse cx="0" cy="${floorY - 25}" rx="28" ry="6" fill="#1e1c1a" opacity="0.2"/>
      <!-- Lamp Pole Base & Neck -->
      <rect x="-14" y="${floorY - 50}" width="28" height="25" rx="3" fill="#1e293b" stroke="${INK}" stroke-width="4"/>
      <line x1="0" y1="${floorY - 50}" x2="0" y2="${floorY - 460}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <!-- Curved Lantern Arm -->
      <path d="M 0 ${floorY - 460} Q 0 ${floorY - 500} 50 ${floorY - 500}" fill="none" stroke="${INK}" stroke-width="8"/>
      <!-- Lantern Fixture -->
      <polygon points="30,${floorY - 500} 70,${floorY - 500} 78,${floorY - 465} 22,${floorY - 465}" fill="#334155" stroke="${INK}" stroke-width="3"/>
      <polygon points="26,${floorY - 465} 74,${floorY - 465} 66,${floorY - 440} 34,${floorY - 440}" fill="#fef08a" stroke="${INK}" stroke-width="2"/>
    </g>
  `;
}

// 3. NATURE / PARK
function renderNature(detail, W, H, floorY, opts) {
  const skyBg = opts.skyBg || '#f0fdf4';
  const hillBg = opts.hillBg || '#86efac';
  const groundBg = opts.groundBg || '#4ade80';

  if (detail === 'low') {
    // Minimalist Hill & Tree
    return `
      <rect width="${W}" height="${H}" fill="${skyBg}"/>
      <path d="M 0 ${floorY + 30} Q ${W * 0.4} ${floorY - 60} ${W} ${floorY}" fill="${groundBg}" stroke="${INK}" stroke-width="5"/>
      <!-- Minimalist tree -->
      <line x1="220" y1="${floorY}" x2="220" y2="${floorY - 200}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="220" cy="${floorY - 260}" r="80" fill="#22c55e" stroke="${INK}" stroke-width="5"/>
    `;
  }

  // High Detail Nature with Layered Hills, Clouds, Stylized Tree
  return `
    <rect width="${W}" height="${H}" fill="${skyBg}"/>

    <!-- Distant Sun -->
    <circle cx="1650" cy="220" r="70" fill="#fde047" stroke="#facc15" stroke-width="4"/>

    <!-- Fluffy Cartoon Clouds -->
    <g fill="#ffffff" stroke="${INK}" stroke-width="3" opacity="0.85">
      <path d="M 280 210 Q 310 170 360 180 Q 410 160 450 190 Q 490 200 480 230 L 260 230 Z"/>
      <path d="M 1150 250 Q 1180 220 1220 225 Q 1260 210 1290 235 L 1130 255 Z"/>
    </g>

    <!-- Layer 1: Background Rolling Hill -->
    <path d="M 0 ${floorY - 20} Q 500 ${floorY - 140} 1100 ${floorY - 40} T ${W} ${floorY - 80} L ${W} ${H} L 0 ${H} Z" fill="${hillBg}"/>
    <path d="M 0 ${floorY - 20} Q 500 ${floorY - 140} 1100 ${floorY - 40} T ${W} ${floorY - 80}" fill="none" stroke="${INK}" stroke-width="4"/>

    <!-- Layer 2: Foreground Lawn Ground -->
    <path d="M 0 ${floorY + 20} Q 650 ${floorY - 50} 1300 ${floorY + 10} T ${W} ${floorY - 10} L ${W} ${H} L 0 ${H} Z" fill="${groundBg}"/>
    <path d="M 0 ${floorY + 20} Q 650 ${floorY - 50} 1300 ${floorY + 10} T ${W} ${floorY - 10}" fill="none" stroke="${INK}" stroke-width="6"/>

    <!-- Detailed Park Tree -->
    <g transform="translate(240, ${floorY - 10})">
      <ellipse cx="0" cy="5" rx="45" ry="10" fill="#1e1c1a" opacity="0.15"/>
      <!-- Trunk & branches -->
      <path d="M -14 0 C -12 -120 -30 -180 -50 -260 L -30 -260 C -12 -190 6 -150 10 0 Z" fill="#78350f" stroke="${INK}" stroke-width="4"/>
      <path d="M 0 -160 C 15 -200 40 -230 65 -250 L 50 -255 C 28 -235 6 -195 -6 -160 Z" fill="#78350f" stroke="${INK}" stroke-width="3"/>
      <!-- Foliage Puffs -->
      <circle cx="-55" cy="-280" r="75" fill="#15803d" stroke="${INK}" stroke-width="5"/>
      <circle cx="50" cy="-275" r="70" fill="#16a34a" stroke="${INK}" stroke-width="5"/>
      <circle cx="0" cy="-330" r="85" fill="#22c55e" stroke="${INK}" stroke-width="5"/>
    </g>
  `;
}

// 4. HOSPITAL / CLINIC
function renderHospital(detail, W, H, floorY, opts) {
  const wallBg = opts.wallBg || '#f0f9ff';
  const floorBg = opts.floorBg || '#e0f2fe';

  if (detail === 'low') {
    // Minimalist Clinic
    return `
      <rect width="${W}" height="${H}" fill="${wallBg}"/>
      <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${floorBg}"/>
      <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="5"/>
      <!-- Red Cross Badge on wall -->
      <g transform="translate(180, 260)">
        <circle cx="0" cy="0" r="38" fill="#ffffff" stroke="${INK}" stroke-width="4"/>
        <rect x="-8" y="-22" width="16" height="44" rx="3" fill="#ef4444"/>
        <rect x="-22" y="-8" width="44" height="16" rx="3" fill="#ef4444"/>
      </g>
    `;
  }

  // High Detail Hospital Room with Bed, IV Drip Stand, Medical Divider
  return `
    <rect width="${W}" height="${H}" fill="${wallBg}"/>
    <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${floorBg}"/>
    <!-- Sterile Vinyl Floor Trim -->
    <rect x="0" y="${floorY - 10}" width="${W}" height="10" fill="#bae6fd"/>
    <line x1="0" y1="${floorY - 10}" x2="${W}" y2="${floorY - 10}" stroke="${INK}" stroke-width="2"/>
    <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="6"/>

    <!-- Medical Curtain / Divider on left -->
    <g transform="translate(80, 140)">
      <line x1="0" y1="0" x2="260" y2="0" stroke="${INK}" stroke-width="6"/>
      <path d="M 10 0 C 20 200 -5 450 15 ${floorY - 140} L 240 ${floorY - 140} C 255 450 230 200 245 0 Z" fill="#e0f2fe" opacity="0.6" stroke="${INK}" stroke-width="4"/>
    </g>

    <!-- Wall Heartbeat Monitor Sign -->
    <g transform="translate(380, 240)">
      <rect width="180" height="110" rx="10" fill="#0f172a" stroke="${INK}" stroke-width="4"/>
      <path d="M 15 55 L 60 55 L 75 25 L 95 85 L 115 45 L 125 55 L 165 55" stroke="#22c55e" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="165" cy="55" r="4" fill="#22c55e"/>
    </g>

    <!-- IV Drip Pole Stand -->
    <g transform="translate(260, 0)">
      <ellipse cx="0" cy="${floorY + 2}" rx="32" ry="7" fill="#1e1c1a" opacity="0.15"/>
      <!-- Caster feet -->
      <line x1="-30" y1="${floorY}" x2="30" y2="${floorY}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <line x1="0" y1="${floorY}" x2="0" y2="${floorY - 380}" stroke="${INK}" stroke-width="6"/>
      <!-- Top hangers -->
      <path d="M -22 ${floorY - 380} Q -22 ${floorY - 400} 0 ${floorY - 380} Q 22 ${floorY - 400} 22 ${floorY - 380}" fill="none" stroke="${INK}" stroke-width="4"/>
      <!-- Saline drip bag -->
      <rect x="-14" y="${floorY - 375}" width="28" height="48" rx="6" fill="#ffffff" stroke="${INK}" stroke-width="3" opacity="0.9"/>
      <path d="M 0 ${floorY - 327} Q 15 ${floorY - 270} 5 ${floorY - 200}" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
    </g>
  `;
}

// 5. CLASSROOM / AUDITORIUM
function renderClassroom(detail, W, H, floorY, opts) {
  const wallBg = opts.wallBg || '#faf8f5';
  const floorBg = opts.floorBg || '#e8dec8';

  if (detail === 'low') {
    // Minimalist Chalkboard
    return `
      <rect width="${W}" height="${H}" fill="${wallBg}"/>
      <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${floorBg}"/>
      <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="5"/>
      <rect x="120" y="240" width="340" height="220" rx="8" fill="#1e3a2b" stroke="${INK}" stroke-width="6"/>
    `;
  }

  // High Detail Classroom with Huge Blackboard, Chalk formulas, Wood grain floor
  return `
    <rect width="${W}" height="${H}" fill="${wallBg}"/>
    <rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" fill="${floorBg}"/>
    <!-- Wood Plank Lines on Floor -->
    <line x1="0" y1="${floorY + 50}" x2="${W}" y2="${floorY + 50}" stroke="#d6cbb5" stroke-width="2"/>
    <line x1="0" y1="${floorY + 110}" x2="${W}" y2="${floorY + 110}" stroke="#d6cbb5" stroke-width="2"/>
    <line x1="0" y1="${floorY}" x2="${W}" y2="${floorY}" stroke="${INK}" stroke-width="6"/>

    <!-- Large Chalkboard -->
    <g transform="translate(100, 180)">
      <!-- Outer Wooden Frame -->
      <rect x="-12" y="-12" width="564" height="344" rx="8" fill="#b45309" stroke="${INK}" stroke-width="6"/>
      <!-- Dark Slate Chalk Green Board -->
      <rect width="540" height="320" rx="4" fill="#143224"/>
      <!-- Chalk Tray at bottom -->
      <rect x="-16" y="320" width="572" height="14" rx="2" fill="#78350f" stroke="${INK}" stroke-width="3"/>
      <!-- Chalk sticks in tray -->
      <rect x="40" y="316" width="22" height="5" fill="#ffffff" rx="1"/>
      <rect x="70" y="316" width="18" height="5" fill="#facc15" rx="1"/>

      <!-- Chalk Diagrams & Equations -->
      <text x="35" y="65" font-family="'Courier New', monospace" font-weight="700" font-size="28" fill="#f8fafc" opacity="0.85">E = mc²</text>
      <text x="35" y="125" font-family="'Courier New', monospace" font-weight="700" font-size="24" fill="#fef08a" opacity="0.85">f(x) = ∫ 2x dx = x² + C</text>
      <line x1="35" y1="145" x2="260" y2="145" stroke="#f8fafc" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.6"/>
      <circle cx="380" cy="95" r="45" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4 4" opacity="0.8"/>
      <polygon points="380,95 415,70 415,120" fill="none" stroke="#f87171" stroke-width="2"/>
    </g>
  `;
}

// 6. WATER / OCEAN / BEACH
function renderWater(detail, W, H, floorY, opts) {
  const skyBg = opts.skyBg || '#f0f9ff';
  const waterBg = opts.waterBg || '#0284c7';

  if (detail === 'low') {
    // Minimalist Ocean horizon
    return `
      <rect width="${W}" height="${H}" fill="${skyBg}"/>
      <rect x="0" y="${floorY - 60}" width="${W}" height="${H - (floorY - 60)}" fill="${waterBg}"/>
      <line x1="0" y1="${floorY - 60}" x2="${W}" y2="${floorY - 60}" stroke="${INK}" stroke-width="5"/>
      <path d="M 120 ${floorY} Q 180 ${floorY - 14} 240 ${floorY} T 360 ${floorY}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    `;
  }

  // High Detail Ocean with Sun, Gradients, and Layered Wave Foam
  return `
    <rect width="${W}" height="${H}" fill="${skyBg}"/>

    <!-- Horizon Sun Glow -->
    <ellipse cx="1400" cy="${floorY - 80}" rx="120" ry="60" fill="#fef08a" opacity="0.5"/>
    <circle cx="1400" cy="${floorY - 80}" r="55" fill="#fde047" stroke="#facc15" stroke-width="3"/>

    <!-- Deep Water Layer -->
    <rect x="0" y="${floorY - 80}" width="${W}" height="${H - (floorY - 80)}" fill="${waterBg}"/>
    <line x1="0" y1="${floorY - 80}" x2="${W}" y2="${floorY - 80}" stroke="${INK}" stroke-width="5"/>

    <!-- Layer 1 Wave Ripples -->
    <path d="M 0 ${floorY - 30} Q 150 ${floorY - 50} 300 ${floorY - 30} T 600 ${floorY - 30} T 900 ${floorY - 30} T 1200 ${floorY - 30} T 1500 ${floorY - 30} T ${W} ${floorY - 30} L ${W} ${H} L 0 ${H} Z" fill="#0369a1"/>
    <!-- Layer 2 Wave Crest Foam -->
    <path d="M 80 ${floorY + 30} Q 240 ${floorY + 5} 400 ${floorY + 30} T 720 ${floorY + 30} T 1040 ${floorY + 30} T 1360 ${floorY + 30} T 1680 ${floorY + 30}" fill="none" stroke="#bae6fd" stroke-width="5" stroke-linecap="round"/>
    <path d="M 0 ${floorY + 90} Q 200 ${floorY + 65} 400 ${floorY + 90} T 800 ${floorY + 90} T 1200 ${floorY + 90} T 1600 ${floorY + 90} T ${W} ${floorY + 90}" fill="none" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round"/>
  `;
}

// 7. VOID / MINIMALIST STUDIO
function renderVoid(detail, W, H, floorY, opts) {
  const bg = opts.bg || '#fcfaf7';
  return `
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <!-- Subtle ground horizon line -->
    <line x1="${W * 0.1}" y1="${floorY}" x2="${W * 0.9}" y2="${floorY}" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity="0.3"/>
  `;
}
