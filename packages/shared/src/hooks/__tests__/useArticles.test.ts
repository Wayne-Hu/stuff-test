import { renderHook, act } from '@testing-library/react';
import { useArticles } from '../useArticles';
import { fetchArticles } from '../../api/articles';
import type { Article } from '../../types';

jest.mock('../../api/articles');

const mockFetchArticles = fetchArticles as jest.MockedFunction<typeof fetchArticles>;

const ARTICLES: Article[] = [
  { id: '1', title: 'First', summary: 'Sum', publishedAt: '2024-01-01', imageUrl: 'img.png', section: 'tech' },
  { id: '2', title: 'Second', summary: 'Sum2', publishedAt: '2024-01-02', imageUrl: 'img2.png', section: 'sport' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

test('initial state is idle', () => {
  mockFetchArticles.mockResolvedValue([]);
  const { result } = renderHook(() => useArticles());
  expect(result.current.data).toBeUndefined();
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBeNull();
});

test('sets isLoading while fetching', async () => {
  let resolve!: (v: Article[]) => void;
  mockFetchArticles.mockReturnValue(new Promise(r => { resolve = r; }));

  const { result } = renderHook(() => useArticles());

  act(() => { result.current.getArticles(); });
  expect(result.current.isLoading).toBe(true);

  await act(async () => { resolve(ARTICLES); });
  expect(result.current.isLoading).toBe(false);
});

test('populates data on success', async () => {
  mockFetchArticles.mockResolvedValue(ARTICLES);

  const { result } = renderHook(() => useArticles());
  await act(async () => { await result.current.getArticles(); });

  expect(result.current.data).toEqual(ARTICLES);
  expect(result.current.error).toBeNull();
});

test('returns fetched articles from getArticles', async () => {
  mockFetchArticles.mockResolvedValue(ARTICLES);

  const { result } = renderHook(() => useArticles());
  let returned: Article[] | undefined;
  await act(async () => { returned = await result.current.getArticles(); });

  expect(returned).toEqual(ARTICLES);
});

test('sets error and clears data on failure', async () => {
  mockFetchArticles.mockRejectedValue(new Error('network error'));

  const { result } = renderHook(() => useArticles());
  await act(async () => { await result.current.getArticles(); });

  expect(result.current.error).toEqual(new Error('network error'));
  expect(result.current.data).toBeUndefined();
  expect(result.current.isLoading).toBe(false);
});

test('wraps non-Error rejections in Error', async () => {
  mockFetchArticles.mockRejectedValue('plain string error');

  const { result } = renderHook(() => useArticles());
  await act(async () => { await result.current.getArticles(); });

  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.error?.message).toBe('plain string error');
});

test('clears previous error on retry', async () => {
  mockFetchArticles.mockRejectedValueOnce(new Error('fail'));
  mockFetchArticles.mockResolvedValueOnce(ARTICLES);

  const { result } = renderHook(() => useArticles());
  await act(async () => { await result.current.getArticles(); });
  expect(result.current.error).not.toBeNull();

  await act(async () => { await result.current.getArticles(); });
  expect(result.current.error).toBeNull();
  expect(result.current.data).toEqual(ARTICLES);
});
