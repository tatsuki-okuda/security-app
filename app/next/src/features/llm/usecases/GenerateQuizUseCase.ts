import { err, ok, type Result } from '../../../shared/fp/result';

import type { LlmGateway } from './gateway/LlmGateway';
import type { QuizTemplateQuestion } from '../../drill/domain/quizTemplates';

export type GenerateQuizInput = {
  scenarioType: string;
  emailBody: string;
  userPrompt?: string;
  questionCount?: number;
};

export type GenerateQuizOutput = {
  quiz: QuizTemplateQuestion[];
};

export type GenerateQuizError = { type: 'LLM_ERROR'; message: string };

export type GenerateQuizUseCase = (input: GenerateQuizInput) => Promise<Result<GenerateQuizOutput, GenerateQuizError>>;

export const createGenerateQuizUseCase = (llmGateway: LlmGateway): GenerateQuizUseCase => {
  return async ({ scenarioType, emailBody, userPrompt, questionCount = 3 }) => {
    try {
      const generatedQuiz: QuizTemplateQuestion[] = [];

      // 直列生成 (Sequential Chunking) 
      // メモリ制限により、一度に複数生成するとローカルLLMがクラッシュしやすいため1問ずつ3回ループする
      for (let i = 0; i < questionCount; i++) {
        const existingContext =
          generatedQuiz.length > 0
            ? 'これまで生成された問題:\n' + generatedQuiz.map((q) => `- ${q.questionText}`).join('\n')
            : '（まだ問題は生成されていません）';

        const result = await llmGateway.generateQuizQuestion({
          scenarioType,
          emailBody,
          existingQuestionsContext: existingContext,
          userPrompt,
        });

        if (!result.ok) {
          return err({
            type: 'LLM_ERROR',
            message: `問題 ${i + 1} の生成に失敗しました: ${result.error.message}`,
          });
        }

        generatedQuiz.push(result.value);
      }

      // ループ終了後に指定した数の問題が完了していればOK
      if (generatedQuiz.length === questionCount) {
        return ok({ quiz: generatedQuiz });
      } else {
        return err({
          type: 'LLM_ERROR',
          message: '指定された数の問題をすべて生成できませんでした。',
        });
      }
    } catch {
      return err({ type: 'LLM_ERROR', message: '不明なクイズ生成エラーが発生しました' });
    }
  };
};
