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
        /** 本文に訓練と分かる表現が含まれていた場合の運用者向け警告 */
        bodyQualityWarning?: string;
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
