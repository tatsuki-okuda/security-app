---
title: 訓練コンテンツ生成プロンプト戦略
purpose: LangChain + ローカルLLMで高品質な訓練文面を生成するための指針
---

## 方針サマリ
- シナリオ別プロンプトテンプレ（パスワード再設定 / 添付 / 請求・見積 / アカウント警告 / 社内ツール通知 / 配送・ギフトなど）
- Few-shot（3〜5例）で良質サンプルを提示
- RAG: 過去の良質サンプルやポリシー文をチャンク化＆ベクター検索でコンテキスト投入
- JSON出力固定: `subject`, `body`, `ctaText`, `ctaUrlPlaceholder`, `scenarioType`, `riskNotes`
- Self-critique / LLM-as-a-judge で品質・安全チェック
- 再生成＆人手修正を `Admin2-5` 訓練詳細で実施

## プロンプト構成（例）
1. **System**: セーフティガード・目的（フィッシング訓練であること、実害禁止、個人情報生成禁止）。
2. **Scenario**: シナリオ固有指示（例: 「パスワード再設定」「請求・見積」など）。
3. **Style/Persona**: 管理者が入力した追加指示（例: 社長になりすます、会社名・代表者名、トーン、長さ）は、必ずプロンプトの「追加指示」としてテンプレートに埋め込み、LLM に渡すこと。省略してはならない。
4. **Few-shot**: 3〜5件の良質サンプル（件名/本文/誘導文）。
5. **Context (RAG)**: 類似シナリオの抜粋、禁止事項リスト、表記ルール。
6. **Instruction**: JSON で `subject`, `body`, `ctaText`, `ctaUrlPlaceholder`, `scenarioType`, `riskNotes` を返す。HTMLやURLはプレースホルダ化。

## 評価フェーズ（LLM-as-a-judge）
- セーフティ: 有害表現/個人情報/実害リスクがないか。
- 誘導力: 開封・クリックを誘うが過度に脅迫的でないか。
- 品質: 誤植、プレースホルダ残り、フォーマット崩れがないか。
- ポリシー準拠: 内部規定や禁止語リストに抵触しないか。

## 運用フロー
1. `Admin3-1` 訓練作成でシナリオ選択 → バックエンドが上記プロンプト戦略で生成。
2. 生成結果は `Admin2-5` 訓練詳細に保存・表示（使用プロンプト含む）。
3. 管理者はプロンプト修正 → 再生成、または手動編集して確定。
4. 承認済みテンプレは `features/content` (Admin3) にも保存し再利用可能。

## 本文（body）と guidanceText の役割
- **body**: 受信者には本物の業務メール・社内通知に見せるため、body 内に「訓練」「講習」「教育」「練習」「詐欺の例」「作成されたもの」等、訓練であることが分かる表現を書いてはならない。
- **guidanceText**: 訓練であることの説明や「詐欺を見抜くポイント」等の補足学習テキストは、guidanceText にのみ記載する。本文（body）には含めない。

## プロンプトインジェクション対策
管理者入力（追加指示）に対するセキュリティチェックとプロンプト保護の多層防御アプローチについては、以下のドキュメントを参照してください。

- **詳細仕様**: [`promptInjectionDefense.md`](./promptInjectionDefense.md) （第1層: 静的チェック、第2層: LLMジャッジ、第3層: サンドボックス化について記載）

## 生成後の品質チェック（運用者への通知）
- 運用者が上記ルールを覚えていなくてもよいよう、**生成された本文（body）を事後チェック**する。禁止表現リスト（`features/llm/domain/forbiddenBodyPhrases.ts`）に合致する語が含まれていた場合、成功レスポンスに `bodyQualityWarning` を付与し、訓練作成画面で警告バナーを表示する。
- 管理者には「編集するか再生成してください」と案内し、再生成・手動編集で対応できるようにする。

## 実装メモ
- RAGストア: ローカルベクターDB（例: sqlite + pgvector も可）にシナリオ別サンプルを格納。
- LangChain graph: 生成 → ジャッジ → 必要なら自動リトライ（max 2〜3回）。
- ロギング: 生成プロンプト、コンテキストチャンク、出力、ジャッジ結果を`Drill`履歴に紐付け。
- プレースホルダ: CTA URL は `{{TRACKING_URL}}` など固定プレースホルダにして後段で差し込み。
- 追加指示: 管理者入力（userPrompt）はプロンプトテンプレートの「追加指示」ブロックに `{userPromptInstructions}` として必ず埋め込み、invoke に渡す。
- 本文品質チェック: GenerateDrillContentUseCase 内で gateway の戻り値の body を `findForbiddenPhrasesInBody`（domain）で検証し、禁止表現が含まれていれば `bodyQualityWarning` を付与。UI で警告バナー表示。
- プロンプトインジェクション対策: generateContentAction / generateQuizAction で `validateUserPrompt` を実行。長さ超過または危険パターン検出時はエラー返却。UI の追加指示欄は maxLength で 500 文字制限。
