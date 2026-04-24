const fs = require('fs');
const path = require('path');
const imagesDir = path.join(__dirname, '..', 'src', 'images');
const files = fs.readdirSync(imagesDir);

const normalize = (f) => f.toLowerCase().replace(/backet/g, 'bucket');

function inferProductType(fileNameLower) {
  const lower = fileNameLower;
  if (lower.includes('premium linen shirt with sleek zipper')) return 'Limited Edition';
  if (lower.includes('minimalist _giovanni_ t-shirt display')) return '';
  if (lower.includes('classic giovanni')) return 'T-Shirts';
  if ((lower.includes('linen') && lower.includes('(men)')) || (lower.includes('shirt and pants set') && !lower.includes('women'))) {
    return "Men's Two-Piece Linen Sets";
  }
  if (lower.includes('linen') && lower.includes('women')) return "Women's Two-Piece Linen Sets";
  if (lower.includes('bucket hat') || lower.includes('bucket-hat') || lower.includes('buckethat')) return 'Bucket Hats';
  if (lower.includes('cardigan')) return 'Cardigans';
  if (lower.includes('sweater')) return 'Sweaters';
  if (lower.includes('two-piece') || lower.includes('set')) return 'Two-Piece Sets';
  if (lower.includes('limited')) return 'Limited Edition';
  if (lower.includes('t-shirt') || lower.includes('tee')) return 'T-Shirts';
  return '';
}

function toTitleCase(value) {
  return value
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function normalizeTitle(value) {
  return value.replace(/[-_]+/g, ' ').replace(/\.(png|jpe?g|webp|avif)$/i, '').replace(/\s+/g, ' ').trim();
}

const overrides = {
  'black t-shirt with giovanni print.png': 'GIOVANNI Core - Black',
  'chocolate brown t-shirt with lettering.png': 'GIOVANNI Core - Chocolate',
  'crisp white t-shirt with _giovanni_ print.png': 'GIOVANNI Core - White',
  "elegant men's cardigan on display.png": 'Elegant Wool Cardigan',
  "men's taupe cardigan on wooden hanger.png": "Men's Taupe Cardigan",
  'stone grey cardigan by giovanni.png': 'Stone Grey Cardigan',
  'elegant beige cardigan on wooden hanger.png': 'Elegant Beige Cardigan',
  'minimalist _giovanni_ t-shirt display.png': 'Giovanni Signature Tee',
  'chatgpt image mar 28, 2026, 10_22_27 am.png': 'Giovanni Lifestyle Image',
  'linen set in off-white(women).png': 'Off-White Linen Set',
  'dusty pink linen set (women).png': 'Dusty Pink Linen Set',
  'sage green linen set (women).png': 'Sage Green Linen Set',
  'charcoal gray linen (women).png': 'Charcoal Gray Linen Set',
  'classic giovanni t-shirts in black.png': 'Classic Giovanni Tee - Black',
  'classic giovanni t-shirts in white.png': 'Classic Giovanni Tee - White',
  'classic giovanni t-shirts in sage.png': 'Classic Giovanni Tee - Sage',
  'premium linen shirt with sleek zipper.png': 'GIOVANNI Premium Zip Shirt',
  'black giovanni crewneck sweater .png': 'Black Giovanni Crewneck Sweater',
  'giovanni sweater signature text.png': 'Giovanni Signature Text Sweater',
  'giovanni sweater with logo.png': 'Giovanni Logo Sweater',
  'sage green sweater embossed monogram.png': 'Sage Green Embossed Monogram Sweater',
  'white linen shirt and pants set(men).png': 'White Linen Shirt & Pants Set',
  'dark grey shirt and pants set(men).png': 'Dark Grey Shirt & Pants Set',
  'sage green linen set flat lay(men).png': 'Sage Green Linen Set',
  'beige linen shirt and pants set (1).png': 'Beige Linen Shirt & Pants Set',
  'giovanni bucket hat.png': 'GIOVANNI Bucket Hat',
};

console.log('filename | normalized | productType | displayName');
files.forEach((f) => {
  const nf = normalize(f);
  const ptype = inferProductType(nf);
  const display = overrides[nf] || toTitleCase(normalizeTitle(f));
  console.log(`${f} | ${nf} | ${ptype || '(none)'} | ${display}`);
});
