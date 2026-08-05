import { getApiBaseUrl } from '../config';
import type { ReadLaterItem } from '../types';
import { fetchWithTimeout } from './client';

export async function fetchReadLater(): Promise<ReadLaterItem[]> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/read-later`);
  if (!res.ok) throw new Error('Failed to fetch read later list');
  return res.json();
}

export async function addToReadLater(articleId: string): Promise<ReadLaterItem> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/read-later`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleId }),
  });
  if (!res.ok) throw new Error('Failed to add article to read later');
  return res.json();
}

export async function removeFromReadLater(articleId: string): Promise<void> {
  const res = await fetchWithTimeout(
    `${getApiBaseUrl()}/read-later/${encodeURIComponent(articleId)}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error('Failed to remove article from read later');
}
