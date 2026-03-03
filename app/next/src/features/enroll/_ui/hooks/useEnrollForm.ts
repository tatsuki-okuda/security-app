'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';

import { enrollSchema, type EnrollInput } from '../../validators/enroll';

import type { EnrollActionState } from '../../contracts/enroll';

/**
 * useEnrollForm
 *
 * React Hook Form + Server Actions + useActionState のハイブリッドパターン
 *
 * 処理フロー：
 * 1. React Hook Form: クライアント即時バリデーション（UX）
 * 2. handleSubmit: FormData を生成して Server Action に渡す
 * 3. useActionState: Server Action の結果を状態管理
 * 4. Server: zod 再検証 + domain 検証 + 成功時は redirect
 *
 * リダイレクト処理は Server Action 内で行うため、Client 側の useEffect 不要
 *
 * @see [doc/next.md#react-hook-form--server-actions-ハイブリッドパターン](../../../../../root/doc/next.md)
 */
type EnrollAction = (prev: EnrollActionState, formData: FormData) => Promise<EnrollActionState>;

const initialState: EnrollActionState = { status: 'idle' };

export const useEnrollForm = (action: EnrollAction) => {
  // React Hook Form: クライアント即時バリデーション
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors: clientErrors, isSubmitting },
  } = useForm<EnrollInput>({
    resolver: zodResolver(enrollSchema),
    mode: 'onBlur', // blur 時にバリデーション
    defaultValues: { channel: 'email' },
  });

  // useActionState: Server Action 結果を管理
  const [state, formAction, isPending] = useActionState(action, initialState);

  // サーバーエラーとマージ
  const mergedEmailErrors = [
    ...(clientErrors.email?.message ? [clientErrors.email.message] : []),
    ...(state.status === 'error' && state.fieldErrors?.email ? state.fieldErrors.email : []),
  ];
  const mergedConsentErrors = [
    ...(clientErrors.consent?.message ? [clientErrors.consent.message] : []),
    ...(state.status === 'error' && state.fieldErrors?.consent ? state.fieldErrors.consent : []),
  ];
  const mergedSlackErrors = [
    ...(clientErrors.slackUserId?.message ? [clientErrors.slackUserId.message] : []),
    ...(state.status === 'error' && state.fieldErrors?.slackUserId ? state.fieldErrors.slackUserId : []),
  ];

  // フォーム送信: FormData を生成して Server Action に渡す
  const handleSubmit = handleFormSubmit(async (data: EnrollInput) => {
    const formData = new FormData();
    formData.set('email', data.email);
    formData.set('slackUserId', data.slackUserId ?? '');
    formData.set('channel', data.channel);
    formData.set('consent', data.consent ? 'true' : 'false');
    await formAction(formData);
  });

  const formError = state.status === 'error' ? state.formError : undefined;

  return {
    register,
    handleSubmit,
    clientErrors,
    mergedEmailErrors,
    mergedConsentErrors,
    mergedSlackErrors,
    formError,
    isPending: isPending || isSubmitting,
  };
};
