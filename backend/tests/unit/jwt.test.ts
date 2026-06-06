import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
} from '../../src/utils/jwt';
import { ApiError } from '../../src/types/errors';

const payload = { sub: 'user-1', email: 'a@b.io', roles: ['DONOR'] };

describe('jwt utils', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.roles).toEqual(payload.roles);
    expect(decoded.iat).toBeTypeOf('number');
    expect(decoded.exp).toBeTypeOf('number');
  });

  it('rejects a tampered/invalid access token with a 401 ApiError', () => {
    try {
      verifyAccessToken('not.a.real.token');
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(401);
    }
  });

  it('does not accept an access token as a refresh token (separate secrets)', () => {
    const access = signAccessToken(payload);
    expect(() => verifyRefreshToken(access)).toThrow(ApiError);
  });

  it('signs unique refresh tokens for the same user (jti)', () => {
    const a = signRefreshToken('user-1');
    const b = signRefreshToken('user-1');
    expect(a).not.toBe(b);
    expect(verifyRefreshToken(a).sub).toBe('user-1');
  });

  it('generateTokenPair returns a verifiable access + refresh pair', () => {
    const { accessToken, refreshToken } = generateTokenPair(payload);
    expect(verifyAccessToken(accessToken).sub).toBe('user-1');
    expect(verifyRefreshToken(refreshToken).sub).toBe('user-1');
  });
});
