import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToReadLater, removeFromReadLater } from '../api/readLater';
import { queryKeys } from '../queryKeys';

export function useAddToReadLater() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToReadLater,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readLater });
    },
  });
}

export function useRemoveFromReadLater() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromReadLater,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.readLater });
    },
  });
}
