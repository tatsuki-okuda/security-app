import { Result } from '../../../../shared/fp/result';

export type LearningDrillData = {
  id: string;
  title: string;
  guidanceText: string;
};

export type LearningRepoError = { type: 'DB'; message: string } | { type: 'UNKNOWN'; message: string };

export type LearningRepository = {
  findDrillById: (id: string) => Promise<Result<LearningDrillData | null, LearningRepoError>>;
  recordLearning: (input: { drillId: string; token: string }) => Promise<Result<void, LearningRepoError>>;
};
