const IMAGE_WIDTHS = [96, 160, 320, 480, 640, 960, 1200] as const;

function nearestWidth(width: number) {
  return IMAGE_WIDTHS.find((candidate) => candidate >= width) || IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
}

export function optimizeImageUrl(source: string | undefined, requestedWidth = 480): string {
  if (!source) return '';
  if (
    source.startsWith('/_vercel/image')
    || source.startsWith('data:')
    || source.startsWith('blob:')
    || source.toLowerCase().includes('.svg')
  ) return source;

  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return source;
  }

  const width = nearestWidth(requestedWidth);
  return `/_vercel/image?url=${encodeURIComponent(source)}&w=${width}&q=75`;
}

export function optimizeProductImages<T extends { image?: string }>(products: readonly T[], width = 480): T[] {
  return products.map((product) => ({
    ...product,
    image: product.image ? optimizeImageUrl(product.image, width) : product.image,
  }));
}
