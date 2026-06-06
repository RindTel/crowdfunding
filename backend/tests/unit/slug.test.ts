import { describe, it, expect } from 'vitest';
import { slugify, generateUniqueSlug } from '../../src/utils/slug';

describe('slugify', () => {
  it('lowercases and hyphenates a normal title', () => {
    expect(slugify('Eco Smart Water Purifier')).toBe('eco-smart-water-purifier');
  });

  it('strips punctuation and collapses separators', () => {
    expect(slugify('  Hello,   World!! ___ foo ')).toBe('hello-world-foo');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--Wellspring--')).toBe('wellspring');
  });

  it('returns an empty string for punctuation-only input', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('generateUniqueSlug', () => {
  it('returns the bare slug when no suffix is given', () => {
    expect(generateUniqueSlug('The Commons')).toBe('the-commons');
  });

  it('appends a suffix for disambiguation', () => {
    expect(generateUniqueSlug('The Commons', '2')).toBe('the-commons-2');
  });
});
