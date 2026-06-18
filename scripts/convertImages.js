const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(process.cwd(), 'public/images');

async function convertImages() {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace('.png', '.webp'));
      
      console.log(`Converting ${file} to WebP...`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
        
      console.log(`Deleting original ${file}...`);
      fs.unlinkSync(inputPath);
    }
  }
  
  console.log('Conversion complete!');
}

convertImages().catch(console.error);
