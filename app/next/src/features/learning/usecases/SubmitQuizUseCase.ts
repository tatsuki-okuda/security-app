import { Result } from '../../../shared/fp/result';

export type QuizSubmission = {
  drillId: string;
  token: string;
  answers: Record<string, string[]>;
};

export type SubmitQuizError =
  | { type: 'VALIDATION'; fieldErrors: Record<string, string[]> }
  | { type: 'NOT_FOUND' }
  | { type: 'REPO'; message: string };

export type SubmitQuizOutput = {
  score: number;
  passed: boolean;
  explanations: Record<string, string>;
  feedback?: {
    strengths: string[];
    improvements: string[];
    advice: string[];
    overallFeedback: string;
  };
};

export type SubmitQuizUseCase = (input: QuizSubmission) => Promise<Result<SubmitQuizOutput, SubmitQuizError>>;
