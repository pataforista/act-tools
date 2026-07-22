const fs = require('fs');
const { execSync } = require('child_process');

const svg192 = `
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#0f172a"/>
  <circle cx="96" cy="96" r="80" fill="none" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="96" cy="96" r="60" fill="none" stroke="#fbbf24" stroke-width="4"/>
  <circle cx="96" cy="96" r="40" fill="none" stroke="#10b981" stroke-width="4"/>
  <circle cx="96" cy="96" r="20" fill="#f43f5e"/>
</svg>
`;

const svg512 = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0f172a"/>
  <circle cx="256" cy="256" r="213" fill="none" stroke="#38bdf8" stroke-width="10"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="#fbbf24" stroke-width="10"/>
  <circle cx="256" cy="256" r="106" fill="none" stroke="#10b981" stroke-width="10"/>
  <circle cx="256" cy="256" r="53" fill="#f43f5e"/>
</svg>
`;

fs.writeFileSync('icons/icon-192.svg', svg192.trim());
fs.writeFileSync('icons/icon-512.svg', svg512.trim());

console.log('SVGs created. Attempting to convert using sharp-cli...');

try {
  execSync('npx -y sharp-cli@latest -i icons/icon-192.svg -o icons/icon-192.png', { stdio: 'inherit' });
  execSync('npx -y sharp-cli@latest -i icons/icon-512.svg -o icons/icon-512.png', { stdio: 'inherit' });
  console.log('Icons generated successfully.');
} catch (e) {
  console.error('Could not generate PNGs automatically. Please convert the SVGs manually.', e.message);
}
