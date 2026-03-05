import { z } from 'zod';

export const createDrillSchema = z
  .object({
    title: z.string().min(1, '訓練名を入力してください'),
    scenarioType: z.string().min(1, 'シナリオを選択してください'),
    channel: z.enum(['email', 'slack', 'both']),
    subject: z.string(),
    body: z.string(),
    guidanceText: z.string(),
    quizQuestions: z.string().optional(),
    actionType: z.enum(['draft', 'deliverable', 'delivering']),
  })
  .superRefine((data, ctx) => {
    // draft 以外は必須チェックを行う
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
    }
  });

export type CreateDrillInput = z.infer<typeof createDrillSchema>;
