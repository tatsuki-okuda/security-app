import { z } from 'zod';

import { emailSchema } from '../../../shared/validators/email';

export const enrollSchema = z.object({
  email: emailSchema,
  name: z.string().trim().optional(),
  slackUserId: z.string().trim().optional(),
  consent: z.boolean().optional(),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
