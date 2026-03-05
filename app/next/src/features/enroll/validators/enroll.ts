import { z } from 'zod';

import { emailSchema } from '../../../shared/validators/email';

export const enrollSchema = z.object({
  email: emailSchema,
  slackUserId: z.string().trim().optional(),
  consent: z.boolean().refine((value) => value, { message: '訓練への参加に同意してください' }),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
