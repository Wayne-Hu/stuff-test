let baseUrl = 'http://localhost:3001';

export function setApiBaseUrl(url: string): void {
  baseUrl = url;
}

export function getApiBaseUrl(): string {
  return baseUrl;
}
