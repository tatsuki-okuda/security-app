import { Result, ok, err } from '../../../shared/fp/result';

export type Email = { readonly _tag: 'Email'; readonly value: string };

export type EmailError = { type: 'EMPTY' } | { type: 'INVALID_FORMAT' };

export const makeEmail = (raw: string): Result<Email, EmailError> => {
  const v = raw.trim();
  if (!v) return err({ type: 'EMPTY' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return err({ type: 'INVALID_FORMAT' });
  return ok({ _tag: 'Email', value: v });
};
