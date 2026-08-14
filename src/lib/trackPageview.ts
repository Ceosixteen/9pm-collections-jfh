// Fire-and-forget page-view tracking for the admin dashboard's "Landing
// Pages" traffic view. Never throws and never blocks rendering — a failed
// or slow tracking call should never be visible to a real visitor.
export function trackPageview(storeSlug: string) {
  fetch('/api/track-pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeSlug, path: window.location.pathname }),
  }).catch(() => {
    // Ignore — tracking failures should be invisible to the visitor.
  });
}
