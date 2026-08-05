import { renderHook, act } from '@testing-library/react';
import { useReadLater } from '../useReadLater';
import { fetchReadLater } from '../../api/readLater';
import type { ReadLaterItem, Storage } from '../../types';

jest.mock('../../api/readLater');

const mockFetchReadLater = fetchReadLater as jest.MockedFunction<typeof fetchReadLater>;

const ITEMS: ReadLaterItem[] = [
  { articleId: 'a1', addedAt: '2024-01-01T00:00:00Z' },
  { articleId: 'a2', addedAt: '2024-01-02T00:00:00Z' },
];

function makeStorage(initial?: string): jest.Mocked<Storage> {
  const store: Record<string, string> = initial ? { readLaterList: initial } : {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('initial state is idle', () => {
  const storage = makeStorage();
  mockFetchReadLater.mockResolvedValue([]);
  const { result } = renderHook(() => useReadLater(storage));

  expect(result.current.data).toBeUndefined();
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBeNull();
});

test('sets isLoading while fetching', async () => {
  const storage = makeStorage();
  let resolve!: (v: ReadLaterItem[]) => void;
  mockFetchReadLater.mockReturnValue(new Promise(r => { resolve = r; }));

  const { result } = renderHook(() => useReadLater(storage));

  act(() => { result.current.fetchReadLaterList(); });
  expect(result.current.isLoading).toBe(true);

  await act(async () => { resolve(ITEMS); });
  expect(result.current.isLoading).toBe(false);
});

test('sets data and persists to storage on success', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockResolvedValue(ITEMS);

  const { result } = renderHook(() => useReadLater(storage));
  await act(async () => { await result.current.fetchReadLaterList(); });

  expect(result.current.data).toEqual(ITEMS);
  expect(storage.setItem).toHaveBeenCalledWith('readLaterList', JSON.stringify(ITEMS));
});

test('falls back to cached storage value on fetch failure', async () => {
  const cached = JSON.stringify(ITEMS);
  const storage = makeStorage(cached);
  mockFetchReadLater.mockRejectedValue(new Error('offline'));

  const { result } = renderHook(() => useReadLater(storage));
  await act(async () => { await result.current.fetchReadLaterList(); });

  expect(result.current.data).toBe(cached);
  expect(result.current.isLoading).toBe(false);
});

test('falls back to null when storage is empty on failure', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockRejectedValue(new Error('offline'));

  const { result } = renderHook(() => useReadLater(storage));
  await act(async () => { await result.current.fetchReadLaterList(); });

  expect(result.current.data).toBeNull();
});

test('does not expose error state on network failure (falls back silently)', async () => {
  const storage = makeStorage();
  mockFetchReadLater.mockRejectedValue(new Error('offline'));

  const { result } = renderHook(() => useReadLater(storage));
  await act(async () => { await result.current.fetchReadLaterList(); });

  expect(result.current.error).toBeNull();
});
