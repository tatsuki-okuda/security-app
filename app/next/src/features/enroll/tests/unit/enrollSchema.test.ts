// References: root/plan/override.md, root/doc/test/test.md
import { describe, expect, it } from 'vitest';

import { enrollSchema } from '../../validators/enroll';

describe('登録バリデーション', () => {
  it('正しいメールと同意があると通る', () => {
    const result = enrollSchema.safeParse({ email: 'user@example.com', consent: true });
    expect(result.success).toBe(true);
  });

  it('不正なメール形式は弾く', () => {
    const result = enrollSchema.safeParse({ email: 'invalid-email', consent: true });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toBe('メールアドレスの形式が不正です');
    }
  });

  it('同意がないと弾く', () => {
    const result = enrollSchema.safeParse({ email: 'user@example.com', consent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.consent?.[0]).toBe('訓練への参加に同意してください');
    }
  });
});
