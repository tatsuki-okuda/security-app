import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import { err, ok } from '../../../../shared/fp/result';

import type { LlmGateway } from '../../usecases/gateway/LlmGateway';

export const createLangchainLlmGateway = (): LlmGateway => ({
  generateContent: async ({ scenarioType }) => {
    try {
      const llm = new ChatOpenAI({
        modelName: process.env.LLM_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        configuration: {
          baseURL: process.env.LLM_BASE_URL,
        },
      });

      const outputSchema = z.object({
        subject: z.string().describe('メールの件名。緊急性や重要性を適度に煽る内容にすること。'),
        body: z.string().describe('メールの本文。HTMLタグは使用せずプレーンテキストで記述。'),
        ctaText: z
          .string()
          .describe('本文内でクリックを促すリンクのテキスト文字列（例: 「パスワードの再設定はこちら」）'),
        ctaUrlPlaceholder: z.string().describe('リンク先URLのプレースホルダ。必ず {{TRACKING_URL}} を指定すること。'),
        guidanceText: z
          .string()
          .describe('訓練メール本文と合わせて表示する補足学習テキスト（詐欺を見抜くポイントなど短く解説）。'),
        riskNotes: z.string().describe('このシナリオにおけるリスクのポイントや解説メモ。'),
        quiz: z
          .array(
            z.object({
              order: z.number().describe('問題の表示順序 (1, 2, 3...)'),
              questionType: z
                .enum(['single_choice', 'multiple_choice'])
                .describe('問題形式（ラジオボタンかチェックボックスか）'),
              questionText: z.string().describe('問題文'),
              explanation: z.string().describe('正解後の解説文'),
              options: z
                .array(
                  z.object({
                    label: z.string().describe('選択肢の記号 (A, B, C...) または表示用ラベル'),
                    optionText: z.string().describe('選択肢の本文'),
                    isCorrect: z.boolean().describe('この選択肢が正解かどうか'),
                  }),
                )
                .min(2)
                .max(5)
                .describe('選択肢リスト'),
            }),
          )
          .min(3)
          .max(5)
          .describe('訓練に紐づくクイズ問題（3問〜5問）'),
      });

      const parser = StructuredOutputParser.fromZodSchema(outputSchema);

      const prompt = PromptTemplate.fromTemplate(`
あなたは企業の社内セキュリティ教育を担当するプロフェッショナルなリサーチャー・コピーライターです。
従業員が本物の標的型攻撃やフィッシング詐欺に引っかからないための「訓練用メール」と、その直後に解かせる「セキュリティクイズ」を作成してください。

訓練の目的は「従業員に気づかせること」であり、実害を与えることではありません。
以下のシナリオ指定に従い、必要な項目のすべてをJSON形式で生成してください。

【シナリオ】
{scenarioType}

【留意事項（メール本文）】
- 脅迫的すぎない範囲で、クリックを誘発するような自然な業務メールに偽装してください。
- リンクURLのプレースホルダは必ず \`{{TRACKING_URL}}\` にしてください。

【事例・Few-shot サンプル】
以下の品質を満たすように作成してください。
=== サンプル ===
シナリオ: パスワード再設定
件名: 【重要】ITサポート: アカウントパスワード有効期限切れの通知
本文: 
社員各位

社内ITサポートデスクです。
ご使用の社内アカウントのパスワード有効期限が本日で切れます。
引き続きシステムを利用するために、以下のリンクからパスワードの再設定をお願いいたします。

{{TRACKING_URL}}

※本日中に更新されない場合、アカウントがロックアウトされる可能性があります。
ctaText: パスワード再設定ページへ
===============

【留意事項（クイズ）】
- 訓練メールの内容や、そのシナリオに特有のセキュリティ知識（例: 送信元アドレスの確認、緊急性を煽る手口への対処）を問う実践的な問題を3〜5問作成してください。
- single_choice（単一選択）または multiple_choice（複数選択） を適切に混ぜてください。
- 正答の選択肢が必ず1つ以上存在するようにしてください。

{format_instructions}
      `);

      const chain = RunnableSequence.from([prompt, llm, parser]);

      const response = await chain.invoke({
        scenarioType,
        format_instructions: parser.getFormatInstructions(),
      });

      return ok(response);
    } catch (e: unknown) {
      if (e instanceof Error) {
        return err({ type: 'LLM_ERROR', message: `生成エラー: ${e.message}` });
      }
      return err({ type: 'LLM_ERROR', message: '不明なAI生成エラーが発生しました' });
    }
  },
});
