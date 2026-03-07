export type UpdateDrillActionState =
  | { status: 'idle' }
  | { status: 'error'; fieldErrors?: Record<string, string[]>; formError?: string }
  | { status: 'success'; drillId: string };
