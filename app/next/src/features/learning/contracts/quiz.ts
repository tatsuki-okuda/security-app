export type QuizActionState =
  | { status: 'idle' }
  | { status: 'error'; fieldErrors?: Record<string, string[]>; formError?: string }
  | {
      status: 'failed';
      score: number;
      explanations: Record<string, string>;
      feedback?: { strengths: string[]; improvements: string[]; advice: string[]; overallFeedback: string };
    }
  | { status: 'success'; score: number };
