import { err, ok } from '../../../shared/fp/result';

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

    return ok(result.value);
  };
