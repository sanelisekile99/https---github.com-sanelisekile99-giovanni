/*
  Simple build-time image validator (CommonJS).
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const imagesDir = path.join(root, 'src', 'images');
const storeFile = path.join(root, 'src', 'lib', 'localStore.ts');

if (!fs.existsSync(storeFile)) {
  console.error('localStore.ts not found:', storeFile);
  process.exit(2);
}

const text = fs.readFileSync(storeFile, 'utf8');

const productsMatch = text.match(/export\s+const\s+products[\s\S]*?=\s*\[([\s\S]*?)\]\s*;/m);
if (!productsMatch) {
  console.error('Could not find products array in localStore.ts');
  process.exit(2);
}

const productsBlock = productsMatch[1];
const productEntries = productsBlock
  .split(/\n\s*},\s*\n/)
  .map(s => s + '\n}')
  .map(s => s.trim())
  .filter(s => s.length > 10);
// also parse productImages mapping to resolve indirect references like productImages.black
const productImagesMatch = text.match(/const\s+productImages\s*=\s*\{([\s\S]*?)\};/m);
const productImagesMap = {};
if (productImagesMatch) {
  const piBlock = productImagesMatch[1];
  // lines like: black: imageCatalog.blackTShirt || '',
  piBlock.split(/\n/).forEach(line => {
    const m = line.match(/([a-zA-Z0-9_\-]+)\s*:\s*(imageCatalog\.[a-zA-Z0-9_]+)\b/);
    if (m) {
      productImagesMap[m[1].trim()] = m[2].trim().replace(/^imageCatalog\./, '');
    }
  });
}

// parse imageCatalog to map catalog key -> candidate filename string inside findByName('...')
const imageCatalogFile = path.join(root, 'src', 'lib', 'imageCatalog.ts');
let imageCatalogText = '';
if (fs.existsSync(imageCatalogFile)) {
  imageCatalogText = fs.readFileSync(imageCatalogFile, 'utf8');
}
const imageCatalogMap = {};
if (imageCatalogText) {
  // find lines like: blackTShirt: findByName('black t-shirt with giovanni print.png'),
  imageCatalogText.split(/\n/).forEach(line => {
    const m = line.match(/([a-zA-Z0-9_]+)\s*:\s*findByName\(\s*'([^']+)'/);
    if (m) {
      imageCatalogMap[m[1].trim()] = m[2].trim();
    }
  });
}
const imageFiles = new Set(fs.readdirSync(imagesDir).map(f => f.toLowerCase()));
const missing = [];

productEntries.forEach(entry => {
  const idMatch = entry.match(/id:\s*'([^']+)'/);
  const id = idMatch ? idMatch[1] : '(unknown)';
  if (id === '(unknown)') {
    console.error('DEBUG: product entry without id detected:\n', entry.slice(0, 300));
  }
  const imagesMatch = entry.match(/images:\s*\[([^\]]*)\]/m);
  if (!imagesMatch) {
    missing.push({ id, reason: 'no images array' });
    return;
  }
    const rawImages = imagesMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    const imagesList = [];
    rawImages.forEach(raw => {
      // quoted literal -> filename
      const lit = raw.replace(/^['\"]|['\"]$/g, '').toLowerCase();
      if (lit && !lit.includes('resolveimagesrc') && !lit.includes('productimages') && !lit.includes('imagecatalog')) {
        imagesList.push(lit);
        return;
      }

      // handle expressions like resolveImageSrc(productImages.black) || productImages.black
      const prodImgRef = raw.match(/productImages\.([a-zA-Z0-9_\-]+)/i);
      if (prodImgRef) {
        const key = prodImgRef[1];
        const catalogKey = productImagesMap[key];
        if (catalogKey && imageCatalogMap[catalogKey]) {
          imagesList.push(imageCatalogMap[catalogKey].toLowerCase());
          return;
        }
      }

      // fallback: if raw contains a filename-like segment, pick that
      const fileSeg = raw.match(/['\"]([^'\"]+\.(png|jpg|jpeg|webp|avif))['\"]/i);
      if (fileSeg) {
        imagesList.push(fileSeg[1].toLowerCase());
        return;
      }
      // otherwise push the raw normalized
      imagesList.push(raw.replace(/[^a-z0-9._-]/gi, '-').toLowerCase());
    });
  if (imagesList.length === 0) {
    missing.push({ id, reason: 'empty images array' });
    return;
  }
  imagesList.forEach(img => {
    if (img.startsWith('http://') || img.startsWith('https://')) return;
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
