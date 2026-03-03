import { z } from 'zod';

export const createDrillSchema = z.object({
  title: z.string().min(1, '訓練名を入力してください'),
  scenarioType: z.string().min(1, 'シナリオを選択してください'),
  channel: z.enum(['email', 'slack', 'both']),
  subject: z.string().min(1, '件名を入力してください'),
  body: z.string().min(1, '本文を入力してください'),
  guidanceText: z.string().min(1, '誘導テキストを入力してください'),
});

export type CreateDrillInput = z.infer<typeof createDrillSchema>;
