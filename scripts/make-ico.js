const fs = require("fs");
const path = require("path");

const pngPath = path.join(__dirname, "../public/icon.png");
const pngData = fs.readFileSync(pngPath);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);

const dir = Buffer.alloc(16);
dir.writeUInt8(32, 0);
dir.writeUInt8(32, 1);
dir.writeUInt8(0, 2);
dir.writeUInt8(0, 3);
dir.writeUInt16LE(1, 4);
dir.writeUInt16LE(32, 6);
dir.writeUInt32LE(pngData.length, 8);
dir.writeUInt32LE(22, 12);

const ico = Buffer.concat([header, dir, pngData]);
fs.writeFileSync(path.join(__dirname, "../src/app/favicon.ico"), ico);
fs.writeFileSync(path.join(__dirname, "../public/favicon.ico"), ico);
console.log("Successfully generated valid ICO file with header:", ico.length);
