import { z } from 'zod';

export const emailSchema = z
  .string()
  .email({ message: 'メールアドレスの形式が不正です' })
  .refine((val) => val.length > 0, { message: 'メールアドレスを入力してください' });
