import { createGenerateDrillContentInteractor } from '../usecases/GenerateDrillContentUseCase';

import { createLangchainLlmGateway } from './langchain/LangchainLlmGateway';

export const createLlmContainer = () => {
  const gateway = createLangchainLlmGateway();
  return {
    usecases: {
      generateContent: createGenerateDrillContentInteractor({ gateway }),
    },
  };
};
