import { err, ok } from '../../../shared/fp/result';

import type { LlmGateway } from './gateway/LlmGateway';
import type { Result } from '../../../shared/fp/result';

export type ReviseContentInput = {
  editPrompt: string;
  currentSubject: string;
  currentBody: string;
  currentCtaText: string;
  currentCtaUrlPlaceholder: string;
  currentGuidanceText: string;
  currentRiskNotes: string;
};

export type ReviseContentOutput = {
  subject: string;
  body: string;
  ctaText: string;
  ctaUrlPlaceholder: string;
  guidanceText: string;
  riskNotes: string;
};

export type ReviseContentError = { type: 'LLM_ERROR'; message: string };

export type ReviseDrillContentUseCase = (
  input: ReviseContentInput,
) => Promise<Result<ReviseContentOutput, ReviseContentError>>;

export type ReviseDrillDeps = { gateway: LlmGateway };

export const createReviseDrillContentInteractor =
  ({ gateway }: ReviseDrillDeps): ReviseDrillContentUseCase =>
  async (input: ReviseContentInput) => {
    const result = await gateway.reviseContent(input);

    if (!result.ok) {
      return err({ type: 'LLM_ERROR', message: result.error.message });
    }

    return ok(result.value);
  };
