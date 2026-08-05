import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ReadLaterProvider, useReadLater } from '../ReadLaterContext';
import { fetchReadLater, addToReadLater, removeFromReadLater } from '../../api/readLater';
import type { ReadLaterItem, Storage } from '../../types';

jest.mock('../../api/readLater');

const mockFetchReadLater = fetchReadLater as jest.MockedFunction<typeof fetchReadLater>;
const mockAddToReadLater = addToReadLater as jest.MockedFunction<typeof addToReadLater>;
const mockRemoveFromReadLater = removeFromReadLater as jest.MockedFunction<typeof removeFromReadLater>;

function makeStorage(): jest.Mocked<Storage> {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
  };
}

function makeWrapper(storage: Storage) {
  return ({ children }: { children: React.ReactNode }) => (
    <ReadLaterProvider storage={storage}>{children}</ReadLaterProvider>
  );
}

const ITEMS: ReadLaterItem[] = [
  { articleId: 'a1', savedAt: '2024-01-01T00:00:00Z' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

test('throws when used outside ReadLaterProvider', () => {
  expect(() => renderHook(() => useReadLater())).toThrow(
    'useReadLater must be used within ReadLaterProvider',
  );
});

test('loads saved IDs from server on mount', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockResolvedValue(ITEMS);

  const { result } = renderHook(() => useReadLater(), { wrapper: makeWrapper(storage) });
  await act(async () => {});

  expect(result.current.isSaved('a1')).toBe(true);
  expect(result.current.isSaved('unknown')).toBe(false);
  expect(result.current.savedIds.has('a1')).toBe(true);
});

test('optimistically adds item before API resolves', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockResolvedValue([]);
  let resolveAdd!: (v: ReadLaterItem) => void;
  mockAddToReadLater.mockReturnValue(new Promise(r => { resolveAdd = r; }));

  const { result } = renderHook(() => useReadLater(), { wrapper: makeWrapper(storage) });
  await act(async () => {});

  expect(result.current.isSaved('a1')).toBe(false);

  act(() => { result.current.toggle('a1'); });
  expect(result.current.isSaved('a1')).toBe(true);

  await act(async () => { resolveAdd({ articleId: 'a1', savedAt: '' }); });
  expect(result.current.isSaved('a1')).toBe(true);
});

test('rolls back add when API fails', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockResolvedValue([]);
  mockAddToReadLater.mockRejectedValue(new Error('server error'));

  const { result } = renderHook(() => useReadLater(), { wrapper: makeWrapper(storage) });
  await act(async () => {});

  await act(async () => { await result.current.toggle('a1'); });

  expect(result.current.isSaved('a1')).toBe(false);
});

test('optimistically removes item before API resolves', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockResolvedValue(ITEMS);
  let resolveRemove!: () => void;
  mockRemoveFromReadLater.mockReturnValue(new Promise(r => { resolveRemove = r; }));

  const { result } = renderHook(() => useReadLater(), { wrapper: makeWrapper(storage) });
  await act(async () => {});

  expect(result.current.isSaved('a1')).toBe(true);

  act(() => { result.current.toggle('a1'); });
  expect(result.current.isSaved('a1')).toBe(false);

  await act(async () => { resolveRemove(); });
  expect(result.current.isSaved('a1')).toBe(false);
});

test('rolls back remove when API fails', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockResolvedValue(ITEMS);
  mockRemoveFromReadLater.mockRejectedValue(new Error('server error'));

  const { result } = renderHook(() => useReadLater(), { wrapper: makeWrapper(storage) });
  await act(async () => {});

  expect(result.current.isSaved('a1')).toBe(true);

  await act(async () => { await result.current.toggle('a1'); });

  expect(result.current.isSaved('a1')).toBe(true);
});

test('exposes isLoading while fetching', async () => {
  const storage = makeStorage();
  let resolve!: (v: ReadLaterItem[]) => void;
  mockFetchReadLater.mockReturnValue(new Promise(r => { resolve = r; }));

  const { result } = renderHook(() => useReadLater(), { wrapper: makeWrapper(storage) });

  expect(result.current.isLoading).toBe(true);

  await act(async () => { resolve([]); });
  expect(result.current.isLoading).toBe(false);
});
