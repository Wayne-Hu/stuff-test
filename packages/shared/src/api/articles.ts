import { getApiBaseUrl } from '../config';
import type { Article } from '../types';
import { fetchWithTimeout, withRetry } from './client';

export async function fetchArticles(): Promise<Article[]> {
  const res = await withRetry(() => fetchWithTimeout(`${getApiBaseUrl()}/articles`));
  if (!res.ok) throw new Error('Failed to fetch articles');
  const { items } = await res.json();
  return items;
}
