export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${import.meta.env.VITE_API_URL ?? ''}${path}`, init)