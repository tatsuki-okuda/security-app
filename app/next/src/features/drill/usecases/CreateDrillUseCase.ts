import { Result } from '../../../shared/fp/result';

import { CreateDrillOutput } from './dto/CreateDrillOutput';

export type CreateDrillError =
  | { type: 'VALIDATION'; fieldErrors: Record<string, string[]> }
  | { type: 'REPO'; message: string };

export type CreateDrillUseCase = (input: {
  title: string;
  scenarioType: string;
  channel: 'email' | 'slack' | 'both';
  subject: string;
  body: string;
  guidanceText: string;
}) => Promise<Result<CreateDrillOutput, CreateDrillError>>;
