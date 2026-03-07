/**
 * 訓練メールの本文（body）に含めてはいけない表現。
 * 受信者に「訓練用」と分かってしまうため、本文は本物の業務メールに見せる必要がある。
 * プロンプト戦略: root/doc/features/promptStrategy.md
 */
export const FORBIDDEN_BODY_PHRASES: readonly string[] = [
  '訓練',
  '講習',
  '教育プログラム',
  '教育の一環',
  '練習',
  '詐欺の例',
  '作成されたもの',
  '実害にはつながっていない',
  '実害にはつながっておりません',
  '訓練用',
  '訓練のために',
  '訓練用メール',
  'このメールは訓練',
  '練習用',
] as const;

/**
 * 本文に禁止表現が含まれているかチェックする（純粋関数）。
 * @returns 含まれていた表現のリスト（空なら問題なし）
 */
export function findForbiddenPhrasesInBody(body: string): string[] {
  if (!body.trim()) return [];
  const found: string[] = [];
  for (const phrase of FORBIDDEN_BODY_PHRASES) {
    if (body.includes(phrase)) {
      found.push(phrase);
    }
  }
  return found;
}
