import { createGenerateDrillContentInteractor } from '../usecases/GenerateDrillContentUseCase';
import { createGenerateQuizUseCase } from '../usecases/GenerateQuizUseCase';
import { createJudgeUserPromptUseCase } from '../usecases/JudgeUserPromptUseCase';
import { createReviseDrillContentInteractor } from '../usecases/ReviseDrillContentUseCase';

import { createLangchainLlmGateway } from './langchain/LangchainLlmGateway';

export const createLlmContainer = () => {
  const gateway = createLangchainLlmGateway();
  return {
    usecases: {
      generateContent: createGenerateDrillContentInteractor({ gateway }),
      generateQuiz: createGenerateQuizUseCase(gateway),
      reviseContent: createReviseDrillContentInteractor({ gateway }),
      judgeUserPrompt: createJudgeUserPromptUseCase(gateway),
    },
  };
};
