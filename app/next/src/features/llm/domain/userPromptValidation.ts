/**
 * ユーザープロンプト（追加指示）のプロンプトインジェクション対策。
 * 長さ制限と、指示の上書き・安全方針の無効化を試みる表現の検出を行う。
 * 参照: root/doc/features/promptStrategy.md
 */

/** 追加指示の最大文字数（長大なペイロードによるインジェクションを抑止） */
export const MAX_USER_PROMPT_LENGTH = 500;

/**
 * プロンプトインジェクションとみなすパターン（含まれていたら拒否）。
 * 指示の無視・上書き、出力形式の変更、安全方針の無効化を狙う表現。
 */
const INJECTION_PATTERNS: readonly RegExp[] = [
  // 指示の無視・上書き
  /上記の?指示を無視/i,
  /前述の?指示を無視/i,
  /今までの指示を無視/i,
  /ignore\s+(previous|all|above|the)\s+(instructions?|prompt)/i,
  /新しい指示に従え/i,
  /新たな指示に従え/i,
  // 出力形式・ルールの変更
  /出力形式を変え/i,
  /JSONを出力するな/i,
  /形式は無視して/i,
  // システム役割の注入
  /^System\s*:/im,
  /^システム\s*:/im,
  // 安全方針の無効化（訓練目的の逸脱）
  /訓練用メールを作るな/i,
  /実害を与え/i,
  /個人情報を出力/i,
];

export type UserPromptValidationResult =
  | { ok: true; sanitized: string }
  | { ok: false; formError: string };

/**
 * 追加指示の検証（長さ・インジェクション疑い）。
 * トリムし、長さ超過または危険パターン検出時は拒否する。
 */
export function validateUserPrompt(raw: string): UserPromptValidationResult {
  const sanitized = raw.trim();
  if (sanitized.length === 0) {
    return { ok: true, sanitized: '' };
  }
  if (sanitized.length > MAX_USER_PROMPT_LENGTH) {
    return {
      ok: false,
      formError: `追加指示は${MAX_USER_PROMPT_LENGTH}文字以内で入力してください。`,
    };
  }
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        ok: false,
        formError:
          '追加指示に許可されていない表現が含まれています。差出人・トーン・文体などのスタイル指示のみ入力してください。',
      };
    }
  }
  return { ok: true, sanitized };
}
