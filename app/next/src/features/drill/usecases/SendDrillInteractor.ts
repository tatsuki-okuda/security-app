import { err, ok } from '../../../shared/fp/result';

import { DeliveryGateway } from './gateway/DeliveryGateway';
import { DrillRepository } from './gateway/DrillRepository';
import { SendDrillUseCase } from './SendDrillUseCase';

export type SendDrillDeps = { repo: DrillRepository; delivery: DeliveryGateway };

export const createSendDrillInteractor =
  ({ repo, delivery }: SendDrillDeps): SendDrillUseCase =>
  async ({ drillId, channel, subject, body, guidanceText, baseUrl }) => {
    await repo.updateDrillStatus({ drillId, status: 'delivering' });

    const drillDetailRes = await repo.getDrillDetail(drillId);
    if (!drillDetailRes.ok) return err({ type: 'REPO', message: drillDetailRes.error.message });
    const drill = drillDetailRes.value;
    if (!drill) return err({ type: 'REPO', message: 'Drill not found' });

    const targetsResult = await repo.listDeliveryTargets({
      targetType: (drill as any).targetType as 'all' | 'specific' | 'random', // Type cast for now as drillDetail definition might need it
      targetCount: (drill as any).targetCount,
      targetUserIds: (drill as any).targetUserIds as string[] | null,
    });
    if (!targetsResult.ok) {
      return err({ type: 'REPO', message: targetsResult.error.message });
    }

    const channelsResult = await repo.ensureDeliveryChannels();
    if (!channelsResult.ok) {
      return err({ type: 'REPO', message: channelsResult.error.message });
    }

    const recipientsResult = await repo.createRecipientsAndTokens({
      drillId,
      targets: targetsResult.value,
      channel,
      emailChannelId: channelsResult.value.emailChannelId,
      slackChannelId: channelsResult.value.slackChannelId,
    });
    if (!recipientsResult.ok) {
      return err({ type: 'REPO', message: recipientsResult.error.message });
    }

    const deliveryResults = await Promise.all(
      recipientsResult.value.map(async (recipient) => {
        const url = `${baseUrl.replace(/\/$/, '')}/t/${recipient.token}`;

        const hasPlaceholder = body.includes('{{TRACKING_URL}}') || body.includes('{TRACKING_URL}');
        const processedBody = body.replace(/\{\{?TRACKING_URL\}?\}/g, url);

        const messageBody = hasPlaceholder
          ? `${processedBody}\n\n${guidanceText}`
          : `${processedBody}\n\n${guidanceText}\n${url}`;

        const slackText = `${subject}\n${guidanceText}\n${url}`;

        if (recipient.channel === 'email' && recipient.email) {
          const sendResult = await delivery.sendEmail({
            to: recipient.email,
            subject,
            body: messageBody,
          });
          return { recipient, sendResult };
        }

        if (recipient.channel === 'slack' && recipient.slackUserId) {
          const sendResult = await delivery.sendSlack({
            to: recipient.slackUserId,
            text: slackText,
          });
          return { recipient, sendResult };
        }

        return { recipient, sendResult: err({ type: 'DELIVERY', message: '送信先がありません' }) };
      }),
    );

    let failed = 0;
    for (const { recipient, sendResult } of deliveryResults) {
      if (sendResult.ok) {
        await repo.markRecipientDelivered({ drillRecipientId: recipient.drillRecipientId });
        await repo.recordSendInteraction({ drillId, userId: recipient.userId });
      } else {
        failed += 1;
        await repo.markRecipientDelivered({
          drillRecipientId: recipient.drillRecipientId,
          error: sendResult.error.message,
        });
      }
    }

    const allFailed = failed === deliveryResults.length;
    await repo.updateDrillStatus({ drillId, status: allFailed ? 'failed' : 'sent' });

    if (allFailed) {
      return err({ type: 'DELIVERY', message: '配信に失敗しました' });
    }

    return ok(undefined);
  };
