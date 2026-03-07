import { z } from 'zod';

export const createDrillSchema = z.object({
  title: z.string().min(1, '訓練名を入力してください'),
  scenarioType: z.string().min(1, 'シナリオを選択してください'),
  channel: z.enum(['email', 'slack', 'both']),
  targetType: z.enum(['all', 'specific', 'random']).default('all'),
  targetCount: z.number().nullable().optional(),
  targetUserIds: z.string().nullable().optional(), // Expected to be serialized JSON string from client
  subject: z.string(),
  body: z.string(),
  guidanceText: z.string(),
  actionType: z.literal('draft'),
});

export type CreateDrillInput = z.infer<typeof createDrillSchema>;
