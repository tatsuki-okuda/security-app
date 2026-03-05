// References: root/plan/override.md, root/doc/test/test.md
import { describe, expect, it, vi } from 'vitest';

import { createEnrollUserInteractor } from '../../usecases/EnrollUserInteractor';

import type { UserRepository } from '../../usecases/gateway/UserRepository';

const createRepo = (overrides?: Partial<UserRepository>): UserRepository => ({
  enroll: vi.fn().mockResolvedValue({ ok: true, value: { userId: 'user-1' } }),
  ...overrides,
});

describe('登録ユースケース', () => {
  it('同意がない場合は拒否する', async () => {
    const repo = createRepo();
    const usecase = createEnrollUserInteractor({ repo });

    const result = await usecase({ email: 'user@example.com', consent: false });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('VALIDATION');
      if (result.error.type === 'VALIDATION') {
        expect(result.error.field).toBe('consent');
      }
    }
    expect(repo.enroll).not.toHaveBeenCalled();
  });

  it('不正なメールはリポジトリ前に拒否する', async () => {
    const repo = createRepo();
    const usecase = createEnrollUserInteractor({ repo });

    const result = await usecase({ email: 'invalid', consent: true });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('VALIDATION');
      if (result.error.type === 'VALIDATION') {
        expect(result.error.field).toBe('email');
      }
    }
    expect(repo.enroll).not.toHaveBeenCalled();
  });

  it('重複エラーをユーザー向けメッセージに変換する', async () => {
    const repo = createRepo({
      enroll: vi.fn().mockResolvedValue({ ok: false, error: { type: 'DUPLICATE' } }),
    });
    const usecase = createEnrollUserInteractor({ repo });

    const result = await usecase({ email: 'user@example.com', consent: true });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('REPO');
      expect(result.error.message).toBe('このメールは既に登録されています');
    }
  });

  it('consentedAt をリポジトリへ渡す', async () => {
    const repo = createRepo();
    const usecase = createEnrollUserInteractor({ repo });

    const result = await usecase({ email: 'user@example.com', consent: true });

    expect(result.ok).toBe(true);
    expect(repo.enroll).toHaveBeenCalledTimes(1);
    const args = (repo.enroll as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args.consentedAt).toBeInstanceOf(Date);
  });
});
