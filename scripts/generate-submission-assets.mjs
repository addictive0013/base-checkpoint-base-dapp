import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");

const W = 1284;
const H = 2778;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const result = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result;
}

function frame(content, bg = "#07111a", glow = "#1df2a3") {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#04080d"/>
      </linearGradient>
      <radialGradient id="halo" cx="0.16" cy="0.08" r="0.9">
        <stop offset="0%" stop-color="${glow}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M36 0H0V36" fill="none" stroke="#2c4254" stroke-opacity="0.28" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#halo)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    ${content}
  </svg>`;
}

function header(title, subtitle) {
  const lines = wrap(subtitle, 34);
  return `
    <text x="72" y="104" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="#7ef8c2">BASE CHECKPOINT</text>
    <text x="72" y="220" font-family="Arial, sans-serif" font-size="90" font-weight="900" fill="#f4fbff">${esc(title)}</text>
    ${lines.map((line, index) => `<text x="76" y="${296 + index * 42}" font-family="Arial, sans-serif" font-size="33" font-weight="700" fill="#91a7b7">${esc(line)}</text>`).join("")}
  `;
}

function pill(x, y, text, fill, stroke = "#274454", fg = "#dff7ef") {
  return `
    <rect x="${x}" y="${y}" rx="28" width="${text.length * 16 + 70}" height="56" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    <text x="${x + 28}" y="${y + 37}" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="${fg}">${esc(text)}</text>
  `;
}

function panel(x, y, width, height, title, lines, accent = "#1df2a3", bg = "#0a151f") {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="28" fill="${bg}" stroke="#214055" stroke-width="4"/>
      <rect x="${x + 24}" y="${y + 24}" width="120" height="8" rx="4" fill="${accent}" opacity="0.95"/>
      <text x="${x + 24}" y="${y + 66}" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#7ef8c2">${esc(title)}</text>
      ${lines.map((line, index) => `<text x="${x + 24}" y="${y + 124 + index * 38}" font-family="Arial, sans-serif" font-size="${index === 0 ? 34 : 28}" font-weight="${index === 0 ? 900 : 700}" fill="${index === 0 ? "#f4fbff" : "#93a8b8"}">${esc(line)}</text>`).join("")}
    </g>
  `;
}

function button(x, y, width, text, fill, fg = "#07111a") {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="96" rx="48" fill="${fill}" stroke="#2a4657" stroke-width="4"/>
    <text x="${x + width / 2}" y="${y + 61}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="${fg}">${esc(text)}</text>
  `;
}

function screenshot1() {
  const content = `
    ${header("Log one step.", "A compact board for daily shipping. One lane, one title, one concrete checkpoint on Base.")}
    ${pill(72, 392, "Build lane", "#10212b")}
    ${pill(254, 392, "Mobile-first", "#123827")}
    ${panel(72, 520, 1140, 300, "Primary action", ["Shipped mobile wallet connect", "Lane: Build", "Detail: Made the first action obvious on phone"], "#1df2a3")}
    ${panel(72, 864, 548, 240, "Board rules", ["One step per entry", "Short, concrete, readable"], "#7ad3ff", "#09131b")}
    ${panel(664, 864, 548, 240, "Why it works", ["Daily public progress", "Clean streak history"], "#f7c786", "#09131b")}
    ${panel(72, 1148, 1140, 320, "Checkpoint board", ["Total logged: 24", "Status: ready to log", "Fast enough for every day"], "#1df2a3")}
    ${button(72, 2522, 1140, "Log on Base", "#86f7bf")}
  `;
  return frame(content);
}

function screenshot2() {
  const content = `
    ${header("The board updates.", "After logging, the checkpoint becomes a visible part of your public build trail on Base.")}
    ${pill(72, 392, "Confirmed", "#123827")}
    ${pill(232, 392, "Board live", "#10212b")}
    ${panel(72, 520, 1140, 324, "Latest checkpoint", ["Shipped mobile wallet connect", "Tightened first-screen flow and reduced clutter on mobile.", "Author: 0x9936...9652"], "#1df2a3")}
    ${panel(72, 888, 548, 236, "Lane", ["Build", "Checkpoint #24"], "#7ad3ff", "#09131b")}
    ${panel(664, 888, 548, 236, "Date", ["May 14, 2026", "Stored on Base"], "#f7c786", "#09131b")}
    ${panel(72, 1172, 1140, 300, "Board state", ["Daily shipping now has a public timestamp.", "The entry is compact, readable, and easy to scan on a phone."], "#1df2a3")}
    ${button(72, 2522, 1140, "View checkpoint board", "#0f2430", "#dff7ef")}
  `;
  return frame(content, "#061019", "#7ad3ff");
}

