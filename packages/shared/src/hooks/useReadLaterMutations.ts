import { useState, useCallback } from 'react';
import { addToReadLater, removeFromReadLater } from '../api/readLater';
import type { ReadLaterItem, Storage } from '../types';

const addToStorage = async (storage: Storage, articleId: string) => {
  const readLaterList = await storage.getItem('readLaterList');
  if (readLaterList) {
    JSON.parse(readLaterList).push({
      articleId,
      savedAt: new Date().toISOString(),
    });
    storage.setItem(`readLaterList`, JSON.stringify(readLaterList));
  } else {
    storage.setItem(`readLaterList`, JSON.stringify([{ articleId, savedAt: new Date().toISOString() }]));
  }
};

export function useAddToReadLater(storage: Storage) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (articleId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await addToReadLater(articleId);
      await addToStorage(storage, articleId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

const removeFromStorage = async (storage: Storage, articleId: string) => {
  const readLaterList = await storage.getItem('readLaterList');
  if (readLaterList) {
    const newReadLaterList = JSON.parse(readLaterList).filter((item: ReadLaterItem) => item.articleId !== articleId);
    storage.setItem(`readLaterList`, JSON.stringify(newReadLaterList));
  } else {
    storage.setItem(`readLaterList`, JSON.stringify([]));
  }
};

export function useRemoveFromReadLater(storage: Storage) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (articleId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await removeFromReadLater(articleId);
      await removeFromStorage(storage, articleId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}
