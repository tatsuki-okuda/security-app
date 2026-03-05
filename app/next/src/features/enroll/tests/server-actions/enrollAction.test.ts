// References: root/plan/override.md, root/doc/test/test.md
import { describe, expect, it, vi } from 'vitest';

const redirectSpy = vi.fn(() => {
  throw new Error('REDIRECT');
});

vi.mock('next/navigation', () => ({
  redirect: redirectSpy,
}));

const enrollMock = vi.fn();
vi.mock('../../../../_di/container.server', () => ({
  createContainer: () => ({
    enroll: {
      usecases: {
        enroll: enrollMock,
      },
    },
  }),
}));

describe('登録サーバーアクション', () => {
  it('無効入力はバリデーションエラーを返す', async () => {
    const { enrollAction } = await import('../../../../app/admin/enroll/actions');

    const formData = new FormData();
    formData.set('email', '');
    formData.set('slackUserId', '');
    formData.set('consent', 'false');

    const result = await enrollAction({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.fieldErrors?.email?.length).toBeGreaterThan(0);
      expect(result.fieldErrors?.consent?.[0]).toBe('訓練への参加に同意してください');
    }
  });

  it('成功時は管理者一覧へリダイレクトする', async () => {
    enrollMock.mockResolvedValueOnce({ ok: true, value: { userId: 'user-1' } });
    const { enrollAction } = await import('../../../../app/admin/enroll/actions');

    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('slackUserId', 'U12345678');
    formData.set('consent', 'true');

    await expect(enrollAction({ status: 'idle' }, formData)).rejects.toThrow('REDIRECT');
    expect(redirectSpy).toHaveBeenCalledWith('/admin/users');
  });
});
