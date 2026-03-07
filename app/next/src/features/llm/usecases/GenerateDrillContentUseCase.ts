import { err, ok } from '../../../shared/fp/result';

import { findForbiddenPhrasesInBody } from '../domain/forbiddenBodyPhrases';

import type { LlmGateway } from './gateway/LlmGateway';
import type { Result } from '../../../shared/fp/result';

export type GenerateContentInput = {
  scenarioType: string;
  userPrompt?: string;
};

export type GenerateContentOutput = {
  subject: string;
  body: string;
  ctaText: string;
  ctaUrlPlaceholder: string;
  guidanceText: string;
  riskNotes: string;
  /** 本文に訓練と分かる表現が含まれていた場合の警告文（運用者向け） */
  bodyQualityWarning?: string;
};

export type GenerateContentError = { type: 'LLM_ERROR'; message: string };

export type GenerateDrillContentUseCase = (
  input: GenerateContentInput,
) => Promise<Result<GenerateContentOutput, GenerateContentError>>;

export type GenerateDrillDeps = { gateway: LlmGateway };

export const createGenerateDrillContentInteractor =
  ({ gateway }: GenerateDrillDeps): GenerateDrillContentUseCase =>
  async (input: GenerateContentInput) => {
    const result = await gateway.generateContent({
      scenarioType: input.scenarioType,
      userPrompt: input.userPrompt,
    });

    if (!result.ok) {
      return err({ type: 'LLM_ERROR', message: result.error.message });
    }

    const value = result.value;
    const forbiddenFound = findForbiddenPhrasesInBody(value.body);
    const bodyQualityWarning =
      forbiddenFound.length > 0
        ? `生成された本文に「${forbiddenFound.join('」「')}」が含まれています。受信者に訓練と悟られないよう、編集するか再生成してください。`
        : undefined;

    return ok({ ...value, bodyQualityWarning });
  };
