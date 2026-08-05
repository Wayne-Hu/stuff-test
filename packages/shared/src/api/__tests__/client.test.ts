import { NetworkTimeoutError, withRetry, fetchWithTimeout } from '../client';

describe('NetworkTimeoutError', () => {
  test('is an instance of Error', () => {
    expect(new NetworkTimeoutError('http://example.com')).toBeInstanceOf(Error);
  });

  test('has name NetworkTimeoutError', () => {
    expect(new NetworkTimeoutError('http://example.com').name).toBe('NetworkTimeoutError');
  });

  test('includes the URL in the message', () => {
    expect(new NetworkTimeoutError('http://example.com').message).toContain('http://example.com');
  });
});

describe('withRetry', () => {
  test('returns value on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    await expect(withRetry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on NetworkTimeoutError and returns value on subsequent success', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new NetworkTimeoutError('url'))
      .mockResolvedValue('ok');
    await expect(withRetry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('throws non-timeout errors immediately without retrying', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('auth error'));
    await expect(withRetry(fn)).rejects.toThrow('auth error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('throws after exhausting all retries', async () => {
    const fn = jest.fn().mockRejectedValue(new NetworkTimeoutError('url'));
    await expect(withRetry(fn)).rejects.toBeInstanceOf(NetworkTimeoutError);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('fetchWithTimeout', () => {
  const g = globalThis as typeof globalThis & { fetch: jest.Mock };

  beforeEach(() => {
    g.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns the response on success', async () => {
    const mockResponse = { ok: true, status: 200 } as unknown as Response;
    g.fetch.mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout('http://example.com');
    expect(result).toBe(mockResponse);
    expect(g.fetch).toHaveBeenCalledWith(
      'http://example.com',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test('forwards options to fetch', async () => {
    const mockResponse = { ok: true, status: 200 } as unknown as Response;
    g.fetch.mockResolvedValue(mockResponse);

    await fetchWithTimeout('http://example.com', { method: 'POST' });
    expect(g.fetch).toHaveBeenCalledWith(
      'http://example.com',
      expect.objectContaining({ method: 'POST', signal: expect.any(AbortSignal) }),
    );
  });

  test('throws NetworkTimeoutError when fetch is aborted', async () => {
    g.fetch.mockImplementation(() => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });

    await expect(fetchWithTimeout('http://example.com')).rejects.toBeInstanceOf(NetworkTimeoutError);
  });

  test('propagates non-abort errors unchanged', async () => {
    g.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchWithTimeout('http://example.com')).rejects.toThrow('Failed to fetch');
    await expect(fetchWithTimeout('http://example.com')).rejects.not.toBeInstanceOf(NetworkTimeoutError);
  });
});
