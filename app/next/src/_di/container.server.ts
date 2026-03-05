import { createAdminContainer } from '../features/admin/infrastructure/container.server';
import { createDrillContainer } from '../features/drill/infrastructure/container.server';
import { createEnrollContainer } from '../features/enroll/infrastructure/container.server';
import { createLearningContainer } from '../features/learning/infrastructure/container.server';
import { createLlmContainer } from '../features/llm/infrastructure/container.server';
import { createTrackingContainer } from '../features/tracking/infrastructure/container.server';

export const createContainer = () => ({
  enroll: createEnrollContainer(),
  tracking: createTrackingContainer(),
  learning: createLearningContainer(),
  drill: createDrillContainer(),
  admin: createAdminContainer(),
  llm: createLlmContainer(),
});
