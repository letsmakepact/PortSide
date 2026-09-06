const fs = require("fs");
const path = require("path");

const pngPath = path.join(__dirname, "../public/icon.png");
const pngData = fs.readFileSync(pngPath);

// Create valid Windows ICO structure containing 16x16, 32x32, 48x48 if possible or 32x32 PNG
// Header: 6 bytes
// Directory entry: 16 bytes
// Image data: pngData.length
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // 1 = ICO
header.writeUInt16LE(1, 4); // 1 image

const dir = Buffer.alloc(16);
dir.writeUInt8(32, 0); // Width: 32 (0 means 256)
dir.writeUInt8(32, 1); // Height: 32
dir.writeUInt8(0, 2);  // Colors
dir.writeUInt8(0, 3);  // Reserved
dir.writeUInt16LE(1, 4); // Planes
dir.writeUInt16LE(32, 6); // Bits per pixel
dir.writeUInt32LE(pngData.length, 8); // Size
dir.writeUInt32LE(22, 12); // Offset = 6 + 16 = 22

const ico = Buffer.concat([header, dir, pngData]);
fs.writeFileSync(path.join(__dirname, "../src/app/favicon.ico"), ico);
fs.writeFileSync(path.join(__dirname, "../public/favicon.ico"), ico);
console.log("Successfully generated valid ICO file with header:", ico.length);
