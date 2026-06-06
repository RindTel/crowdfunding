import { describe, it, expect } from 'vitest';
import { getPaginationParams, paginationSchema } from '../../src/utils/pagination';
import { buildPaginationMeta } from '../../src/utils/response';

describe('getPaginationParams', () => {
  it('computes skip from page and limit', () => {
    expect(getPaginationParams({ page: 1, limit: 20, sortOrder: 'desc' })).toEqual({ page: 1, limit: 20, skip: 0 });
    expect(getPaginationParams({ page: 3, limit: 10, sortOrder: 'desc' })).toEqual({ page: 3, limit: 10, skip: 20 });
  });
});

describe('paginationSchema', () => {
  it('applies defaults and coerces strings to numbers', () => {
    const parsed = paginationSchema.parse({});
    expect(parsed).toMatchObject({ page: 1, limit: 20, sortOrder: 'desc' });
  });

  it('rejects a limit above the max of 100', () => {
    expect(() => paginationSchema.parse({ limit: '500' })).toThrow();
  });
});

describe('buildPaginationMeta', () => {
  it('computes total pages and next/prev flags on a middle page', () => {
    const meta = buildPaginationMeta(95, 2, 20);
    expect(meta).toEqual({
      total: 95,
      page: 2,
      limit: 20,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('has no next on the last page and no prev on the first', () => {
    expect(buildPaginationMeta(10, 1, 20)).toMatchObject({ totalPages: 1, hasNext: false, hasPrev: false });
    expect(buildPaginationMeta(40, 2, 20)).toMatchObject({ totalPages: 2, hasNext: false, hasPrev: true });
  });

  it('reports zero pages for an empty result set', () => {
    expect(buildPaginationMeta(0, 1, 20)).toMatchObject({ total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  });
});
