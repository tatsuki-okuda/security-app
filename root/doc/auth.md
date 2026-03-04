# 認証・認可仕様 (Authentication & Authorization)

本ドキュメントでは、Security Drillアプリケーションにおける認証（Authentication）および認可（Authorization）の仕組みについて解説する。

---

## 1. 概要

本プロジェクトでは、認証基盤として **[Auth.js v5 (NextAuth)](https://authjs.dev/)** を採用している。
ユーザーのセッション情報はJWT（JSON Web Token）として管理され、Edge環境（Next.js Middleware）での高速な認可判定を実現している。また、データベースとのセッション情報の同期・永続化には **[Prisma Adapter](https://authjs.dev/reference/adapter/prisma)** を使用する。

## 2. 認証方式（Providers）

パスワードレスログインを基本とし、以下の外部プロバイダ（OAuth）を利用する。

- **Google**
  - 環境変数: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- **LINE**
  - 環境変数: `AUTH_LINE_ID`, `AUTH_LINE_SECRET`
  - ※LINE APIからメールアドレスを取得するため、`scope: 'profile openid email'` を指定してリクエストを行っている。

（設定ファイル: `app/next/src/auth.config.ts`）

## 3. セッション管理とロールベースアクセス制御（RBAC）

データベース検索によるオーバーヘッドを減らし、Middleware（Edge）での処理を可能にするため、セッション戦略にはデータベースセッション（Database sessions）ではなく **JWT（`strategy: 'jwt'`）** を採用している。

### トークンの拡張（Callbacks）

ログイン時に取得する基本のユーザー情報に加え、データベース（`User`モデル）に保持している内部のIDとロール（役割）情報をセッションに追加している。

1. **`jwt` コールバック**:
   - 初回サインイン時、DBから取得した `User` オブジェクトの `id` と `role`（デフォルトは `'user'`）を JWT トークンに付与する。
   - **初期マスター管理者の自動付与**: 環境変数 `AUTH_ADMIN_EMAILS` に設定されたメールアドレス（カンマ区切りで複数指定可）でサインインしたユーザーには、初回サインイン時に強制的に `role: 'admin'` を付与する仕組みを入れている。
2. **`session` コールバック**:
   - リクエスト毎にトークンの `id` と `role` をクライアントやサーバーコンポーネントが参照する `session.user` オブジェクトにコピーする。

これにより、すべてのリクエスト（コンポーネントやAPI側）で `session.user.role` を即座に確認可能となっている。

### 承認フロー（Roleの昇格）

GoogleやLINE経由で新規ログインを行った一般のユーザーは、原則として `role: 'user'` として登録されるため、管理画面へのアクセス権を持たない。
これらに対してAdmin権限を付与する場合は、すでにAdmin権限を持っているマスター管理者が、**参加者管理画面 (`/admin/users`)** もしくは **参加者詳細画面 (`/admin/users/[id]`)** のUIから操作を行い、該当ユーザーの `role` を `admin` へ変更（昇格）させる運用フローとなる。

## 4. 認可とアクセス制御（Middleware）

ページおよびAPIルートの保護は、主に Next.js Middleware (`app/next/src/middleware.ts`) によって一元管理されている。

### アクセス制御ルール

1. **ゲストアクセス（パブリック）**
   - 以下のパスは認証なしでアクセス可能としている（訓練参加者向けの公開画面）。
   - `/learn/*` （学習説明・クイズ・完了）
   - `/t/*` （訓練リンククリック判定）
   - `/error/invalid-token` （無効なトークン時の案内）
   - `/settings/opt-out` （オプトアウト設定）
2. **Auth.js エンドポイント**
   - `/api/auth/*` はNextAuthの内部処理（コールバックやセッション取得等）のために通過を許可する。
3. **管理者（Admin）専用ルート**
   - `/admin/*` 配下のページやAPIは、管理機能であるため **`role === 'admin'`** が必須となる。
   - ログインしていない場合は、ページ側でログインモーダルを表示させるために 401 情報を付随してフォールバックさせる。
   - ログイン済みであっても `role !== 'admin'` の場合は、APIなら 403 などのエラーレスポンスを返し、ページならエラー画面等などの制御に任せる。
4. **開発用バイパス機能**
   - 開発時の利便性やテスト目的のため、環境変数 `AUTH_BYPASS=true` が設定されている場合は、全ての認証・認可チェックをバイパスしアクセスを許可する。

## 5. カスタムサインインページ

Auth.js デフォルトのログイン画面（`/api/auth/signin`）を隠蔽し、シームレスな体験を提供するため、`auth.config.ts` にて `signIn: '/admin'` を設定している。
これにより、未認証状態で保護されたページにアクセスした場合などには、NextAuthは `/admin` ベースのページ群へルーティングし、プロジェクトで独自実装したログインモーダル（Admin配下で実装）を表示させている。

---

## 関連情報

- アプリケーションの各画面への認証による詳細なアクセス可否については、[画面構成（screenConfiguration.md）](./screenConfiguration.md) を参照すること。
