import { Result } from '../../../shared/fp/result';

import { TrackClickInput } from './dto/TrackClickInput';
import { TrackClickOutput } from './dto/TrackClickOutput';

export type TrackClickError =
  | { type: 'VALIDATION'; message: string }
  | { type: 'NOT_FOUND' }
  | { type: 'INACTIVE' }
  | { type: 'EXPIRED' }
  | { type: 'REPO'; message: string };

export type TrackClickUseCase = (input: TrackClickInput) => Promise<Result<TrackClickOutput, TrackClickError>>;
