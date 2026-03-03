import { createGetLearningIntroInteractor } from '../usecases/GetLearningIntroInteractor';
import { createGetQuizInteractor } from '../usecases/GetQuizInteractor';
import { createGetQuizResultInteractor } from '../usecases/GetQuizResultInteractor';
import { createRecordLearningInteractor } from '../usecases/RecordLearningInteractor';
import { createSubmitQuizInteractor } from '../usecases/SubmitQuizInteractor';

import { createPrismaLearningRepository } from './prisma/PrismaLearningRepository';
import { createPrismaQuizRepository } from './prisma/PrismaQuizRepository';

export const createLearningContainer = () => {
  const repo = createPrismaLearningRepository();
  const quizRepo = createPrismaQuizRepository();
  return {
    usecases: {
      getIntro: createGetLearningIntroInteractor({ repo }),
      recordLearning: createRecordLearningInteractor({ repo }),
      getQuiz: createGetQuizInteractor({ repo: quizRepo }),
      submitQuiz: createSubmitQuizInteractor({ repo: quizRepo }),
      getQuizResult: createGetQuizResultInteractor({ repo: quizRepo }),
    },
  };
};
