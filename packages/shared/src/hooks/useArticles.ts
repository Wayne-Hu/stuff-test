import { useState, useCallback } from 'react';
import { fetchArticles } from '../api/articles';
import type { Article } from '../types';

export function useArticles() {
  const [data, setData] = useState<Article[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchArticles();
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getArticles, data, isLoading, error };
}
