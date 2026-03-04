import { err, ok } from '../../../shared/fp/result';

import { TrackClickInput } from './dto/TrackClickInput';
import { TrackingRepository } from './gateway/TrackingRepository';
import { TrackClickUseCase } from './TrackClickUseCase';

export type TrackClickDeps = { repo: TrackingRepository };

export const createTrackClickInteractor =
  ({ repo }: TrackClickDeps): TrackClickUseCase =>
  async (input: TrackClickInput) => {
    const token = input.token.trim();
    if (!token) {
      return err({ type: 'VALIDATION', message: '無効なリンクです' });
    }

    const tokenResult = await repo.findToken(token);
    if (!tokenResult.ok) {
      return err({ type: 'REPO', message: tokenResult.error.message });
    }

    if (!tokenResult.value) {
      return err({ type: 'NOT_FOUND' });
    }

    const tokenData = tokenResult.value;
    if (!tokenData.isActive) {
      return err({ type: 'INACTIVE' });
    }

    if (tokenData.expiresAt && tokenData.expiresAt.getTime() < Date.now()) {
      return err({ type: 'EXPIRED' });
    }

    const recordResult = await repo.recordClick({
      drillId: tokenData.drillId,
      trackingTokenId: tokenData.id,
      drillRecipientId: tokenData.drillRecipientId,
      userId: tokenData.userId,
    });

    if (!recordResult.ok) {
      return err({ type: 'REPO', message: recordResult.error.message });
    }

    return ok({ drillId: tokenData.drillId });
  };