function screenshot3() {
  const content = `
    ${header("Look up any checkpoint.", "Pull a record by ID and see who shipped what, under which lane, and on which date.")}
    ${pill(72, 392, "Checkpoint #24", "#10212b")}
    ${pill(308, 392, "Lookup mode", "#123827")}
    ${panel(72, 520, 1140, 284, "Lookup result", ["Shipped mobile wallet connect", "Lane: Build", "Date: May 14, 2026"], "#1df2a3")}
    ${panel(72, 848, 1140, 292, "Detail", ["Made the first-screen action obvious on mobile and cleaned up the wallet path so users know what to do immediately."], "#7ad3ff", "#09131b")}
    ${panel(72, 1188, 548, 236, "Author", ["0x9936...9652", "Public build log"], "#f7c786", "#09131b")}
    ${panel(664, 1188, 548, 236, "State", ["Receipt found", "Board ready"], "#1df2a3", "#09131b")}
    ${button(72, 2522, 1140, "Log another checkpoint", "#86f7bf")}
  `;
  return frame(content, "#08111b", "#f7c786");
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#07111a"/>
    <rect x="122" y="122" width="780" height="780" rx="110" fill="#0b1721" stroke="#244457" stroke-width="24"/>
    <rect x="204" y="218" width="616" height="110" rx="24" fill="#1df2a3"/>
    <rect x="204" y="378" width="616" height="188" rx="26" fill="#10212b" stroke="#2e5063" stroke-width="16"/>
    <rect x="204" y="610" width="280" height="152" rx="24" fill="#10212b" stroke="#2e5063" stroke-width="16"/>
    <rect x="540" y="610" width="280" height="152" rx="24" fill="#10212b" stroke="#2e5063" stroke-width="16"/>
    <path d="M252 430h250" stroke="#dff7ef" stroke-width="18" stroke-linecap="round"/>
    <path d="M252 476h420" stroke="#7f95a5" stroke-width="16" stroke-linecap="round"/>
    <path d="M252 522h316" stroke="#7f95a5" stroke-width="16" stroke-linecap="round"/>
    <circle cx="744" cy="456" r="46" fill="#1df2a3"/>
    <path d="M721 456l17 17 29-34" stroke="#07111a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#07111a"/>
        <stop offset="100%" stop-color="#050910"/>
      </linearGradient>
    </defs>
    <rect width="1910" height="1000" fill="url(#bg)"/>
    <circle cx="260" cy="160" r="280" fill="#1df2a3" opacity="0.13"/>
    <circle cx="1600" cy="160" r="220" fill="#7ad3ff" opacity="0.12"/>
    <text x="96" y="198" font-family="Arial, sans-serif" font-size="118" font-weight="900" fill="#f4fbff">Base Checkpoint</text>
    <text x="100" y="292" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#95a9b7">A sharp board for daily progress, shipping notes, and clean onchain streak logs.</text>
    ${pill(100, 348, "Daily progress", "#10212b")}
    ${pill(356, 348, "Onchain log", "#123827")}
    ${button(100, 448, 430, "Log on Base", "#86f7bf")}
    ${button(560, 448, 430, "Lookup board", "#0f2430", "#dff7ef")}
    ${panel(1186, 124, 624, 248, "Latest checkpoint", ["Shipped mobile wallet connect", "Lane: Build", "May 14, 2026"], "#1df2a3")}
    ${panel(1186, 420, 624, 248, "Board state", ["Total logged: 24", "Readable streak history"], "#7ad3ff")}
    ${panel(1186, 716, 624, 200, "Why it stands out", ["Industrial board feel, clear purpose, mobile-first hierarchy"], "#f7c786")}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

const manifest = {
  generatedAt: new Date().toISOString(),
  files,
};

await writeFile(join(outDir, "asset-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

for (const file of files) {
  console.log(file);
}
