const TIMEOUT_MS = 5_000;

export class NetworkTimeoutError extends Error {
  constructor(url: string) {
    super(`Request timed out after ${TIMEOUT_MS}ms: ${url}`);
    this.name = 'NetworkTimeoutError';
  }
}

export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new NetworkTimeoutError(url);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
