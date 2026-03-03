import { Result } from '../../../../shared/fp/result';

export type DeliveryError = { type: 'DELIVERY'; message: string };

export type DeliveryGateway = {
  sendEmail: (input: { to: string; subject: string; body: string }) => Promise<Result<void, DeliveryError>>;
  sendSlack: (input: { to: string; text: string }) => Promise<Result<void, DeliveryError>>;
};
