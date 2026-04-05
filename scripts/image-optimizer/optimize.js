const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../../public');
const images = fs.readdirSync(publicDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

async function optimizeImages() {
  for (const img of images) {
    const inputPath = path.join(publicDir, img);
    const stats = fs.statSync(inputPath);
    
    if (stats.size > 100000) { // Only optimize files > 100KB
      const ext = path.extname(img);
      const name = path.basename(img, ext);
      const outputPath = path.join(publicDir, `${name}.webp`);
      
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      console.log(`Optimized: ${img} -> ${name}.webp`);
    }
  }
}

optimizeImages().catch(console.error);
