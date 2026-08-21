import { useEffect } from 'react';

const FALLBACK_IMAGE = '/images/juba_fashion_hub_logo.jpg';

/**
 * Recovers images that fail on weak or interrupted mobile connections.
 * Image error events do not bubble, so this listener uses capture mode and
 * protects every storefront image without duplicating handlers in each card.
 */
export function ImageRecovery() {
  useEffect(() => {
    const handleImageError = (event: Event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;

      if (image.dataset.imageRetry !== '1') {
        image.dataset.imageRetry = '1';
        const originalSource = image.currentSrc || image.src;
        const separator = originalSource.includes('?') ? '&' : '?';
        window.setTimeout(() => {
          image.src = `${originalSource}${separator}jfh_retry=${Date.now()}`;
        }, 350);
        return;
      }

      if (!image.src.endsWith(FALLBACK_IMAGE)) {
        image.src = FALLBACK_IMAGE;
        image.classList.add('jfh-image-fallback');
      }
    };

    document.addEventListener('error', handleImageError, true);
    return () => document.removeEventListener('error', handleImageError, true);
  }, []);

  return null;
}
