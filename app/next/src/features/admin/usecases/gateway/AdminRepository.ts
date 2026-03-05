import { Result } from '../../../../shared/fp/result';

export type UserListItem = {
  id: string;
  email: string;
  role: string;
  optedOut: boolean;
  latestStatus: string;
};

export type UserDetail = {
  id: string;
  email: string;
  role: string;
  slackUserId: string | null;
  optedOut: boolean;
  drills: Array<{
    drillId: string;
    title: string;
    sentAt: Date | null;
    clickedAt: Date | null;
    learnedAt: Date | null;
    latestScore: number | null;
    passed: boolean | null;
  }>;
};

export type DrillListItem = {
  id: string;
  title: string;
  scenarioId: string | null;
  status: string;
  channel: string;
  sentAt: Date | null;
  recipientCount: number;
  clickCount: number;
  passCount: number;
};

export type DrillDetail = {
  id: string;
  title: string;
  status: string;
  channel: string;
  subject: string;
  body: string;
  guidanceText: string;
  sentAt: Date | null;
  quizQuestions: Array<{
    id: string;
    questionText: string;
    questionType: string;
    options: Array<{ label: string; optionText: string; isCorrect: boolean }>;
    explanation: string;
  }>;
  interactions: Array<{ type: string; occurredAt: Date }>;
  quizAttempts: Array<{ score: number; isPassed: boolean; submittedAt: Date | null }>;
};

export type AdminRepoError = { type: 'DB'; message: string } | { type: 'UNKNOWN'; message: string };

export type AdminRepository = {
  listUsers: () => Promise<Result<UserListItem[], AdminRepoError>>;
  getUserDetail: (userId: string) => Promise<Result<UserDetail | null, AdminRepoError>>;
  updateUserRole: (userId: string, role: string) => Promise<Result<void, AdminRepoError>>;
  listDrills: () => Promise<Result<DrillListItem[], AdminRepoError>>;
  getDrillDetail: (drillId: string) => Promise<Result<DrillDetail | null, AdminRepoError>>;
};
