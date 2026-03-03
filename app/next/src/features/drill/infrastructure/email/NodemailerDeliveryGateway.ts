import nodemailer from 'nodemailer';

import { err, ok } from '../../../../shared/fp/result';

import type { DeliveryGateway } from '../../usecases/gateway/DeliveryGateway';

const createTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host) {
    return null;
  }

  if ((user && !pass) || (!user && pass)) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ...(user && pass ? { auth: { user, pass } } : {}),
  });
};

const toErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const createDeliveryGateway = (): DeliveryGateway => {
  const transport = createTransport();
  const from = process.env.MAIL_FROM ?? 'no-reply@example.com';
  const slackWebhook = process.env.SLACK_WEBHOOK_URL ?? '';

  return {
    sendEmail: async ({ to, subject, body }) => {
      if (!transport) {
        return err({ type: 'DELIVERY', message: 'SMTP 設定が不足しています' });
      }

      try {
        await transport.sendMail({ from, to, subject, text: body });
        return ok(undefined);
      } catch (e: unknown) {
        return err({ type: 'DELIVERY', message: toErrorMessage(e, 'メール送信に失敗しました') });
      }
    },
    sendSlack: async ({ to, text }) => {
      if (!slackWebhook) {
        return err({ type: 'DELIVERY', message: 'Slack Webhook が未設定です' });
      }

      try {
        const payload = { text: `<@${to}>\n${text}` };
        const res = await fetch(slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          return err({ type: 'DELIVERY', message: `Slack送信に失敗しました (${res.status})` });
        }

        return ok(undefined);
      } catch (e: unknown) {
        return err({ type: 'DELIVERY', message: toErrorMessage(e, 'Slack送信に失敗しました') });
      }
    },
  };
};
