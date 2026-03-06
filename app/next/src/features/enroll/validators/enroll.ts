import { z } from 'zod';

import { emailSchema } from '../../../shared/validators/email';

export const enrollSchema = z.object({
  email: emailSchema,
  name: z.string().trim().optional(),
  slackUserId: z.string().trim().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: '訓練への参加に同意してください' }) }),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
