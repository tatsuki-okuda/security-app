import { ok, err } from '../../../shared/fp/result';

import { makeEmail } from '../domain/email';
import { EnrollUserUseCase } from './EnrollUserUseCase';
import { EnrollUserInput } from './dto/EnrollUserInput';
import { UserRepository } from './gateway/UserRepository';

export type EnrollUserDeps = { repo: UserRepository };

export const createEnrollUserInteractor =
  ({ repo }: EnrollUserDeps): EnrollUserUseCase =>
  async (input: EnrollUserInput) => {
    if (!input.consent) {
      return err({ type: 'VALIDATION', field: 'consent', message: '訓練への参加に同意してください' });
    }

    if ((input.channel === 'slack' || input.channel === 'both') && !input.slackUserId) {
      return err({ type: 'VALIDATION', field: 'slackUserId', message: 'Slack ID を入力してください' });
    }

    const emailR = makeEmail(input.email);
    if (!emailR.ok) {
      const message =
        emailR.error.type === 'EMPTY' ? 'メールアドレスを入力してください' : 'メールアドレスの形式が不正です';
      return err({ type: 'VALIDATION', field: 'email', message });
    }

    const r = await repo.enroll({
      email: emailR.value,
      consentedAt: new Date(),
      slackUserId: input.slackUserId?.trim() || undefined,
    });
    if (!r.ok) {
      const message =
        r.error.type === 'DUPLICATE'
          ? 'このメールは既に登録されています'
          : r.error.type === 'DB'
            ? 'DBエラーが発生しました'
            : `登録に失敗しました: ${r.error.message}`;
      return err({ type: 'REPO', message });
    }

    return ok(r.value);
  };
