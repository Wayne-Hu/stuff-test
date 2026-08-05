import { useQuery } from '@tanstack/react-query';
import { fetchReadLater } from '../api/readLater';
import { queryKeys } from '../queryKeys';

export function useReadLater() {
  return useQuery({
    queryKey: queryKeys.readLater,
    queryFn: fetchReadLater,
  });
}
