import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { api, http } from '../src/services/api';

// `api` is the configured instance; the refresh call uses the global axios.
const apiMock = new MockAdapter(api);
const axiosMock = new MockAdapter(axios);

beforeEach(() => {
  apiMock.reset();
  axiosMock.reset();
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('http helper', () => {
  it('unwraps the ApiResponse envelope and returns the body', async () => {
    apiMock.onGet('/campaigns').reply(200, { success: true, data: [{ id: 'c1' }], message: 'ok' });
    const res = await http.get<{ id: string }[]>('/campaigns');
    expect(res.success).toBe(true);
    expect(res.data).toEqual([{ id: 'c1' }]);
  });

  it('forwards query params', async () => {
    apiMock.onGet('/campaigns').reply((config) => {
      expect(config.params).toMatchObject({ page: 2 });
      return [200, { success: true, data: [], message: 'ok' }];
    });
    await http.get('/campaigns', { page: 2 });
  });
});

describe('request interceptor', () => {
  it('attaches the access token from localStorage as a Bearer header', async () => {
    localStorage.setItem('accessToken', 'tok-123');
    apiMock.onGet('/auth/me').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer tok-123');
      return [200, { success: true, data: {}, message: 'ok' }];
    });
    await http.get('/auth/me');
  });

  it('sends no Authorization header when there is no token', async () => {
    apiMock.onGet('/auth/me').reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, { success: true, data: {}, message: 'ok' }];
    });
    await http.get('/auth/me');
  });
});

describe('401 refresh flow', () => {
  it('refreshes the token on 401 and retries the original request', async () => {
    localStorage.setItem('accessToken', 'stale');
    localStorage.setItem('refreshToken', 'refresh-1');

    // First call 401s once, succeeds on retry.
    let calls = 0;
    apiMock.onGet('/protected').reply(() => {
      calls += 1;
      return calls === 1 ? [401, { success: false, message: 'expired', data: null }]
                         : [200, { success: true, data: { ok: true }, message: 'ok' }];
    });
    axiosMock.onPost(/\/auth\/refresh$/).reply(200, {
      success: true,
      data: { accessToken: 'fresh', refreshToken: 'refresh-2' },
      message: 'ok',
    });

    const res = await http.get<{ ok: boolean }>('/protected');
    expect(res.data).toEqual({ ok: true });
    expect(calls).toBe(2);
    expect(localStorage.getItem('accessToken')).toBe('fresh');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-2');
  });

  it('clears storage when there is no refresh token to use', async () => {
    // jsdom throws on real navigation; stub location so the interceptor can assign href.
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
    localStorage.setItem('accessToken', 'stale');

    apiMock.onGet('/protected').reply(401, { success: false, message: 'expired', data: null });

    await expect(http.get('/protected')).rejects.toBeTruthy();
    expect(localStorage.getItem('accessToken')).toBeNull();

    Object.defineProperty(window, 'location', { value: original, writable: true });
  });
});
