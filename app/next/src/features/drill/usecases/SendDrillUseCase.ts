import { Result } from '../../../shared/fp/result';

export type SendDrillError = { type: 'REPO'; message: string } | { type: 'DELIVERY'; message: string };

export type SendDrillUseCase = (input: {
  drillId: string;
  channel: 'email' | 'slack' | 'both';
  subject: string;
  body: string;
  guidanceText: string;
  baseUrl: string;
}) => Promise<Result<void, SendDrillError>>;
