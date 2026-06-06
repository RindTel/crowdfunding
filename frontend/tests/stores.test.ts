import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the api module the auth store depends on.
vi.mock('../src/services/api', () => ({
  http: { post: vi.fn(), get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { http } from '../src/services/api';
import { useAuthStore } from '../src/store/auth.store';
import { useThemeStore } from '../src/store/theme.store';
import { useNotificationStore } from '../src/store/notifications.store';

const mockedHttp = vi.mocked(http);

function resetAuth() {
  useAuthStore.setState({
    user: null, accessToken: null, refreshToken: null,
    isAuthenticated: false, isLoading: false,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  resetAuth();
});

describe('auth store', () => {
  const tokens = { accessToken: 'acc', refreshToken: 'ref' };
  const user = {
    id: 'u1', email: 'jane@f.io', firstName: 'Jane', lastName: 'C',
    avatarUrl: null, isVerified: true, roles: ['CREATOR', 'DONOR'], createdAt: '2025-01-01',
  };

  it('login stores user, flips isAuthenticated, and persists tokens', async () => {
    mockedHttp.post.mockResolvedValue({ success: true, message: 'ok', data: { user, tokens } });

    await useAuthStore.getState().login('jane@f.io', 'pw');

    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.email).toBe('jane@f.io');
    expect(s.accessToken).toBe('acc');
    expect(localStorage.getItem('accessToken')).toBe('acc');
    expect(localStorage.getItem('refreshToken')).toBe('ref');
  });

  it('login resets isLoading even when the request fails', async () => {
    mockedHttp.post.mockRejectedValue(new Error('bad creds'));
    await expect(useAuthStore.getState().login('x', 'y')).rejects.toThrow('bad creds');
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('logout clears state and tokens', async () => {
    useAuthStore.setState({ user, accessToken: 'acc', refreshToken: 'ref', isAuthenticated: true });
    localStorage.setItem('accessToken', 'acc');
    mockedHttp.post.mockResolvedValue({ success: true, message: 'ok', data: null });

    await useAuthStore.getState().logout();

    const s = useAuthStore.getState();
    expect(s.isAuthenticated).toBe(false);
    expect(s.user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('hasRole reflects the current user roles', () => {
    useAuthStore.setState({ user });
    expect(useAuthStore.getState().hasRole('CREATOR')).toBe(true);
    expect(useAuthStore.getState().hasRole('ADMIN')).toBe(false);
    resetAuth();
    expect(useAuthStore.getState().hasRole('DONOR')).toBe(false);
  });
});

describe('theme store', () => {
  beforeEach(() => {
    useThemeStore.setState({ isDark: false });
    document.documentElement.classList.remove('dark');
  });

  it('toggle flips isDark and the <html> dark class', () => {
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setDark applies the requested value directly', () => {
    useThemeStore.getState().setDark(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('notifications store', () => {
  beforeEach(() => useNotificationStore.setState({ readIds: [] }));

  it('markRead adds an id once (no duplicates)', () => {
    useNotificationStore.getState().markRead('a');
    useNotificationStore.getState().markRead('a');
    expect(useNotificationStore.getState().readIds).toEqual(['a']);
  });

  it('markAllRead unions ids without duplicating existing ones', () => {
    useNotificationStore.setState({ readIds: ['a'] });
    useNotificationStore.getState().markAllRead(['a', 'b', 'c']);
    expect(useNotificationStore.getState().readIds.sort()).toEqual(['a', 'b', 'c']);
  });
});
