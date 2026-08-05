import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReadLaterItem, Storage } from '../types';
import { useReadLater as useReadLaterHook } from '../hooks/useReadLater';
import { addToReadLater, removeFromReadLater } from '../api/readLater';

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
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReadLaterList();
  }, [fetchReadLaterList]);

  // Keep savedIds in sync with server data after fetches
  useEffect(() => {
    setSavedIds(new Set(parseItems(data).map((i) => i.articleId)));
  }, [data]);

  const toggle = useCallback(
    async (articleId: string) => {
      const wasSaved = savedIds.has(articleId);

      // Optimistic update — flip immediately so the UI responds at once
      setSavedIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.delete(articleId) : next.add(articleId);
        return next;
      });

      try {
        if (wasSaved) {
          await removeFromReadLater(articleId);
        } else {
          await addToReadLater(articleId);
        }
        // Best-effort background sync — don't await so a GET failure can't
        // clobber the optimistic state via the data→useEffect→setSavedIds path.
        fetchReadLaterList().catch(() => {});
      } catch {
        // Rollback to pre-toggle state on failure
        setSavedIds((prev) => {
          const next = new Set(prev);
          wasSaved ? next.add(articleId) : next.delete(articleId);
          return next;
        });
        // Re-sync from server so diverged state (e.g. a timed-out mutation that
        // the server processed) is corrected on the next render.
        fetchReadLaterList().catch(() => {});
      }
    },
    [savedIds, fetchReadLaterList]
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
