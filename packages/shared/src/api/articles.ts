import { getApiBaseUrl } from '../config';
import type { Article } from '../types';
import { fetchWithTimeout } from './client';

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetchWithTimeout(`${getApiBaseUrl()}/articles`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}
