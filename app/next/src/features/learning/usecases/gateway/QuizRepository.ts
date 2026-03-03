import { Result } from '../../../../shared/fp/result';

export type QuizOptionData = {
  id: string;
  label: string;
  optionText: string;
  isCorrect: boolean;
};

export type QuizQuestionData = {
  id: string;
  order: number;
  questionType: 'single_choice' | 'multiple_choice';
  questionText: string;
  explanation: string;
  options: QuizOptionData[];
};

export type QuizAttemptData = {
  id: string;
  attemptNo: number;
  score: number;
  isPassed: boolean;
  submittedAt: Date | null;
};

export type QuizRecipient = {
  drillId: string;
  userId: string;
  drillRecipientId: string | null;
};

export type QuizRepoError = { type: 'DB'; message: string } | { type: 'UNKNOWN'; message: string };

export type QuizRepository = {
  findRecipientByToken: (token: string) => Promise<Result<QuizRecipient | null, QuizRepoError>>;
  fetchQuiz: (drillId: string) => Promise<Result<QuizQuestionData[], QuizRepoError>>;
  getNextAttemptNo: (drillId: string, userId: string | null) => Promise<Result<number, QuizRepoError>>;
  createAttemptWithAnswers: (input: {
    drillId: string;
    userId: string;
    attemptNo: number;
    score: number;
    isPassed: boolean;
    answers: Array<{
      questionId: string;
      questionType: 'single_choice' | 'multiple_choice';
      selectedOptionIds: string[];
      isCorrect: boolean;
    }>;
  }) => Promise<Result<QuizAttemptData, QuizRepoError>>;
  recordQuizInteraction: (input: {
    drillId: string;
    userId: string;
    score: number;
    isPassed: boolean;
  }) => Promise<Result<void, QuizRepoError>>;
  getLatestPassedAttempt: (drillId: string, userId: string) => Promise<Result<QuizAttemptData | null, QuizRepoError>>;
  getAttemptCount: (drillId: string, userId: string) => Promise<Result<number, QuizRepoError>>;
};
