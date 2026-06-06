import { describe, it, expect } from 'vitest';
import { ApiError, HttpStatus } from '../../src/types/errors';

describe('ApiError factories', () => {
  it('badRequest carries 400 and field errors', () => {
    const err = ApiError.badRequest('Validation failed', [{ field: 'email', message: 'bad' }]);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(err.errors).toHaveLength(1);
    expect(err.isOperational).toBe(true);
  });

  it('unauthorized / forbidden / conflict map to the right status codes', () => {
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.conflict('dupe').statusCode).toBe(409);
  });

  it('notFound interpolates the resource name', () => {
    const err = ApiError.notFound('Campaign');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Campaign not found');
  });

  it('internal is flagged non-operational', () => {
    expect(ApiError.internal().isOperational).toBe(false);
  });
});
