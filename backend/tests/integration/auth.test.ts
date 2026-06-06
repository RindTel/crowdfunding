import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

// ── Mock the Prisma singleton so the whole stack runs without a database ──
const { prismaMock } = vi.hoisted(() => {
  const model = () => ({
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
    delete: vi.fn(),
  });
  return {
    prismaMock: {
      user: model(), role: model(), userRole: model(), donor: model(), creator: model(),
      refreshToken: model(), campaign: model(), reward: model(), donation: model(),
      payment: model(), category: model(),
      $transaction: vi.fn(),
    },
  };
});
vi.mock('../../src/config/database', () => ({ prisma: prismaMock }));

import app from '../../src/app';
import { signAccessToken } from '../../src/utils/jwt';

const PASSWORD = 'Admin123!';

function fakeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'jane@fundforge.io',
    passwordHash: bcrypt.hashSync(PASSWORD, 4),
    firstName: 'Jane',
    lastName: 'Creator',
    avatarUrl: null,
    isVerified: true,
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    userRoles: [{ role: { name: 'DONOR' } }],
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === 'function' ? (arg as (tx: unknown) => unknown)(prismaMock) : Promise.all(arg as unknown[])
  );
});

describe('POST /api/v1/auth/register', () => {
  it('registers a new donor and returns a token pair', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(fakeUser({ isVerified: false, userRoles: [] }));
    prismaMock.role.findUnique.mockResolvedValue({ id: 'role-donor', name: 'DONOR' });
    prismaMock.userRole.create.mockResolvedValue({});
    prismaMock.donor.create.mockResolvedValue({ id: 'donor-1' });
    prismaMock.refreshToken.create.mockResolvedValue({});

    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'new@fundforge.io', password: PASSWORD, firstName: 'New', lastName: 'User',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.roles).toEqual(['DONOR']);
    expect(res.body.data.tokens.accessToken).toBeTypeOf('string');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a duplicate email with 409', async () => {
    prismaMock.user.findFirst.mockResolvedValue(fakeUser());
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'jane@fundforge.io', password: PASSWORD, firstName: 'Jane', lastName: 'C',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects a weak password with 400 and field errors', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'ok@fundforge.io', password: 'alllowercase', firstName: 'A', lastName: 'B',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with valid credentials', async () => {
    prismaMock.user.findFirst.mockResolvedValue(fakeUser());
    prismaMock.refreshToken.create.mockResolvedValue({});

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'jane@fundforge.io', password: PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeTypeOf('string');
    expect(res.body.data.user.email).toBe('jane@fundforge.io');
  });

  it('rejects a wrong password with 401', async () => {
    prismaMock.user.findFirst.mockResolvedValue(fakeUser());
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'jane@fundforge.io', password: 'WrongPass1',
    });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with 401', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'ghost@fundforge.io', password: PASSWORD,
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns 401 without a bearer token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the profile for a valid token', async () => {
    prismaMock.user.findFirst.mockResolvedValue(fakeUser());
    const token = signAccessToken({ sub: 'user-1', email: 'jane@fundforge.io', roles: ['DONOR'] });
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('jane@fundforge.io');
    expect(res.body.data.roles).toEqual(['DONOR']);
  });
});
