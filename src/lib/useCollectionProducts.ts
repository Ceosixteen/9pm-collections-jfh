import { useEffect, useState } from 'react';

// Loads a storefront's products from the Firestore-backed API so the catalogue
// can be managed from the admin dashboard at runtime.
//
// The hardcoded data is passed in as `fallback` and rendered immediately, so
// the page never flashes empty and still works if the API is unreachable —
// live data simply swaps in once it arrives.
export function useCollectionProducts<T>(collectionSlug: string, fallback: readonly T[]): T[] {
  const [products, setProducts] = useState<T[]>(fallback as T[]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/products?collection=${encodeURIComponent(collectionSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setProducts(data as T[]);
        }
      })
      .catch(() => {
        // Keep the fallback catalogue on any network/API failure.
      });

    return () => {
      cancelled = true;
    };
  }, [collectionSlug]);

  return products;
}
