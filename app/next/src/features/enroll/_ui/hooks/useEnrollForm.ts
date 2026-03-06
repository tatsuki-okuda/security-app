'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, startTransition } from 'react';
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
    defaultValues: {
      consent: true, // 管理者画面からの登録時は、暗黙的に同意済みとして扱う
    },
  });

  // useActionState: Server Action 結果を管理
  const [state, formAction, isPending] = useActionState(action, initialState);

  // サーバーエラーとマージ
  const mergedEmailErrors = [
    ...(clientErrors.email?.message ? [clientErrors.email.message] : []),
    ...(state.status === 'error' && state.fieldErrors?.email ? state.fieldErrors.email : []),
  ];
  const mergedNameErrors = [
    ...(clientErrors.name?.message ? [clientErrors.name.message] : []),
    ...(state.status === 'error' && state.fieldErrors?.name ? state.fieldErrors.name : []),
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
  const handleSubmit = handleFormSubmit((data: EnrollInput) => {
    startTransition(() => {
      const formData = new FormData();
      formData.set('email', String(data.email ?? ''));
      if (data.name) {
        formData.set('name', String(data.name));
      }
      if (data.slackUserId) {
        formData.set('slackUserId', String(data.slackUserId));
      }
      // UIでチェックボックスを非表示にしたため、管理画面から追加時は常に同意済みとする
      formData.set('consent', 'true');
      formAction(formData);
    });
  });

  const formError = state.status === 'error' ? state.formError : undefined;

  return {
    register,
    handleSubmit,
    clientErrors,
    mergedEmailErrors,
    mergedNameErrors,
    mergedConsentErrors,
    mergedSlackErrors,
    formError,
    isPending: isPending || isSubmitting,
  };
};
