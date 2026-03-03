import { Result } from '../../../shared/fp/result';

import { EnrollUserInput } from './dto/EnrollUserInput';
import { EnrollUserOutput } from './dto/EnrollUserOutput';

export type EnrollUserError =
  | { type: 'VALIDATION'; field: 'email' | 'consent' | 'slackUserId'; message: string }
  | { type: 'REPO'; message: string };

export type EnrollUserUseCase = (input: EnrollUserInput) => Promise<Result<EnrollUserOutput, EnrollUserError>>;
