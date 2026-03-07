import { z } from 'zod';

export const updateDrillSchema = z
  .object({
    drillId: z.string().min(1),
    channel: z.enum(['email', 'slack', 'both']),
    targetType: z.enum(['all', 'specific', 'random']).default('all'),
    targetCount: z.number().nullable().optional(),
    targetUserIds: z.string().nullable().optional(), // Expected to be serialized JSON string from client
    subject: z.string(),
    body: z.string(),
    guidanceText: z.string(),
    quizQuestions: z.string().optional(),
    actionType: z.enum(['draft', 'deliverable', 'delivering']),
  })
  .superRefine((data, ctx) => {
    if (data.actionType === 'deliverable' || data.actionType === 'delivering') {
      if (!data.subject) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: '件名を入力してください', path: ['subject'] });
      }
      if (!data.body) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: '本文を入力してください', path: ['body'] });
      }
      if (!data.guidanceText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '誘導テキストを入力してください',
          path: ['guidanceText'],
        });
      }

      let parsedQuiz = [];
      if (data.quizQuestions) {
        try {
          parsedQuiz = JSON.parse(data.quizQuestions);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'クイズデータの形式が不正です',
            path: ['quizQuestions'],
          });
        }
      }
      if (parsedQuiz.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'クイズ問題を入力するかAI生成してください',
          path: ['quizQuestions'],
        });
      }

      // Add Target Type Validations
      if (data.targetType === 'random' && (!data.targetCount || data.targetCount <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ランダム選出の人数を正しく入力してください',
          path: ['targetCount'],
        });
      }

      if (data.targetType === 'specific') {
        let parsedUserIds: string[] = [];
        if (data.targetUserIds) {
          try {
            parsedUserIds = JSON.parse(data.targetUserIds);
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: '対象ユーザーリストの形式が不正です',
              path: ['targetUserIds'],
            });
          }
        }
        if (parsedUserIds.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '特定の個人を1人以上選択してください',
            path: ['targetUserIds'],
          });
        }
      }
    }
  });

export type UpdateDrillInput = z.infer<typeof updateDrillSchema>;
