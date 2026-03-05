export type EnrollActionState =
  | { status: 'idle' }
  | {
      status: 'error';
      fieldErrors?: { email?: string[]; name?: string[]; consent?: string[]; slackUserId?: string[] };
      formError?: string;
    }
  | { status: 'success'; userId: string };
