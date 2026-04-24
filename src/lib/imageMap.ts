// Utility to import all images under src/images and expose a normalized
// key -> URL map suitable for lookups from product.imageKey.

type ImportedImage = string | { default?: string };
const imageModules = import.meta.glob('../images/**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP,AVIF,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, ImportedImage>;

const fileNameFromPath = (p: string) => {
  const raw = p.split('/').pop() || p;
  // strip query/hash if present (importers or plugin transforms may append these)
  return raw.split('?')[0].split('#')[0];
};

const normalizeKey = (fileName: string) => {
  // remove extension
  const name = fileName.replace(/\.(png|jpe?g|webp|avif)$/i, '');
  // lowercase, remove brackets, replace non-alphanum with hyphens
  return name
  .toLowerCase()
  .replace(/\(/g, '')
  .replace(/\)/g, '')
  .replace(/\[/g, '')
  .replace(/\]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
};

export const imageMap: Record<string, string> = Object.entries(imageModules).reduce((acc, [path, url]) => {
  // url can be a string (when import:'default' yields the URL) or an object with { default }
  const resolvedUrl: string | undefined = typeof url === 'string' ? url : url?.default;
  if (!resolvedUrl) return acc;

  const fileName = fileNameFromPath(path);
  const key = normalizeKey(fileName);
  acc[key] = resolvedUrl;
  return acc;
}, {} as Record<string, string>);

export const getImageByKey = (key?: string) => {
  if (!key) return undefined;
  return imageMap[key];
};

export const normalizeImageKey = (value: string) => normalizeKey(value);

export default imageMap;
