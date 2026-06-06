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
      campaign: model(), donation: model(), payment: model(), reward: model(), donor: model(),
      $transaction: vi.fn(),
    },
  };
});
vi.mock('../../src/config/database', () => ({ prisma: prismaMock }));

import app from '../../src/app';

const CAMPAIGN_ID = '11111111-1111-1111-1111-111111111111';

beforeEach(() => {
  vi.resetAllMocks();
  prismaMock.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === 'function' ? (arg as (tx: unknown) => unknown)(prismaMock) : Promise.all(arg as unknown[])
  );
});

describe('POST /api/v1/donations', () => {
  it('rejects an empty body with 400', async () => {
    const res = await request(app).post('/api/v1/donations').send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeInstanceOf(Array);
  });

  it('returns 404 when the campaign does not exist', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/donations').send({ campaignId: CAMPAIGN_ID, amount: 50 });
    expect(res.status).toBe(404);
  });

  it('rejects a donation to a non-active campaign with 400', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({
      id: CAMPAIGN_ID, status: 'DRAFT', minDonation: null, maxDonation: null,
    });
    const res = await request(app).post('/api/v1/donations').send({ campaignId: CAMPAIGN_ID, amount: 50 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not accepting/i);
  });

  it('processes an anonymous donation through the payment transaction', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({
      id: CAMPAIGN_ID, status: 'ACTIVE', minDonation: null, maxDonation: null,
    });
    prismaMock.donation.create.mockResolvedValue({ id: 'don-1' });
    prismaMock.payment.create.mockResolvedValue({ id: 'pay-1' });
    prismaMock.payment.update.mockResolvedValue({});
    prismaMock.donation.update.mockResolvedValue({});
    prismaMock.campaign.update.mockResolvedValue({});
    prismaMock.donation.findUnique.mockResolvedValue({ id: 'don-1', amount: 50 });

    const res = await request(app).post('/api/v1/donations').send({ campaignId: CAMPAIGN_ID, amount: 50 });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(50);
    expect(prismaMock.campaign.update).toHaveBeenCalledOnce(); // funding stats bumped
  });
});
