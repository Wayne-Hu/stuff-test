import { useState, useCallback } from 'react';
import { fetchReadLater } from '../api/readLater';
import { ReadLaterItem, Storage } from '../types';

export function useReadLater(storage: Storage) {
  const [data, setData] = useState<unknown>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const storeReadLaterList = useCallback(async (list: ReadLaterItem[]) => {
    await storage.setItem(`readLaterList`, JSON.stringify(list));
  }, [storage]);

  const fetchReadLaterList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchReadLater();
      setData(result);
      await storeReadLaterList(result);
    } catch (err) {
      setData(await storage.getItem('readLaterList'));
    } finally {
      setIsLoading(false);
    }
  }, [storeReadLaterList]);

  return {
    fetchReadLaterList,
    data,
    isLoading,
    error,
  };
}
