import { z } from 'zod';

import { emailSchema } from '../../../shared/validators/email';

export const enrollSchema = z
  .object({
    email: emailSchema,
    slackUserId: z.string().trim().optional(),
    channel: z.enum(['email', 'slack', 'both']),
    consent: z.boolean().refine((value) => value, { message: '訓練への参加に同意してください' }),
  })
  .superRefine((value, ctx) => {
    if ((value.channel === 'slack' || value.channel === 'both') && !value.slackUserId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['slackUserId'], message: 'Slack ID を入力してください' });
    }
  });

export type EnrollInput = z.infer<typeof enrollSchema>;
