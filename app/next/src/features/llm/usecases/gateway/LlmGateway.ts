import type { Result } from '../../../../shared/fp/result';
import type { QuizTemplateQuestion } from '../../../drill/domain/quizTemplates';

export type LlmGatewayError = { type: 'LLM_ERROR'; message: string };

export type LlmGateway = {
  generateContent: (input: { scenarioType: string }) => Promise<
    Result<
      {
        subject: string;
        body: string;
        ctaText: string;
        ctaUrlPlaceholder: string;
        guidanceText: string;
        riskNotes: string;
        quiz: QuizTemplateQuestion[];
      },
      LlmGatewayError
    >
  >;
};
