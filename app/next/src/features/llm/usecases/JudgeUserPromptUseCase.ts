import type { LlmGateway } from './gateway/LlmGateway';
import type { Result } from '../../../../shared/fp/result';

export type JudgeUserPromptInput = {
  userPrompt: string;
};

export type JudgeUserPromptResult = {
  isStyleOnly: boolean;
  reason: string;
};

export type JudgeUserPromptUseCase = (
  input: JudgeUserPromptInput,
) => Promise<Result<JudgeUserPromptResult, { type: 'LLM_ERROR'; message: string }>>;

export const createJudgeUserPromptUseCase = (gateway: LlmGateway): JudgeUserPromptUseCase => {
  return async (input) => {
    return await gateway.judgeUserPrompt(input);
  };
};
