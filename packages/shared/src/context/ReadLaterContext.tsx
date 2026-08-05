import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ReadLaterItem, Storage } from '../types';
import { useReadLater as useReadLaterHook } from '../hooks/useReadLater';
import { useAddToReadLater, useRemoveFromReadLater } from '../hooks/useReadLaterMutations';

function parseItems(data: unknown): ReadLaterItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as ReadLaterItem[];
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

interface ReadLaterContextValue {
  savedIds: Set<string>;
  isLoading: boolean;
  isSaved: (articleId: string) => boolean;
  toggle: (articleId: string) => Promise<void>;
}

const ReadLaterContext = createContext<ReadLaterContextValue | null>(null);

interface ReadLaterProviderProps {
  children: React.ReactNode;
  storage: Storage;
}

export function ReadLaterProvider({ children, storage }: ReadLaterProviderProps) {
  const { fetchReadLaterList, data, isLoading } = useReadLaterHook(storage);
  const { mutate: add } = useAddToReadLater(storage);
  const { mutate: remove } = useRemoveFromReadLater(storage);

  useEffect(() => {
    fetchReadLaterList();
  }, [fetchReadLaterList]);

  const savedIds = useMemo(
    () => new Set(parseItems(data).map((i) => i.articleId)),
    [data]
  );

  const toggle = useCallback(
    async (articleId: string) => {
      if (savedIds.has(articleId)) {
        await remove(articleId);
      } else {
        await add(articleId);
      }
      await fetchReadLaterList();
    },
    [savedIds, add, remove, fetchReadLaterList]
  );

  const isSaved = useCallback((articleId: string) => savedIds.has(articleId), [savedIds]);

  const value = useMemo(
    () => ({ savedIds, isLoading, isSaved, toggle }),
    [savedIds, isLoading, isSaved, toggle]
  );

  return <ReadLaterContext.Provider value={value}>{children}</ReadLaterContext.Provider>;
}

export function useReadLater() {
  const ctx = useContext(ReadLaterContext);
  if (!ctx) throw new Error('useReadLater must be used within ReadLaterProvider');
  return ctx;
}
