const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const MANIFEST_NAME = "mantis.extension.json";

const root = process.cwd();
const manifestPath = path.join(root, MANIFEST_NAME);

if (!fs.existsSync(manifestPath)) {
  console.error(MANIFEST_NAME, "not found in", root);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const manifestRaw = fs.readFileSync(manifestPath);

function readUtf8(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
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

const bundle = { manifest, assets, backend, enabled: true };
const bundlePath = path.join(root, "bundle.json");
fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2));

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (~c) >>> 0;
}

function zipDeflate(entries) {
  const parts = [];
  let offset = 0;
  const cdChunks = [];

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const comp = zlib.deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    const localBlock = Buffer.concat([local, nameBuf, comp]);
    parts.push(localBlock);

    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(0x0314, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(8, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(comp.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    cdChunks.push(Buffer.concat([cd, nameBuf]));
    offset += localBlock.length;
  }

  const centralDir = Buffer.concat(cdChunks);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...parts, centralDir, eocd]);
}

const zipEntries = [
  { name: MANIFEST_NAME, data: manifestRaw },
  ...Object.keys(assets)
    .sort()
    .map((k) => ({ name: k, data: Buffer.from(assets[k], "utf8") })),
  ...Object.keys(backend)
    .sort()
    .map((k) => ({ name: k, data: Buffer.from(backend[k], "utf8") })),
];

const mantisxPath = path.join(root, "package.mantisx");
fs.writeFileSync(mantisxPath, zipDeflate(zipEntries));

console.log("Wrote", bundlePath);
console.log("Wrote", mantisxPath, "(zip importable as .mantisx per Mantis API)");
