export type CreateDrillActionState =
  | { status: 'idle' }
  | { status: 'error'; fieldErrors?: Record<string, string[]>; formError?: string }
  | { status: 'success'; drillId: string };
