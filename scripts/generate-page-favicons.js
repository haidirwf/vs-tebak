const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const faviconsDir = path.join(root, 'public', 'favicons');

if (!fs.existsSync(faviconsDir)) {
  fs.mkdirSync(faviconsDir, { recursive: true });
}

// 1. Dashboard (Castle / Citadel HQ)
const dashboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="10" y="10" width="492" height="492" rx="110" fill="none" stroke="#23232C" stroke-width="16" />
  
  <!-- Ambient Inner Glow -->
  <radialGradient id="dash-glow" cx="50%" cy="45%" r="40%">
    <stop offset="0%" stop-color="#F5C542" stop-opacity="0.18" />
    <stop offset="100%" stop-color="#F5C542" stop-opacity="0" />
  </radialGradient>
  <rect width="512" height="512" rx="120" fill="url(#dash-glow)" />

  <!-- Castle / Citadel Emblem -->
  <g transform="translate(256, 260) scale(15)" stroke="#F5C542" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Base wall -->
      <path d="M4 21V10l3-2v3h2V8l3-2 3 2v3h2V8l3 2v11H4z" fill="#F5C542" fill-opacity="0.12" />
      <!-- Arch gate -->
      <path d="M10 21v-5a2 2 0 0 1 4 0v5" fill="#111114" />
      <!-- Windows -->
      <line x1="7" y1="14" x2="7" y2="16" stroke-width="2" />
      <line x1="17" y1="14" x2="17" y2="16" stroke-width="2" />
      <line x1="12" y1="10" x2="12" y2="12" stroke-width="2" />
      <!-- Guiding Star atop tower -->
      <path d="M12 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#F5C542" stroke-width="0.8" />
    </g>
  </g>
</svg>`;

// 2. Modules (Mystic Spellbook / Coding Codex)
const modulesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="10" y="10" width="492" height="492" rx="110" fill="none" stroke="#23232C" stroke-width="16" />

  <radialGradient id="mod-glow" cx="50%" cy="45%" r="40%">
    <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.22" />
    <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />
  </radialGradient>
  <rect width="512" height="512" rx="120" fill="url(#mod-glow)" />

  <!-- Open Book Codex Emblem -->
  <g transform="translate(256, 256) scale(15)" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Book Pages Outer -->
      <path d="M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0V6a9 9 0 0 0-9 0 9 9 0 0 0-9 0v13z" fill="#38BDF8" fill-opacity="0.12" />
      <!-- Book Spine -->
      <line x1="12" y1="6" x2="12" y2="19" stroke-width="2.5" />
      <!-- Bookmark ribbon -->
      <path d="M12 6v7l2-1.5 2 1.5V6" fill="#38BDF8" fill-opacity="0.4" stroke-width="1.2" />
      <!-- Code lines / magic runes -->
      <line x1="6" y1="9.5" x2="9.5" y2="9.5" stroke-width="1.8" />
      <line x1="6" y1="13" x2="9" y2="13" stroke-width="1.8" />
      <line x1="14.5" y1="13" x2="18" y2="13" stroke-width="1.8" />
    </g>
  </g>
</svg>`;

// 3. Battle (Crossed Swords Arena)
const battleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="10" y="10" width="492" height="492" rx="110" fill="none" stroke="#23232C" stroke-width="16" />

  <radialGradient id="battle-glow" cx="50%" cy="50%" r="42%">
    <stop offset="0%" stop-color="#EF4444" stop-opacity="0.22" />
    <stop offset="60%" stop-color="#F5C542" stop-opacity="0.1" />
    <stop offset="100%" stop-color="#EF4444" stop-opacity="0" />
  </radialGradient>
  <rect width="512" height="512" rx="120" fill="url(#battle-glow)" />

  <!-- Dual Swords Clash Emblem -->
  <g transform="translate(256, 256) scale(15)" stroke="#F5C542" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Sword 1 -->
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" fill="#EF4444" fill-opacity="0.1" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />

      <!-- Sword 2 -->
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" fill="#EF4444" fill-opacity="0.1" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />

      <!-- Clash spark in center -->
      <circle cx="12" cy="12" r="1.5" fill="#FFF" stroke="#F5C542" stroke-width="0.8" />
    </g>
  </g>
</svg>`;

// 4. Character (Knight Crest Shield)
const characterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="10" y="10" width="492" height="492" rx="110" fill="none" stroke="#23232C" stroke-width="16" />

  <radialGradient id="char-glow" cx="50%" cy="45%" r="42%">
    <stop offset="0%" stop-color="#A855F7" stop-opacity="0.22" />
    <stop offset="100%" stop-color="#A855F7" stop-opacity="0" />
  </radialGradient>
  <rect width="512" height="512" rx="120" fill="url(#char-glow)" />

  <!-- Knight Shield Emblem -->
  <g transform="translate(256, 256) scale(15)" stroke="#C084FC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Shield outer -->
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#A855F7" fill-opacity="0.15" />
      <!-- Inner crest cross -->
      <line x1="12" y1="6" x2="12" y2="18" stroke="#F5C542" stroke-width="1.8" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="#F5C542" stroke-width="1.8" />
      <!-- Central heart gem -->
      <circle cx="12" cy="10" r="1.5" fill="#FFF" stroke="#F5C542" stroke-width="0.8" />
    </g>
  </g>
</svg>`;

