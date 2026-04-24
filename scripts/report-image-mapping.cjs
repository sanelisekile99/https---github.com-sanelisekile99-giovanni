const fs = require('fs');
const path = require('path');
const imgDir = path.join(__dirname, '..', 'src', 'images');
const files = fs.readdirSync(imgDir);
const normalize = (file) => file.replace(/\.(png|jpe?g|webp|avif)$/i, '').toLowerCase().replace(/[\[\]()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const infer = (file) => {
  const lower = file.toLowerCase();
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
};

const imageKeys = new Set(files.map(f => normalize(f)));

console.log('file | productType | normalizedKey | keyExists');
files.forEach(f => {
  const pt = infer(f);
  if (!pt) return; // skip non-product images
  const key = normalize(f);
  console.log(`${f} | ${pt} | ${key} | ${imageKeys.has(key) ? 'YES' : 'NO'}`);
});

// Also show bucket-hat candidates specifically
console.log('\nBucket hat candidates (by filename token):');
files.filter(f => f.toLowerCase().includes('bucket')).forEach(f => {
  console.log(`- ${f} -> ${normalize(f)}`);
});
