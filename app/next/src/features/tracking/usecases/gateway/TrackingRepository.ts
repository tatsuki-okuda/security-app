import { Result } from '../../../../shared/fp/result';

export type TrackingTokenData = {
  id: string;
  drillId: string;
  drillRecipientId?: string | null;
  userId?: string | null;
  isActive: boolean;
  expiresAt: Date | null;
};

export type TrackingRepoError = { type: 'DB'; message: string } | { type: 'UNKNOWN'; message: string };

export type TrackingRepository = {
  findToken: (token: string) => Promise<Result<TrackingTokenData | null, TrackingRepoError>>;
  recordClick: (input: {
    drillId: string;
    trackingTokenId: string;
    drillRecipientId?: string | null;
    userId?: string | null;
  }) => Promise<Result<void, TrackingRepoError>>;
};
