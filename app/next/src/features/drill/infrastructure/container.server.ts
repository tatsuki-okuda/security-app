import { createCreateDrillInteractor } from '../usecases/CreateDrillInteractor';
import { createSendDrillInteractor } from '../usecases/SendDrillInteractor';
import { createStopDrillInteractor } from '../usecases/StopDrillUseCase';

import { createDeliveryGateway } from './email/NodemailerDeliveryGateway';
import { createPrismaDrillRepository } from './prisma/PrismaDrillRepository';

export const createDrillContainer = () => {
  const repo = createPrismaDrillRepository();
  const delivery = createDeliveryGateway();

  return {
    usecases: {
      create: createCreateDrillInteractor({ repo }),
      send: createSendDrillInteractor({ repo, delivery }),
      stop: createStopDrillInteractor({ repo }),
    },
  };
};
