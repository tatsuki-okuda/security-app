
# **Next.jsフルスタック（Server Actions）+ feature丸ごとClean Architecture** 前提で、**1週間以内で完成させる全体プラン**

---

## ゴール（コンテストMVP）

「社内セキュリティ訓練」を回せる最小セット

* 参加者登録（メール必須 + SlackID任意、まずはメール）
* 訓練メッセージ配信（最初は手動 or 簡易スケジューラでOK）
* クリック計測（罠リンク→学習ページに誘導）
* 学習（クイズ合格まで）
* 管理画面（クリック率、合格率、個別状況）
* （余力）AIでテンプレ生成（ただし“安全制約＋承認フロー”）

---

## アーキテクチャ方針（確定）

* **feature丸ごと**：`src/features/<feature>/contracts|validators|domain|usecases|infrastructure|_ui`
* **Next.js App Router**
  * 画面：Server Component
  * 送信/登録/計測：Server Actions（バックエンドAPI相当）
* フォーム：`useActionState` + **zod即時バリデーション**
* DB：Postgres + Prisma
* 共通：`src/shared/*`
* 依存関係の組み立て：`src/_di/container.server.ts`

---

## アクセス制御・権限（追加）

* **基本方針**：**ログイン必須**（画面は全て認証ユーザーのみ）
  * 例外：**`/learn/*` の学習ページのみゲスト閲覧可**
* **ロール**
  * `Admin`：訓練対象ユーザーの登録・管理、訓練配信、クリック/合格率などの集計閲覧
  * `User`（ログインユーザー）：管理画面以外の内部画面閲覧（要件に応じて）
  * `Guest`：`/learn/*` のみ閲覧可能（訓練メールで誘導）
* **認証方式（実装手段）**
  * Auth.js (NextAuth) v5 + App Router、Prisma Adapter
  * プロバイダ: Google OAuth / LINE Login（メール取得権限）
  * セッション/JWTに `role` を含め、`middleware.ts` で `/admin/**` を `role=admin` に限定
  * `/learn/*` はゲスト許可、それ以外はログイン必須
* **訓練メールの導線**
  * 受信者は **`/learn/[token or drillId]` へ直接遷移**
  * **学習ページ到達時にクリック判定を記録**（`/t/[token]` は不要 or 内部用）

---

## Feature 分割（MVP順）

1. `enroll`：登録（同意チェック必須）
2. `campaign`：キャンペーン作成・管理
3. `drill`：訓練配信（送信ログ作成）
4. `tracking`：クリック計測（tokenで紐づけ）
5. `learning`：学習/クイズ（合格までループ）
6. `admin`：管理画面（集計表示）
7. `content`：テンプレ管理（AI生成 + 承認）
8. `auth`：認証/認可（ロール判定、`/learn/*` 以外はログイン必須）

---

## DB設計（最小→拡張）

### 最小（最初に必要）

* `User(id, email, createdAt, consentedAt?)`

### MVP拡張（訓練の循環に必要）

* `Campaign(id, name, startAt, endAt, frequency, scenarioType)`
* `Drill(id, campaignId, userId, channel, sentAt, trackingToken)`
* `Interaction(id, drillId, type(click|report|ignore), at)`
* `QuizAttempt(id, drillId, userId, score, passed, at)`

### 余力（AI/承認）

* `Template(id, scenarioType, difficulty, body, aiGenerated, approvedAt)`

---

## 実装プラン（5日でもいける順）

### Day 1：基盤 + enroll 完了

* Podman/Docker compose：Next + Postgres
* Prisma migrate
* `_di/container.server.ts` のセットアップ
* `features/enroll` 一式（contracts/validators/domain/usecases/infrastructure/_ui）
* `app/enroll/page.tsx` + `actions.ts`
* zod即時 + `useActionState` で登録完了
* **必須**：同意チェック `consent` 追加
* **アクセス制御の足場**：`/learn/*` 以外はログイン必須

**成果物**：登録→DB保存→成功で遷移

---

### Day 2：tracking（クリック計測）+ 学習LPの入口

* `/t/[token]` みたいなトラッキングページ（Server Component）
* token を `Drill` と紐づけ
* クリックしたら `Interaction(click)` を記録
* 学習ページへ遷移

**成果物**：“踏んだ”がDBに残る

---

### Day 3：learning（クイズ）

