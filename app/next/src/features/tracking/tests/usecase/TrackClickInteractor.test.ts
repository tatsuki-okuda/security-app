// References: root/doc/test/general/tracking.md
import { describe, expect, it, vi } from 'vitest';

import { createTrackClickInteractor } from '../../usecases/TrackClickInteractor';
import type { TrackingRepository } from '../../usecases/gateway/TrackingRepository';

const createRepo = (overrides?: Partial<TrackingRepository>): TrackingRepository => ({
  findToken: vi.fn().mockResolvedValue({
    ok: true,
    value: { id: 'token-1', drillId: 'drill-1', isActive: true, expiresAt: null, drillRecipientId: null, userId: null },
  }),
  recordClick: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
  ...overrides,
});

describe('トラッキングクリック', () => {
  it('有効トークンならクリックを記録して drillId を返す', async () => {
    const repo = createRepo();
    const usecase = createTrackClickInteractor({ repo });

    const result = await usecase({ token: 'token-1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.drillId).toBe('drill-1');
    }
    expect(repo.recordClick).toHaveBeenCalledTimes(1);
  });

  it('無効トークンなら NOT_FOUND を返す', async () => {
    const repo = createRepo({
      findToken: vi.fn().mockResolvedValue({ ok: true, value: null }),
    });
    const usecase = createTrackClickInteractor({ repo });

    const result = await usecase({ token: 'missing' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('NOT_FOUND');
    }
    expect(repo.recordClick).not.toHaveBeenCalled();
  });

  it('期限切れトークンなら EXPIRED を返す', async () => {
    const repo = createRepo({
      findToken: vi.fn().mockResolvedValue({
        ok: true,
        value: {
          id: 'token-1',
          drillId: 'drill-1',
          isActive: true,
          expiresAt: new Date(Date.now() - 1000),
        },
      }),
    });
    const usecase = createTrackClickInteractor({ repo });

    const result = await usecase({ token: 'token-1' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('EXPIRED');
    }
    expect(repo.recordClick).not.toHaveBeenCalled();
  });
});