// 5. Shop (Merchant Chest / Adventurer Bag)
const shopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="10" y="10" width="492" height="492" rx="110" fill="none" stroke="#23232C" stroke-width="16" />

  <radialGradient id="shop-glow" cx="50%" cy="48%" r="42%">
    <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.25" />
    <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
  </radialGradient>
  <rect width="512" height="512" rx="120" fill="url(#shop-glow)" />

  <!-- Shopping / Treasure Emblem -->
  <g transform="translate(256, 256) scale(15)" stroke="#FBBF24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Bag Body -->
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#F59E0B" fill-opacity="0.15" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <!-- Bag Handles / Crown clasp -->
      <path d="M16 10a4 4 0 0 1-8 0" stroke="#FBBF24" stroke-width="2" />
      <!-- Star coin in center -->
      <polygon points="12 13 12.8 15 15 15.2 13.3 16.6 13.8 18.7 12 17.5 10.2 18.7 10.7 16.6 9 15.2 11.2 15" fill="#F5C542" stroke="none" />
    </g>
  </g>
</svg>`;

// 6. Leaderboard (Grandmaster Trophy)
const leaderboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="10" y="10" width="492" height="492" rx="110" fill="none" stroke="#23232C" stroke-width="16" />

  <radialGradient id="lead-glow" cx="50%" cy="45%" r="42%">
    <stop offset="0%" stop-color="#F5C542" stop-opacity="0.25" />
    <stop offset="100%" stop-color="#F5C542" stop-opacity="0" />
  </radialGradient>
  <rect width="512" height="512" rx="120" fill="url(#lead-glow)" />

  <!-- Trophy Cup Emblem -->
  <g transform="translate(256, 256) scale(15)" stroke="#F5C542" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Cup Base & Stem -->
      <path d="M6 9a6 6 0 0 0 12 0V3H6v6z" fill="#F5C542" fill-opacity="0.18" />
      <path d="M6 5H3a2 2 0 0 0-2 2 4 4 0 0 0 4 4h1" />
      <path d="M18 5h3a2 2 0 0 1 2 2 4 4 0 0 1-4 4h-1" />
      <path d="M12 15v4" stroke-width="2.5" />
      <path d="M8 21h8" stroke-width="2.5" />
      <!-- Star on cup -->
      <polygon points="12 6.5 12.6 8 14.2 8.2 13 9.3 13.4 10.9 12 10 10.6 10.9 11 9.3 9.8 8.2 11.4 8" fill="#FFF" stroke="none" />
    </g>
  </g>
</svg>`;

// 7. Profile (Hero Helmet Visor)
const profileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="10" y="10" width="492" height="492" rx="110" fill="none" stroke="#23232C" stroke-width="16" />

  <radialGradient id="prof-glow" cx="50%" cy="45%" r="42%">
    <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.2" />
    <stop offset="100%" stop-color="#E2E8F0" stop-opacity="0" />
  </radialGradient>
  <rect width="512" height="512" rx="120" fill="url(#prof-glow)" />

  <!-- Hero Profile / Helmet Emblem -->
  <g transform="translate(256, 256) scale(15)" stroke="#E2E8F0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Avatar head / Helmet outline -->
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="#E2E8F0" fill-opacity="0.12" />
      <circle cx="12" cy="7" r="4" fill="#F5C542" fill-opacity="0.15" />
      <!-- Knight visor line -->
      <line x1="10" y1="7" x2="14" y2="7" stroke="#F5C542" stroke-width="1.8" />
    </g>
  </g>
</svg>`;

const ICONS = [
  { name: 'dashboard', svg: dashboardSvg },
  { name: 'modules', svg: modulesSvg },
  { name: 'battle', svg: battleSvg },
  { name: 'character', svg: characterSvg },
  { name: 'shop', svg: shopSvg },
  { name: 'leaderboard', svg: leaderboardSvg },
  { name: 'profile', svg: profileSvg },
];

async function generateAll() {
  console.log('Generating favicons for each navbar page...');

  for (const item of ICONS) {
    const svgPath = path.join(faviconsDir, `${item.name}.svg`);
    fs.writeFileSync(svgPath, item.svg, 'utf8');

    const svgBuffer = Buffer.from(item.svg);

    // 32x32 standard favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(faviconsDir, `${item.name}-32.png`));

    // 192x192 high-res
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(faviconsDir, `${item.name}-192.png`));

    // Default png alias
    await sharp(svgBuffer)
      .resize(64, 64)
      .png()
      .toFile(path.join(faviconsDir, `${item.name}.png`));

    console.log(`✓ Generated ${item.name} favicons (.svg, -32.png, -192.png, .png)`);
  }

  console.log('All navbar page favicons generated successfully!');
}

generateAll().catch(console.error);
