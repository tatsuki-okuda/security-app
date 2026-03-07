'use server';

import { createContainer } from '../../../../_di/container.server';
import { validateUserPrompt } from '../../../../features/llm/domain/userPromptValidation';

import type { GenerateContentActionState } from '../../../../features/llm/contracts/generate';

export const generateContentAction = async (
  _prev: GenerateContentActionState,
  formData: FormData,
): Promise<GenerateContentActionState> => {
  const scenarioType = String(formData.get('scenarioType') ?? '');
  const rawUserPrompt = formData.get('userPrompt') ? String(formData.get('userPrompt')) : '';

  if (!scenarioType) {
    return { status: 'error', formError: 'シナリオを選択してください' };
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

  const result = await c.llm.usecases.generateContent({ scenarioType, userPrompt });

  if (!result.ok) {
    return { status: 'error', formError: result.error.message };
  }

  return {
    status: 'success',
    data: {
      subject: result.value.subject,
      body: result.value.body,
      guidanceText: result.value.guidanceText,
      ctaText: result.value.ctaText,
      ctaUrlPlaceholder: result.value.ctaUrlPlaceholder,
      riskNotes: result.value.riskNotes,
      bodyQualityWarning: result.value.bodyQualityWarning,
    },
  };
};
