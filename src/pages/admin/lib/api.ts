// Thin fetch wrapper for the admin dashboard. Always sends the session
// cookie, and surfaces a distinct error so callers can bounce back to the
// login screen on 401 instead of showing a generic failure state.
export class AdminUnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'AdminUnauthorizedError';
  }
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    throw new AdminUnauthorizedError();
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data as T;
}
