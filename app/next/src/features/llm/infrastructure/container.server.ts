import { createGenerateDrillContentInteractor } from '../usecases/GenerateDrillContentUseCase';
import { createReviseDrillContentInteractor } from '../usecases/ReviseDrillContentUseCase';

import { createLangchainLlmGateway } from './langchain/LangchainLlmGateway';

export const createLlmContainer = () => {
  const gateway = createLangchainLlmGateway();
  return {
    usecases: {
      generateContent: createGenerateDrillContentInteractor({ gateway }),
      reviseContent: createReviseDrillContentInteractor({ gateway }),
    },
  };
};
