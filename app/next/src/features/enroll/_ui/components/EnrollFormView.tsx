import { InlineError } from '../../../../shared/ui/components/InlineError';
import { formStyles } from '../../../../shared/ui/styles/formStyles';

import type { EnrollInput } from '../../validators/enroll';
import type { ReactNode } from 'react';
import type { UseFormRegister } from 'react-hook-form';

type Props = {
  register: UseFormRegister<EnrollInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  emailErrors: string[];
  consentErrors: string[];
  slackErrors: string[];
  formError?: string;
  submitButton: ReactNode;
};

export const EnrollFormView = ({
  register,
  onSubmit,
  emailErrors,
  consentErrors,
  slackErrors,
  formError,
  submitButton,
}: Props) => {
  const hasEmailError = emailErrors.length > 0;
  const hasConsentError = consentErrors.length > 0;
  const hasSlackError = slackErrors.length > 0;

  return (
    <div className={formStyles.shell}>
      <form onSubmit={onSubmit} noValidate className={formStyles.card}>
        <div className={formStyles.header}>
          <span className={formStyles.eyebrow}>Security Training</span>
          <div className="space-y-1">
            <h1 className={formStyles.title}>訓練アカウント登録</h1>
            <p className={formStyles.description}>訓練用のログイン情報を受け取るメールアドレスを登録します。</p>
          </div>
        </div>

        <div className={formStyles.form}>
          <div className={formStyles.field}>
            <label htmlFor="email" className={formStyles.label}>
              メールアドレス
            </label>
            <input
              id="email"
              {...register('email')}
              inputMode="email"
              autoComplete="email"
              className={`${formStyles.input} ${hasEmailError ? formStyles.inputError : ''}`}
              aria-invalid={hasEmailError}
              aria-describedby={hasEmailError ? 'email-errors' : undefined}
            />
            <p className={formStyles.hint}>会社ドメインなど、案内を受信できるメールアドレスを入力してください。</p>

            <InlineError
              id="email-errors"
              messages={emailErrors}
              className={formStyles.errors.list}
              itemClassName={formStyles.errors.item}
              bulletClassName={formStyles.errors.bullet}
            />
          </div>

          <div className={formStyles.field}>
            <label htmlFor="slackUserId" className={formStyles.label}>
              Slack ID
            </label>
            <input
              id="slackUserId"
              {...register('slackUserId')}
              className={`${formStyles.input} ${hasSlackError ? formStyles.inputError : ''}`}
              aria-invalid={hasSlackError}
              aria-describedby={hasSlackError ? 'slack-errors' : undefined}
            />
            <p className={formStyles.hint}>Slack のユーザーID（例: U12345678）を入力してください。</p>

            <InlineError
              id="slack-errors"
              messages={slackErrors}
              className={formStyles.errors.list}
              itemClassName={formStyles.errors.item}
              bulletClassName={formStyles.errors.bullet}
            />
          </div>

          <div className={formStyles.field}>
            <label htmlFor="consent" className={formStyles.checkboxRow}>
              <input
                id="consent"
                type="checkbox"
                {...register('consent')}
                className={formStyles.checkbox}
                aria-invalid={hasConsentError}
                aria-describedby={hasConsentError ? 'consent-errors' : undefined}
              />
              <span className={formStyles.checkboxLabel}>訓練の目的と内容を理解し、参加に同意します。</span>
            </label>
            <InlineError
              id="consent-errors"
              messages={consentErrors}
              className={formStyles.errors.list}
              itemClassName={formStyles.errors.item}
              bulletClassName={formStyles.errors.bullet}
            />
          </div>

          {formError && (
            <div className={formStyles.alert} role="alert" aria-live="polite">
              {formError}
            </div>
          )}

          <div className={formStyles.actions}>{submitButton}</div>
        </div>
      </form>
    </div>
  );
};
