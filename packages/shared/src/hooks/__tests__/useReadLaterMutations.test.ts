import { renderHook, act } from '@testing-library/react';
import { useAddToReadLater, useRemoveFromReadLater } from '../useReadLaterMutations';
import { addToReadLater, removeFromReadLater } from '../../api/readLater';
import type { ReadLaterItem, Storage } from '../../types';

jest.mock('../../api/readLater');

const mockAddToReadLater = addToReadLater as jest.MockedFunction<typeof addToReadLater>;
const mockRemoveFromReadLater = removeFromReadLater as jest.MockedFunction<typeof removeFromReadLater>;

function makeStorage(initial?: ReadLaterItem[]): jest.Mocked<Storage> {
  const store: Record<string, string> = initial ? { readLaterList: JSON.stringify(initial) } : {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
  };
}

const EXISTING: ReadLaterItem[] = [{ articleId: 'existing', addedAt: '2024-01-01T00:00:00Z' }];

beforeEach(() => {
  jest.clearAllMocks();
});

// --- useAddToReadLater ---

describe('useAddToReadLater', () => {
  test('initial state is idle', () => {
    const storage = makeStorage();
    const { result } = renderHook(() => useAddToReadLater(storage));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('sets isLoading while mutating', async () => {
    const storage = makeStorage();
    let resolve!: (v: ReadLaterItem) => void;
    mockAddToReadLater.mockReturnValue(new Promise(r => { resolve = r; }));

    const { result } = renderHook(() => useAddToReadLater(storage));

    act(() => { result.current.mutate('a1'); });
    expect(result.current.isLoading).toBe(true);

    await act(async () => { resolve({ articleId: 'a1', addedAt: '' }); });
    expect(result.current.isLoading).toBe(false);
  });

  test('calls API with articleId', async () => {
    const storage = makeStorage();
    mockAddToReadLater.mockResolvedValue({ articleId: 'a1', addedAt: '' });

    const { result } = renderHook(() => useAddToReadLater(storage));
    await act(async () => { await result.current.mutate('a1'); });

    expect(mockAddToReadLater).toHaveBeenCalledWith('a1');
  });

  test('writes new item to storage when list is empty', async () => {
    const storage = makeStorage();
    mockAddToReadLater.mockResolvedValue({ articleId: 'a1', addedAt: '' });

    const { result } = renderHook(() => useAddToReadLater(storage));
    await act(async () => { await result.current.mutate('a1'); });

    expect(storage.setItem).toHaveBeenCalledWith(
      'readLaterList',
      expect.stringContaining('"articleId":"a1"'),
    );
  });

  test('sets error on API failure', async () => {
    const storage = makeStorage();
    mockAddToReadLater.mockRejectedValue(new Error('server error'));

    const { result } = renderHook(() => useAddToReadLater(storage));
    await act(async () => { await result.current.mutate('a1'); });

    expect(result.current.error).toEqual(new Error('server error'));
    expect(result.current.isLoading).toBe(false);
  });

  test('wraps non-Error rejections in Error', async () => {
    const storage = makeStorage();
    mockAddToReadLater.mockRejectedValue('oops');

    const { result } = renderHook(() => useAddToReadLater(storage));
    await act(async () => { await result.current.mutate('a1'); });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('oops');
  });

  test('clears previous error on retry', async () => {
    const storage = makeStorage();
    mockAddToReadLater.mockRejectedValueOnce(new Error('fail'));
    mockAddToReadLater.mockResolvedValueOnce({ articleId: 'a1', addedAt: '' });

    const { result } = renderHook(() => useAddToReadLater(storage));
    await act(async () => { await result.current.mutate('a1'); });
    expect(result.current.error).not.toBeNull();

    await act(async () => { await result.current.mutate('a1'); });
    expect(result.current.error).toBeNull();
  });
});

// --- useRemoveFromReadLater ---

describe('useRemoveFromReadLater', () => {
  test('initial state is idle', () => {
    const storage = makeStorage();
    const { result } = renderHook(() => useRemoveFromReadLater(storage));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('sets isLoading while mutating', async () => {
    const storage = makeStorage(EXISTING);
    let resolve!: () => void;
    mockRemoveFromReadLater.mockReturnValue(new Promise(r => { resolve = r; }));

    const { result } = renderHook(() => useRemoveFromReadLater(storage));

    act(() => { result.current.mutate('existing'); });
    expect(result.current.isLoading).toBe(true);

    await act(async () => { resolve(); });
    expect(result.current.isLoading).toBe(false);
  });

  test('calls API with articleId', async () => {
    const storage = makeStorage(EXISTING);
    mockRemoveFromReadLater.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveFromReadLater(storage));
    await act(async () => { await result.current.mutate('existing'); });

    expect(mockRemoveFromReadLater).toHaveBeenCalledWith('existing');
  });

  test('removes item from storage', async () => {
    const storage = makeStorage(EXISTING);
    mockRemoveFromReadLater.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveFromReadLater(storage));
    await act(async () => { await result.current.mutate('existing'); });

    const calls = storage.setItem.mock.calls as [string, string][];
    const stored = calls[calls.length - 1][1];
    expect(JSON.parse(stored)).not.toContainEqual(
      expect.objectContaining({ articleId: 'existing' }),
    );
  });

  test('writes empty array to storage when list is empty', async () => {
    const storage = makeStorage();
    mockRemoveFromReadLater.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveFromReadLater(storage));
    await act(async () => { await result.current.mutate('missing'); });

    expect(storage.setItem).toHaveBeenCalledWith('readLaterList', JSON.stringify([]));
  });

  test('sets error on API failure', async () => {
    const storage = makeStorage(EXISTING);
    mockRemoveFromReadLater.mockRejectedValue(new Error('server error'));

    const { result } = renderHook(() => useRemoveFromReadLater(storage));
    await act(async () => { await result.current.mutate('existing'); });

    expect(result.current.error).toEqual(new Error('server error'));
    expect(result.current.isLoading).toBe(false);
  });

  test('wraps non-Error rejections in Error', async () => {
    const storage = makeStorage(EXISTING);
    mockRemoveFromReadLater.mockRejectedValue('oops');

    const { result } = renderHook(() => useRemoveFromReadLater(storage));
    await act(async () => { await result.current.mutate('existing'); });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('oops');
  });

  test('clears previous error on retry', async () => {
    const storage = makeStorage(EXISTING);
    mockRemoveFromReadLater.mockRejectedValueOnce(new Error('fail'));
    mockRemoveFromReadLater.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useRemoveFromReadLater(storage));
    await act(async () => { await result.current.mutate('existing'); });
    expect(result.current.error).not.toBeNull();

    await act(async () => { await result.current.mutate('existing'); });
    expect(result.current.error).toBeNull();
  });
});
