import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const sharp = require('sharp')
const fs = require('fs')

const svg192 = fs.readFileSync('./public/icon-192.svg')
const svg512 = fs.readFileSync('./public/icon-512.svg')

sharp(Buffer.from(svg192)).resize(192, 192).png().toFile('./public/icon-192.png', () => console.log('192 done'))
sharp(Buffer.from(svg512)).resize(512, 512).png().toFile('./public/icon-512.png', () => console.log('512 done'))

sharp(Buffer.from(svg512))
  .resize(410, 410)
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: { r: 124, g: 58, b: 237, alpha: 1 } })
  .png()
  .toFile('./public/icon-maskable-512.png', () => console.log('maskable done'))

const wideSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="50%" stop-color="#0f0c1b"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="580" y="220" width="120" height="120" rx="28" fill="url(#g)"/>
  <text x="640" y="308" text-anchor="middle" font-family="Arial,sans-serif" font-size="70" font-weight="700" fill="white">N</text>
  <text x="640" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" font-weight="700" fill="#f1f5f9">NeuroLoop</text>
  <text x="640" y="455" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#94a3b8">AI-Powered Learning Tracker &amp; Spaced Repetition</text>
</svg>`

const narrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="50%" stop-color="#0f0c1b"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="390" height="844" fill="url(#bg)"/>
  <rect x="145" y="312" width="100" height="100" rx="24" fill="url(#g)"/>
  <text x="195" y="385" text-anchor="middle" font-family="Arial,sans-serif" font-size="60" font-weight="700" fill="white">N</text>
  <text x="195" y="460" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#f1f5f9">NeuroLoop</text>
  <text x="195" y="500" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#94a3b8">AI Learning Tracker</text>
</svg>`

sharp(Buffer.from(wideSvg)).png().toFile('./public/screenshot-wide.png', () => console.log('screenshot-wide done'))
sharp(Buffer.from(narrowSvg)).png().toFile('./public/screenshot-narrow.png', () => console.log('screenshot-narrow done'))
