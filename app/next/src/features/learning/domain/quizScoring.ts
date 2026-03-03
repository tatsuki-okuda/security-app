export type QuizQuestionInput = {
  id: string;
  type: 'radio' | 'checkbox';
  correctOptionIds: string[];
};

export type QuizAnswerInput = {
  questionId: string;
  selectedOptionIds: string[];
};

export type ScoreResult = {
  score: number;
  perQuestion: Record<string, boolean>;
};

export const scoreQuiz = (questions: QuizQuestionInput[], answers: QuizAnswerInput[]): ScoreResult => {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOptionIds]));
  const perQuestion: Record<string, boolean> = {};
  if (questions.length === 0) {
    return { score: 0, perQuestion };
  }

  const pointsPerQuestion = 100 / questions.length;
  let total = 0;

  for (const question of questions) {
    const selected = new Set(answerMap.get(question.id) ?? []);
    const correct = new Set(question.correctOptionIds);

    if (question.type === 'radio') {
      const isCorrect = selected.size === 1 && correct.has(Array.from(selected)[0]);
      perQuestion[question.id] = isCorrect;
      total += isCorrect ? pointsPerQuestion : 0;
      continue;
    }

    // checkbox
    const selectedCount = selected.size;
    if (selectedCount === 0) {
      perQuestion[question.id] = false;
      continue;
    }

    const correctCount = Array.from(selected).filter((id) => correct.has(id)).length;
    const isPerfect = correctCount === correct.size && selectedCount === correct.size;

    if (isPerfect) {
      perQuestion[question.id] = true;
      total += pointsPerQuestion;
    } else if (correctCount > 0) {
      perQuestion[question.id] = false;
      total += (correctCount / correct.size) * pointsPerQuestion;
    } else {
      perQuestion[question.id] = false;
    }
  }

  return { score: Math.round(total), perQuestion };
};
