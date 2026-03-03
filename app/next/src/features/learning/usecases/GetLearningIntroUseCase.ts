import { Result } from '../../../shared/fp/result';

import { GetLearningIntroInput } from './dto/GetLearningIntroInput';
import { GetLearningIntroOutput } from './dto/GetLearningIntroOutput';

export type GetLearningIntroError =
  | { type: 'VALIDATION'; message: string }
  | { type: 'NOT_FOUND' }
  | { type: 'REPO'; message: string };

export type GetLearningIntroUseCase = (
  input: GetLearningIntroInput,
) => Promise<Result<GetLearningIntroOutput, GetLearningIntroError>>;
