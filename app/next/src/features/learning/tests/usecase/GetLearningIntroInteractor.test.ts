// References: root/doc/test/general/learning.md
import { describe, expect, it, vi } from 'vitest';

import { createGetLearningIntroInteractor } from '../../usecases/GetLearningIntroInteractor';
import type { LearningRepository } from '../../usecases/gateway/LearningRepository';

const createRepo = (overrides?: Partial<LearningRepository>): LearningRepository => ({
  findDrillById: vi.fn().mockResolvedValue({
    ok: true,
    value: { id: 'drill-1', title: '訓練: フィッシング対策', guidanceText: '本文' },
  }),
  recordLearning: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
  ...overrides,
});

describe('学習説明取得', () => {
  it('drillId が有効なら学習情報を返す', async () => {
    const repo = createRepo();
    const usecase = createGetLearningIntroInteractor({ repo });

    const result = await usecase({ drillId: 'drill-1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe('訓練: フィッシング対策');
    }
  });

  it('drillId が存在しない場合は NOT_FOUND', async () => {
    const repo = createRepo({
      findDrillById: vi.fn().mockResolvedValue({ ok: true, value: null }),
    });
    const usecase = createGetLearningIntroInteractor({ repo });

    const result = await usecase({ drillId: 'missing' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('NOT_FOUND');
    }
  });
});
