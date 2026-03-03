export type EnrollUserInput = {
  email: string;
  consent: boolean;
  slackUserId?: string;
  channel: 'email' | 'slack' | 'both';
};
