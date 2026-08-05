import { useQuery } from '@tanstack/react-query';
import { fetchArticles } from '../api/articles';
import { queryKeys } from '../queryKeys';

export function useArticles() {
  return useQuery({
    queryKey: queryKeys.articles,
    queryFn: fetchArticles,
  });
}
