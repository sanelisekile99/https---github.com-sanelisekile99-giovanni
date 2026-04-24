const imageModules = import.meta.glob('../images/**/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG,WEBP,AVIF}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const imagesByFileName = Object.entries(imageModules).reduce<Record<string, string>>((acc, [path, url]) => {
  let fileName = path.split('/').pop()?.toLowerCase();
  if (fileName) {
    // Normalize a common misspelling in the image filenames so lookup and
    // heuristics (product type / display name) remain correct even when the
    // source file was named incorrectly (e.g. "backet" instead of "bucket").
    fileName = fileName.replace(/backet/g, 'bucket');
    acc[fileName] = url;
  }
  return acc;
}, {});

const stripQueryString = (value: string) => value.split('?')[0].split('#')[0];

const extractFileName = (value: string) => {
  const cleanValue = stripQueryString(value.trim());
  // Normalize the extracted filename as well so downstream lookups match the
  // normalized index keys above.
  return cleanValue.split('/').pop()?.toLowerCase().replace(/backet/g, 'bucket');
};

const findImportedImage = (value: string) => {
  const fileName = extractFileName(value);
  if (fileName && imagesByFileName[fileName]) {
    return imagesByFileName[fileName];
  }

  const normalized = stripQueryString(value.trim()).toLowerCase().replace(/backet/g, 'bucket');

  // Fall back to a safer token-based match: require that every significant
  // word in the normalized query appears in the candidate filename. This
  // avoids accidental matches when two files share a common short token like
  // "giovanni" or "tshirt".
  const tokens = normalized
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean);

  return Object.entries(imagesByFileName).find(([candidateFileName]) => {
    const candidate = candidateFileName.toLowerCase();
    return tokens.length > 0 && tokens.every((t) => candidate.includes(t));
  })?.[1];
};

// Keep a stable, deterministic ordering for imageFiles so derived product
// lists (and collection positions) are reproducible across runs and builds.
export const imageFiles = Object.keys(imagesByFileName).sort();

const findByName = (name: string) => {
  const normalized = name.toLowerCase();

  // Prefer exact-ish matches (all tokens present), falling back to a simple
  // includes if no strong candidate is found. This reduces accidental
  // cross-matching between categories (e.g. bucket hat vs t-shirt).
  const tokens = normalized.replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean);
  const strong = Object.entries(imagesByFileName).find(([fileName]) => tokens.length > 0 && tokens.every(t => fileName.includes(t)));
  if (strong) return strong[1];

  return Object.entries(imagesByFileName).find(([fileName]) => fileName.includes(normalized))?.[1];
};

export const imageCatalog = {
  blackTShirt: findByName('black t-shirt with giovanni print.png'),
  chocolateTShirt: findByName('chocolate brown t-shirt with lettering.png'),
  whiteTShirt: findByName('crisp white t-shirt with _giovanni_ print.png'),
  ecruTShirt: findByName('ecru t-shirt with giovanni print.png'),
  sweater: findByName('sweater') || findByName('ecru sweater'),
  classicGiovanniTShirt:
    findByName('classic giovanni t-shirts in black') ||
    findByName('classic giovanni t-shirts in white') ||
    findByName('classic giovanni t-shirts in sage') ||
    findByName('classic giovanni'),
  premiumLinenShirt: findByName('premium linen shirt with sleek zipper.png') || findByName('premium linen shirt with sleek zipper'),
  womenLinenSet:
    findByName('linen set in off-white(women)') ||
    findByName('dusty pink linen set (women)') ||
    findByName('sage green linen set (women)') ||
    findByName('linen set (women)') ||
    findByName('linen (women)'),
  menLinenSet:
    findByName('white linen shirt and pants set(men)') ||
    findByName('dark grey shirt and pants set(men)') ||
    findByName('sage green linen set flat lay(men)') ||
    findByName('beige linen shirt and pants set') ||
    findByName('linen set (men)') ||
    findByName('(men)'),
  bucketHat:
  findByName('giovanni bucket hat.png') ||
  findByName('black bucket hat logo.png') ||
  findByName('blue denim backet hat.png') ||
  findByName('blue denim bucket hat.png') ||
  findByName('elegant cream crochet bucket hat.png') ||
  findByName('off-white bucket hat details.png') ||
  findByName('sage green bucket hat details.png') ||
  findByName('bucket hat') ||
  findByName('bucket-hat') ||
  findByName('buckethat'),
  sageGreenBucketHat: findByName('sage green bucket hat') || findByName('sage green bucket hat.png') || findByName('sage_green_bucket_hat'),
  campaignHero:
    findByName('giovanni clothing collection showcase') ||
    findByName('collection showcase'),
  hero: findByName('minimalist _giovanni_ t-shirt display.png'),
  lifestyle: findByName('chatgpt image mar 28, 2026, 10_22_27 am.png'),
  // Explicit formal shirt entries (newly added files)
  formalBlack: findByName('black giovanni formal shirt.png'),
  formalBlue: findByName('blue giovanni formal shirt.png'),
  formalNavy: findByName('navy giovanni formal shirt.png'),
  formalWhite: findByName('white giovanni formal shirt.png'),
  formalShirt:
    findByName('black giovanni formal shirt.png') ||
    findByName('blue giovanni formal shirt.png') ||
    findByName('navy giovanni formal shirt.png') ||
    findByName('white giovanni formal shirt.png'),
};

export const resolveImageSrc = (value?: string) => {
  if (!value) return undefined;
  const src = value.trim();
  if (!src) return undefined;
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('/assets/')
  ) {
    return src;
  }

  const importedImage = findImportedImage(src);
  if (importedImage) {
    return importedImage;
  }

  if (src.startsWith('/src/images/') || src.startsWith('src/images/') || src.startsWith('./images/') || src.startsWith('images/')) {
    const fileName = extractFileName(src);
    if (fileName) {
      return getImageByFileName(fileName);
    }
  }

  return src.startsWith('/') ? src : encodeURI(`/${src}`);
};

export const getImageByFileName = (fileName: string) => {
  const importedImage = findImportedImage(fileName);
  if (importedImage) {
    return importedImage;
  }

  return imagesByFileName[fileName.toLowerCase()];
};

