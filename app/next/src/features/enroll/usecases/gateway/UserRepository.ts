import { Result } from '../../../../shared/fp/result';
import { Email } from '../../domain/email';
import { EnrollUserOutput } from '../dto/EnrollUserOutput';

export type EnrollRepoError =
  | { type: 'DUPLICATE' }
  | { type: 'DB'; message: string }
  | { type: 'UNKNOWN'; message: string };

export type UserRepository = {
  enroll: (input: {
    email: Email;
    consentedAt: Date;
    slackUserId?: string;
  }) => Promise<Result<EnrollUserOutput, EnrollRepoError>>;
};
