import type { QuizTemplateQuestion } from '../../drill/domain/quizTemplates';

export type GenerateContentActionState =
  | { status: 'idle' }
  | {
      status: 'error';
      formError?: string;
    }
  | {
      status: 'success';
      data: {
        subject: string;
        body: string;
        guidanceText: string;
        ctaText: string;
        ctaUrlPlaceholder: string;
        riskNotes: string;
      };
    };

export type GenerateQuizActionState =
  | { status: 'idle' }
  | {
      status: 'error';
      formError?: string;
    }
  | {
      status: 'success';
      data: {
        quiz: QuizTemplateQuestion[];
      };
    };
