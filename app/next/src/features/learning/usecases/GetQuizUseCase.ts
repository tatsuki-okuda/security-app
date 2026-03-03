import { Result } from '../../../shared/fp/result';

export type QuizViewOption = {
  id: string;
  label: string;
  optionText: string;
};

export type QuizViewQuestion = {
  id: string;
  order: number;
  type: 'radio' | 'checkbox';
  questionText: string;
  explanation: string;
  options: QuizViewOption[];
};

export type GetQuizError =
  | { type: 'VALIDATION'; message: string }
  | { type: 'NOT_FOUND' }
  | { type: 'REPO'; message: string };

export type GetQuizUseCase = (input: { drillId: string }) => Promise<Result<QuizViewQuestion[], GetQuizError>>;
