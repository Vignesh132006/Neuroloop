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
