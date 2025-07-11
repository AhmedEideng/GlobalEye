import { jaccardSimilarity } from '../fetchNews';

describe('jaccardSimilarity', () => {
  it('should return 1 for identical strings', () => {
    expect(jaccardSimilarity('hello world', 'hello world')).toBe(1);
  });
  it('should return 0 for completely different strings', () => {
    expect(jaccardSimilarity('hello', 'world')).toBe(0);
  });
}); 