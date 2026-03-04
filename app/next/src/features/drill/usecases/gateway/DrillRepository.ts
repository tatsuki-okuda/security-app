import { Result } from '../../../../shared/fp/result';
import { QuizTemplateQuestion } from '../../domain/quizTemplates';

export type DrillRepoError = { type: 'DB'; message: string } | { type: 'UNKNOWN'; message: string };

export type DeliveryTarget = {
  userId: string;
  email: string;
  slackUserId: string | null;
};

export type DrillRecipientToken = {
  drillRecipientId: string;
  channel: 'email' | 'slack';
  email: string | null;
  slackUserId: string | null;
  token: string;
  userId: string;
};

export type DrillRepository = {
  createDrillWithQuiz: (input: {
    title: string;
    scenarioType: string;
    channel: string;
    subject: string;
    body: string;
    guidanceText: string;
    quiz: QuizTemplateQuestion[];
  }) => Promise<Result<{ drillId: string }, DrillRepoError>>;
  listDeliveryTargets: () => Promise<Result<DeliveryTarget[], DrillRepoError>>;
  ensureDeliveryChannels: () => Promise<Result<{ emailChannelId: string; slackChannelId: string }, DrillRepoError>>;
  createRecipientsAndTokens: (input: {
    drillId: string;
    targets: DeliveryTarget[];
    channel: 'email' | 'slack' | 'both';
    emailChannelId: string;
    slackChannelId: string;
  }) => Promise<Result<DrillRecipientToken[], DrillRepoError>>;
  markRecipientDelivered: (input: {
    drillRecipientId: string;
    error?: string | null;
  }) => Promise<Result<void, DrillRepoError>>;
  updateDrillStatus: (input: {
    drillId: string;
    status: 'deliverable' | 'delivering' | 'sent' | 'failed';
  }) => Promise<Result<void, DrillRepoError>>;
  recordSendInteraction: (input: { drillId: string; userId: string }) => Promise<Result<void, DrillRepoError>>;
};
