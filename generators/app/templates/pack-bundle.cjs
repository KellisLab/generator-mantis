const fs = require('fs');
const path = require('path');

const root = process.cwd();
const manifestPath = path.join(root, 'mantis.extension.json');

if (!fs.existsSync(manifestPath)) {
  console.error('mantis.extension.json not found in', root);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function readUtf8(rel) {
  const abs = path.join(root, rel);
  return fs.readFileSync(abs, 'utf8');
}

const assets = {};
const backend = {};

assets[manifest.main] = readUtf8(manifest.main);

for (const panel of manifest.contributes.panels || []) {
  assets[panel.entry] = readUtf8(panel.entry);
  for (const s of panel.scripts || []) assets[s] = readUtf8(s);
  for (const s of panel.styles || []) assets[s] = readUtf8(s);
}

if (manifest.backend) {
  backend[manifest.backend.entry] = readUtf8(manifest.backend.entry);
}

const out = { manifest, assets, backend, enabled: true };
const target = path.join(root, 'bundle.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2));
console.log('Wrote', target);
