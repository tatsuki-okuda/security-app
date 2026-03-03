import { createTrackClickInteractor } from '../usecases/TrackClickInteractor';

import { createPrismaTrackingRepository } from './prisma/PrismaTrackingRepository';

export const createTrackingContainer = () => {
  const repo = createPrismaTrackingRepository();
  return {
    usecases: {
      trackClick: createTrackClickInteractor({ repo }),
    },
  };
};
