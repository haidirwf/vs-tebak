const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Minimalist, elegant Skillungo swords favicon:
// Dark background (#121216) + Pure Gold (#F5C542) swords emblem.
// No rainbow colors, no multi-color gradients. Simple, crisp, iconic.
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <!-- Dark Rounded Squircle Base -->
  <rect width="512" height="512" rx="120" fill="#111114" />
  <rect x="8" y="8" width="496" height="496" rx="112" fill="none" stroke="#222228" stroke-width="16" />

  <!-- Clean Bold Swords Emblem in Pure Brand Gold -->
  <g transform="translate(256, 256) scale(15.5)" stroke="#F5C542" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <g transform="translate(-12, -12)">
      <!-- Sword 1 (Top-Left to Bottom-Right) -->
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />

      <!-- Sword 2 (Top-Right to Bottom-Left) -->
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </g>
  </g>
</svg>`;

async function main() {
  const root = path.resolve(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const appDir = path.join(root, 'app');

  // Write clean SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Saved simple favicon.svg and app/icon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 32x32 favicon.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // 192x192 icon for android/pwa
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  // 180x180 apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 48x48 for app/favicon.ico
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(appDir, 'favicon.ico'));

  console.log('Generated all simple favicon assets successfully!');
}

main().catch(console.error);
