/*
  Simple build-time image validator.
  - Reads src/lib/localStore.generated.ts and extracts products array
  - Compares product.images entries against files in src/images
  - Prints missing images and exits with non-zero code if any missing

  Run with: node scripts/validate-images.js
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const imagesDir = path.join(root, 'src', 'images');
const storeFile = path.join(root, 'src', 'lib', 'localStore.generated.ts');

if (!fs.existsSync(storeFile)) {
  console.error('localStore.generated.ts not found:', storeFile);
  process.exit(2);
}

const text = fs.readFileSync(storeFile, 'utf8');

// crude extraction of products array JSON-ish block
const productsMatch = text.match(/const products\s*=\s*\[([\s\S]*?)\];/m);
if (!productsMatch) {
  console.error('Could not find products array in localStore.generated.ts');
  process.exit(2);
}

const productsBlock = productsMatch[1];

// find image filename strings like 'some name.png' within each product block
// This is a best-effort parser for the generated file format.
const productEntries = productsBlock.split(/\n\s*},\s*\n/).map(s => s + '\n}');

const imageFiles = new Set(fs.readdirSync(imagesDir).map(f => f.toLowerCase()));

const missing = [];

productEntries.forEach(entry => {
  // extract id
  const idMatch = entry.match(/id:\s*'([^']+)'/);
  const id = idMatch ? idMatch[1] : '(unknown)';

  // extract images: [ 'a.png', 'b.png' ] or images: []
  const imagesMatch = entry.match(/images:\s*\[([^\]]*)\]/m);
  if (!imagesMatch) {
    // some products may not have images array
    missing.push({ id, reason: 'no images array' });
    return;
  }

  const imagesList = imagesMatch[1]
    .split(',')
    .map(s => s.trim().replace(/^['"]|['"]$/g, '').toLowerCase())
    .filter(Boolean);

  if (imagesList.length === 0) {
    missing.push({ id, reason: 'empty images array' });
    return;
  }

  imagesList.forEach(img => {
    // if the value is a URL (starts with http) consider it present
    if (img.startsWith('http://') || img.startsWith('https://')) return;
    // remove path segments
    const fileName = img.split('/').pop();
    if (!fileName) {
      missing.push({ id, image: img, reason: 'invalid image string' });
      return;
    }
    if (!imageFiles.has(fileName.toLowerCase())) {
      missing.push({ id, image: fileName, reason: 'file not found in src/images' });
    }
  });
});

if (missing.length === 0) {
  console.log('All product images were found in src/images');
  process.exit(0);
}

console.error('Missing images detected:');
missing.slice(0, 200).forEach(m => {
  console.error('-', m.id, m.image ? m.image : '', m.reason);
});
process.exit(1);
