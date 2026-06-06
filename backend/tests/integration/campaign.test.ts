import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const { prismaMock } = vi.hoisted(() => {
  const model = () => ({
    findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(),
    update: vi.fn(), updateMany: vi.fn(), count: vi.fn(), aggregate: vi.fn(),
    groupBy: vi.fn(), delete: vi.fn(),
  });
  return {
    prismaMock: {
      user: model(), campaign: model(), creator: model(), category: model(),
      reward: model(), donation: model(),
      $transaction: vi.fn(),
    },
  };
});
vi.mock('../../src/config/database', () => ({ prisma: prismaMock }));

import app from '../../src/app';
import { signAccessToken } from '../../src/utils/jwt';

function campaignRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'camp-1',
    title: 'Eco Smart Water Purifier',
    slug: 'eco-smart-water-purifier',
    goalAmount: 50000,
    raisedAmount: 32500,
    minDonation: null,
    maxDonation: null,
    status: 'ACTIVE',
    creator: { userId: 'user-1', user: { firstName: 'Jane', lastName: 'C', avatarUrl: null } },
    category: { id: 'cat-1', name: 'Technology' },
    _count: { donations: 5, comments: 2 },
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === 'function' ? (arg as (tx: unknown) => unknown)(prismaMock) : Promise.all(arg as unknown[])
  );
});

describe('GET /api/v1/campaigns', () => {
  it('returns a paginated list with computed progressPercent', async () => {
    prismaMock.campaign.findMany.mockResolvedValue([campaignRow()]);
    prismaMock.campaign.count.mockResolvedValue(1);

    const res = await request(app).get('/api/v1/campaigns');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].progressPercent).toBe(65); // 32500 / 50000
    expect(res.body.meta).toMatchObject({ total: 1, page: 1 });
  });

  it('rejects an invalid status filter with 400', async () => {
    const res = await request(app).get('/api/v1/campaigns?status=NONSENSE');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/campaigns/:id', () => {
  it('returns a single campaign and increments views', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(campaignRow());
    prismaMock.campaign.update.mockResolvedValue({});

    const res = await request(app).get('/api/v1/campaigns/camp-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('camp-1');
    expect(prismaMock.campaign.update).toHaveBeenCalledOnce(); // incrementViews
  });

  it('returns 404 for a missing campaign', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/v1/campaigns/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/v1/campaigns (authorization)', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/v1/campaigns').send({});
    expect(res.status).toBe(401);
  });

  it('returns 403 for a donor-only user', async () => {
    const token = signAccessToken({ sub: 'user-1', email: 'd@f.io', roles: ['DONOR'] });
    const res = await request(app).post('/api/v1/campaigns').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(403);
  });
});
