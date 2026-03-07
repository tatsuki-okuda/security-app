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
    targetType: 'all' | 'specific' | 'random';
    targetCount?: number | null;
    targetUserIds?: string[] | null;
    subject: string;
    body: string;
    guidanceText: string;
    status: 'draft' | 'deliverable' | 'delivering' | 'stopped';
    quiz: QuizTemplateQuestion[];
  }) => Promise<Result<{ drillId: string }, DrillRepoError>>;
  updateDrillWithQuiz: (input: {
    drillId: string;
    channel: string;
    targetType: 'all' | 'specific' | 'random';
    targetCount?: number | null;
    targetUserIds?: string[] | null;
    subject: string;
    body: string;
    guidanceText: string;
    status: 'draft' | 'deliverable' | 'delivering' | 'stopped';
    quiz: QuizTemplateQuestion[];
  }) => Promise<Result<void, DrillRepoError>>;
  listDeliveryTargets: (input: {
    targetType: 'all' | 'specific' | 'random';
    targetCount: number | null;
    targetUserIds: string[] | null;
  }) => Promise<Result<DeliveryTarget[], DrillRepoError>>;
  getDrillDetail: (drillId: string) => Promise<Result<any, DrillRepoError>>;
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
    status: 'deliverable' | 'delivering' | 'sent' | 'failed' | 'stopped';
  }) => Promise<Result<void, DrillRepoError>>;
  recordSendInteraction: (input: { drillId: string; userId: string }) => Promise<Result<void, DrillRepoError>>;
};