* クイズ問題は最初は固定でOK（5問くらい）。本番は LLM 生成で single_choice / multiple_choice / text を出し分ける想定（question_type に応じて UI/採点を切替）。
* `QuizAttempt` 保存
* 合格点未満なら再受験（同ページで再挑戦）
* 合格したら `passed=true`

**成果物**：“踏んだら学習→合格まで”が回る

---

### Day 4：admin（管理画面）

* `User` 一覧
* クリック率（Interaction集計）
* 合格率（QuizAttempt集計）
* 個別の履歴（いつ踏んだ/いつ合格）
* **管理者のみ閲覧可能**（ロールチェック）

**成果物**：デモで一番映える管理画面が揃う

---

### Day 5：drill（配信）を最小で入れる

ここは環境に合わせて難易度が変わるから、MVPは段階的に。

**最小案（おすすめ）**

* 管理画面に「送信する」ボタン（手動配信）
* `Drill` レコード作成 + `trackingToken` 発行
* 送信は最初は “画面にURL表示”でもデモとして成立する

  * 余力があれば Email/Slack 実送信

**成果物**：管理者が対象に送る→踏む→学習→集計まで完結

**ローカルcronで「不定期っぽさ」を出す（今回のMVPで採用）**

* `node-cron` などで Next サーバ起動時にジョブ登録
* 10〜20分間隔などの短周期で擬似ランダム送信（デモ用）
* ジョブ内で `trackingToken` を発行し、対象ユーザー向けURLを生成
  * 最小はコンソール出力や管理画面パネルへの表示でも可
  * 余力があれば Email/Slack 実送信に差し替え
* 冪等性・リトライは割り切り、送信ログ（Drill/Interaction）だけ確実に残す

---

## テスト計画と実施タイミング

- 配置方針：`features/<feature>/tests/{unit,usecase,infrastructure,server-actions,ui,e2e}` に閉じる。共通ロジックは `shared/tests/*`。
- 日別の狙い：
  - Day1: enroll の unit/validators/usecase（consent/メール形式）と Server Action の橋渡しを最低限。UI はプレゼンテーションの状態遷移のみ。
  - Day2: tracking の usecase/infrastructure（token 検証・クリック記録）。UIは遷移確認程度。E2E は入口ページができてから。
  - Day3: learning/quiz の validators/usecase、採点・再受験ループの統合（infrastructure）。UIテストは出題/エラー表示まで。E2E（踏む→学習→クイズ）を初回実行。
  - Day4: admin 一覧/詳細の usecase（集計クエリ）と UI 表示。Server Action があれば橋渡しテスト。E2E で集計画面の確認。
  - Day5: drill 作成/配信の validators/usecase と Deliverable 判定。配信ボタンの Server Action をモック主体で検証。E2E は画面が揃い次第一部のみ。
- E2Eは画面完成後に段階実行：最小ルート（enroll→tracking→quiz→complete）を優先し、未実装画面は skip/pending で管理。
- モック方針：unit/usecase は gateway モック、Server Action は usecase モック、infrastructure/E2E はテストDB（.env.test + seed）を使う。
- カバレッジ：domain/validators/usecase を主対象。UI/E2E は別レポートまたは除外でノイズ低減。

---

## 余力があれば（+1〜2日）

### ランダム送信ジョブ（本番想定）

* **BullMQ + Redis** を使用したランダム送信ジョブ（product.mdに記載の通り）
* MVPでは Day 5 のローカルcronで簡易対応（短周期・デモ用）
* ただし本番想定なら **BullMQ + Redis** に寄せる

### Slack/Email連携

* Slack API（Incoming Webhook or chat.postMessage）
* Emailは dev なら MailHog などローカルSMTPで完結も可能
* コンテストならモックでもOK

### AIテンプレ（LangChain）

* “安全制約”付きでテンプレ候補生成
* **管理者が approve したものだけ送る**（強い）

---

## デモの通し方（3分）

1. 管理者がキャンペーン作成（期間、送信頻度、対象者、シナリオ種別）
2. 管理者が送信（手動でもOK）
3. ユーザーがリンク踏む（クリック記録）
4. 学習クイズへ誘導 → 合格まで
5. 管理画面でクリック率/合格率が即反映

---

## リスクと回避（MVPで割り切る）

* “不定期自動送信”はローカルcronで簡易対応（短周期・冪等性は割り切り）
* まず **登録→計測→学習→集計** のループを最優先（cronはこのループ成立後に有効化）
* AI生成は **承認フロー**前提で安全に
