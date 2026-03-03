import { Result } from '../../../shared/fp/result';

export type QuizResultOutput = {
  score: number;
  attemptCount: number;
};

export type GetQuizResultError =
  | { type: 'VALIDATION'; message: string }
  | { type: 'NOT_FOUND' }
  | { type: 'REPO'; message: string };

export type GetQuizResultUseCase = (input: { drillId: string; token: string }) => Promise<Result<QuizResultOutput, GetQuizResultError>>;
