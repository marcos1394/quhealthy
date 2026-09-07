/** A caller can retain this key to safely retry one logical write operation. */
export const createIdempotencyKey = (): string => crypto.randomUUID();

export const idempotencyHeaders = (key?: string) => ({
  'Idempotency-Key': key ?? createIdempotencyKey(),
});
