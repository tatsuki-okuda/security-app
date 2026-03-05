/**
 * Server Action: ユーザー登録処理
 *
 * 実装パターンについては doc/next.md を参照してください。
 * 特に以下のセクションが参考になります：
 * - Server Actions のベストプラクティス
 * - バリデーション戦略
 * - リダイレクト処理
 *
 * @see [doc/next.md#3-server-actions-のベストプラクティス](../../../../../../../root/doc/next.md)
 */
'use server';

import { redirect } from 'next/navigation';

import { createContainer } from '../../../_di/container.server';
import { enrollSchema } from '../../../features/enroll/validators/enroll';

import type { EnrollActionState } from '../../../features/enroll/contracts/enroll';

/**
 * enrollAction
 *
 * 1. zod で入力検証（UX）
 * 2. usecase / domain で business validation（安全性）
 * 3. 成功時は Server 側で redirect（Client 側での useEffect/router.push 不要）
 *
 * 成功時は redirect() で処理が終了するため、戻り値は EnrollActionState | never です。
 * ただし型定義の都合上、Promise<EnrollActionState> とします。
 *
 * @see [doc/next.md#4-バリデーション戦略](../../../../../../../root/doc/next.md)
 * @see [doc/next.md#ベストプラクティス-server-action-内で-redirect-を使う](../../../../../../../root/doc/next.md)
 */
export const enrollAction = async (_prev: EnrollActionState, formData: FormData): Promise<EnrollActionState> => {
  const raw = {
    email: String(formData.get('email') ?? ''),
    slackUserId: String(formData.get('slackUserId') ?? ''),
    consent: formData.get('consent') === 'true',
  };

  // 1. zod で入力検証（クライアント改変・形式チェック）
  const parsed = enrollSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return { status: 'error', fieldErrors: { email: fe.email, consent: fe.consent, slackUserId: fe.slackUserId } };
  }

  // 2. usecase / domain でビジネスロジック検証
  const c = createContainer();
  const inputData = parsed.data as { email: string; slackUserId?: string; consent: boolean };
  const r = await c.enroll.usecases.enroll({
    email: inputData.email,
    slackUserId: inputData.slackUserId,
    consent: inputData.consent,
  });

  if (!r.ok) {
    if (r.error.type === 'VALIDATION') {
      if (r.error.field === 'email') {
        return { status: 'error', fieldErrors: { email: [r.error.message] } };
      }
      if (r.error.field === 'slackUserId') {
        return { status: 'error', fieldErrors: { slackUserId: [r.error.message] } };
      }
      return { status: 'error', fieldErrors: { consent: [r.error.message] } };
    }
    return { status: 'error', formError: r.error.message };
  }

  // 3. 成功時、Server 側で直接リダイレクト
  // redirect() は例外的なフロー制御で、ここで処理が終了します
  // Client 側の useEffect や router.push() は不要になります
  redirect('/admin/users');
};
