/** An error that carries a governed key and an English fallback: 'key|fallback'. */
export class ToyError extends Error {
  readonly key: string;
  readonly fallback: string;

  constructor(keyWithFallback: string) {
    const [key, fallback = ''] = keyWithFallback.split('|');
    super(fallback || key);
    this.key = key;
    this.fallback = fallback;
  }
}
