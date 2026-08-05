import { getApiBaseUrl } from '../config';
import type { Article } from '../types';

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${getApiBaseUrl()}/articles`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}
