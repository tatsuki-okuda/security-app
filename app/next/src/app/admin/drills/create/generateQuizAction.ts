'use server';

import { createContainer } from '../../../../_di/container.server';
import { validateUserPrompt } from '../../../../features/llm/domain/userPromptValidation';

import type { GenerateQuizActionState } from '../../../../features/llm/contracts/generate';

export const generateQuizAction = async (
  _prev: GenerateQuizActionState,
  formData: FormData,
): Promise<GenerateQuizActionState> => {
  const scenarioType = String(formData.get('scenarioType') ?? '');
  const emailBody = String(formData.get('emailBody') ?? '');
  const rawUserPrompt = formData.get('userPrompt') ? String(formData.get('userPrompt')) : '';
  const questionCountStr = formData.get('questionCount');
  const questionCount = questionCountStr ? parseInt(String(questionCountStr), 10) : 3;

  if (!emailBody) {
    return { status: 'error', formError: 'メール本文が必要です' };
  }

  const validation = validateUserPrompt(rawUserPrompt);
  if (!validation.ok) {
    return { status: 'error', formError: validation.formError };
  }
  const userPrompt = validation.sanitized || undefined;

  const c = createContainer();

  // 第2層: LLMによる意図判定（スタイル指定のみかどうかのチェック）
  if (userPrompt) {
    const judgeResult = await c.llm.usecases.judgeUserPrompt({ userPrompt });
    if (!judgeResult.ok) {
      return { status: 'error', formError: 'システムエラー: 入力の検証に失敗しました。' };
    }
    if (!judgeResult.value.isStyleOnly) {
      // インジェクションまたは意図しない指示が含まれる場合はブロック
      return { 
        status: 'error', 
        formError: '追加指示に許可されていない表現、または意図しない形式が含まれています。文体の指定のみを入力してください。' 
      };
    }
  }

  const result = await c.llm.usecases.generateQuiz({ scenarioType, emailBody, userPrompt, questionCount });

  if (!result.ok) {
    return { status: 'error', formError: result.error.message };
  }

  return {
    status: 'success',
    data: {
      quiz: result.value.quiz,
    },
  };
};
