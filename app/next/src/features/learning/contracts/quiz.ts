export type QuizActionState =
  | { status: 'idle' }
  | { status: 'error'; fieldErrors?: Record<string, string[]>; formError?: string }
  | { status: 'failed'; score: number; explanations: Record<string, string> }
  | { status: 'success'; score: number };
