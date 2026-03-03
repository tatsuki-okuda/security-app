import { Result } from '../../../shared/fp/result';

export type RecordLearningError =
  | { type: 'VALIDATION'; message: string }
  | { type: 'NOT_FOUND' }
  | { type: 'REPO'; message: string };

export type RecordLearningUseCase = (input: { drillId: string; token: string }) => Promise<Result<void, RecordLearningError>>;
