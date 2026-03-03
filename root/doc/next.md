---

# Next.js / React 設計ガイドライン

本プロジェクトでは、Reactの最新の設計思想に基づき、より良いUXと開発体験を実現しています。

このドキュメントは、`architecture.md` の全体構成を補足する形で、
**Next.js + React の実装パターンとベストプラクティス**を解説しています。

---

## 1. Async React の考え方

参考：[Async Reactとは何か](https://zenn.dev/cryptobox/articles/70b502e22954be)

### Async React とは

Async Reactとはアプリケーションをデフォルトで非同期とみなして構築する考え方です。

```
await UI = await f(await state)
```

つまり、**ユーザー操作 → バックエンド処理 → UI更新** の流れが非同期であることを前提に、
ちらつきや不快な挙動を排除する設計を目指すものです。

### Sync React の問題点

#### ちらつき

画面遷移 → ローディング → データ表示 の流れで、ネットワークが高速だとローディングが一瞬で終わり、
ちらついて見える問題があります。

また、データ更新時に不要な再取得が発生し、表示がカクカクすることもあります。

#### 過剰なローディングフィードバック

例：TODOリスト内の1つのタスクを更新する際、
そのタスクだけでなく、更新していない他のタスクまでローディング状態になってしまう。

### このアーキテクチャでの実装

このプロジェクトは構造的に Async React の問題を避けやすくなっています：

#### Server Components でデータ取得

```tsx
// app/enroll/page.tsx
import { EnrollList } from "@/features/enroll/_ui";

export default async function EnrollPage() {
  // サーバー側でデータ取得完了
  const enrollments = await fetchEnrollments();

  // HTML として送信されるため、ちらつきがない
  return <EnrollList enrollments={enrollments} />;
}
```

- データ取得がサーバー側で完結
- HTML として クライアントに送信されるため **ちらつきが発生しない**
- `useEffect + useState` の複雑さが不要

#### Suspense + Fallback UI

```tsx
// app/enroll/page.tsx
import { Suspense } from "react";
import { EnrollList, EnrollListFallback } from "@/features/enroll/_ui";

export default function EnrollPage() {
  return (
    <Suspense fallback={<EnrollListFallback />}>
      <EnrollListContainer />
    </Suspense>
  );
}

async function EnrollListContainer() {
  const enrollments = await fetchEnrollments();
  return <EnrollList enrollments={enrollments} />;
}
```

- `<Suspense>` が loading 状態を自動管理
- fallback UI で「今読み込み中」を明確に表示
- UIのコンポーネント分割と状態管理がシンプル

#### useActionState による楽観的更新

```tsx
// features/enroll/_ui/presentation/EnrollForm.tsx
import { useActionState } from "react";
import { enrollAction } from "@/app/enroll/actions";

export function EnrollForm() {
  const [state, formAction, isPending] = useActionState(enrollAction, null);

  return (
    <form action={formAction}>
      <input name="email" required />
      <button disabled={isPending}>
        {isPending ? "送信中..." : "送信"}
      </button>
      {state?.error && <span className="error">{state.error}</span>}
    </form>
  );
}
```

- Server Action の処理中、UI がすぐに反応（pending状態）
- エラーハンドリングまで一元管理
- ローディングスピナーの「過剰表示」を避けられる

---

## 2. サーバー状態 vs クライアント状態の分離

参考：[useEffect で API を叩くのを卒業しよう](https://zenn.dev/ashunar0/articles/32419c3c60cc53)

### サーバー状態とは

**サーバー上に本物のデータがあり、フロントエンドはそのコピーを持っているだけの状態**

- **例**：投稿一覧、ユーザー情報、セッションデータ
- **特性**：他のユーザーの操作で古くなる可能性がある
- **正解**：サーバーが持っている

### クライアント状態とは

**ブラウザの中でしか存在しない状態**

- **例**：フォーム入力値、モーダルの開閉、ダークモード設定
- **特性**：自分が触らない限り変わらない
- **正解**：クライアント側で持っている

### 従来の useEffect パターン（アンチパターン）

```tsx
// ❌ 避けるべき: useEffect で API を叩く
const [posts, setPosts] = useState<Post[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得に失敗");
    } finally {
      setIsLoading(false);
    }
  };
  fetchPosts();
}, []);
```

**問題点：**

- `useState` が3つ必要（データ、ローディング、エラー）
- 毎回同じ「儀式」をコピペ
- キャッシュの概念がない
- 画面を行き来するたびに毎回API呼び出し

**根本原因：**
サーバー状態をクライアント状態として無理やり管理している

### このアーキテクチャでの実装

#### Server Components でサーバー状態をサーバーに置く

```tsx
// ✅ 推奨: Server Component で直接 fetch
async function EnrollmentList() {
  const enrollments = await fetchEnrollments();

  return (
    <ul>
      {enrollments.map(e => (
        <li key={e.id}>{e.email}</li>
      ))}
    </ul>
  );
}
```

**利点：**

- `useState`, `useEffect` が不要
- キャッシュをサーバー側で管理できる
- クライアント側で古いデータを持つ問題がない
- コード量が圧倒的に少ない

#### Client Component が必要な場合

**フォーム入力値などのクライアント状態のみに**

```tsx
// ✅ 推奨: クライアント状態のみを管理
"use client";

import { useState } from "react";

export function EnrollForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Server Action を呼び出す
    // （フォーム値はこちらが提供）
    await enrollAction({ email, consent });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <label>
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
        同意
      </label>
      <button type="submit">登録</button>
    </form>
  );
}
```

#### 複数エンドポイントが必要な Client Component の場合

**TanStack Query / SWR の採用を検討**

```tsx
// 例：複数の独立したデータ取得が必要な場合
"use client";

import { useQuery } from "@tanstack/react-query";

export function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      return res.json();
    },
  });

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>統計: {stats?.count}</p>
    </div>
  );
}
```

---

## 3. Server Actions のベストプラクティス

### Server Actions とは

`"use server"` ディレクティブを持つ関数で、
サーバー側で実行される非同期関数です。

**RPC的な役割：** フロントエンド → バックエンド通信を型安全に実現

### Server Actions の責務

```tsx
// app/enroll/actions.ts
"use server";

import { redirect } from "next/navigation";
import { enrollUsecase } from "@/features/enroll/usecases";
import { enrollSchema } from "@/features/enroll/validators";

export async function enrollAction(
  prevState: EnrollActionState | null,
  formData: FormData
): Promise<EnrollActionState> {
  // 1. クライアント入力のバリデーション
  const parseResult = enrollSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on",
  });

  if (!parseResult.success) {
    return {
      error: "入力形式が不正です",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  // 2. ビジネスロジック（usecase）を呼び出し
  const result = await enrollUsecase.execute(parseResult.data);

  if (!result.isSuccess) {
    return {
      error: result.error.message,
    };
  }

  // 3. 成功時、Server 側で直接リダイレクト
  // Client 側の useEffect は不要
  redirect("/dashboard");
}
```

### 流れ図

```
Client Component (フォーム)
  ↓ formData（型チェック後）
Server Action
  ↓ zod で入力検証
  ↓ usecase 呼び出し
  ↓ domain での最終検証
usecase / infrastructure
  ↓ Repository で DB操作
  ↓ 成功なら redirect()
  ↓
ブラウザが新しいページ（/dashboard）をリクエスト
```

### リダイレクト処理のベストプラクティス

#### ✅ 推奨：Server Action 内で `redirect()` を使う

```tsx
// app/enroll/actions.ts
"use server";

import { redirect } from "next/navigation";

export async function enrollAction(
  prevState: EnrollActionState,
  formData: FormData
): Promise<EnrollActionState> {
  const parseResult = enrollSchema.safeParse({...});
  if (!parseResult.success) {
    return { error: "入力形式が不正です", fieldErrors: ... };
  }

  const result = await enrollUsecase.execute(parseResult.data);

  if (!result.isSuccess) {
    return { error: result.error.message };
  }

  // Server 側で完結、Client 側の useEffect/router.push() は不要
  redirect("/dashboard");
}
```

**利点：**
- リダイレクト処理が Server 側で完結
- Client 側の `useEffect` や `router.push()` が不要
- 二重遷移やレース条件のリスクなし
- Server Components が既にロードされた状態でレンダリング開始

#### ❌ 避けるべき：Client 側で `useEffect` + `router.push()`

```tsx
// ❌ アンチパターン
"use client";

export function EnrollForm() {
  const [state, formAction] = useActionState(enrollAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard"); // ← レース条件のリスク、UI点滅の可能性
    }
  }, [state, router]);
}
```

**問題：**
- レース条件：`state` が変わるたび useEffect が再実行される可能性
- 二重遷移のリスク
- UI の一瞬の点滅（成功画面が見える）

#### シンプルなフォーム（action のみ）

```tsx
// features/enroll/_ui/presentation/EnrollForm.tsx
"use client";

import { useActionState } from "react";
import { enrollAction } from "@/app/enroll/actions";

export function EnrollForm() {
  const [state, formAction, isPending] = useActionState(enrollAction, null);

  return (
    <form action={formAction}>
      <input
        name="email"
        type="email"
        required
        aria-invalid={!!state?.fieldErrors?.email}
      />
      {state?.fieldErrors?.email && (
        <span className="error">{state.fieldErrors.email[0]}</span>
      )}

      <label>
        <input name="consent" type="checkbox" required />
        {state?.fieldErrors?.consent && (
          <span className="error">{state.fieldErrors.consent[0]}</span>
        )}
        同意します
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "送信"}
      </button>

      {state?.success && <p className="success">{state.message}</p>}
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

#### React Hook Form + useActionState ハイブリッドパターン

**より実践的で UX が優れたパターン。クライアント即時バリデーション + Server Actions の組み合わせ。**

```tsx
// features/enroll/_ui/hooks/useEnrollForm.ts
"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enrollSchema, type EnrollInput } from "../../validators/enroll";
import type { EnrollActionState } from "../../contracts/enroll";

type EnrollAction = (
  prev: EnrollActionState,
  formData: FormData
) => Promise<EnrollActionState>;

export const useEnrollForm = (action: EnrollAction) => {
  // 1. React Hook Form: クライアント即時バリデーション
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors: clientErrors, isSubmitting },
  } = useForm<EnrollInput>({
    resolver: zodResolver(enrollSchema),
    mode: "onBlur", // blur 時にバリデーション
  });

  // 2. useActionState: Server Action 結果を管理
  const [state, formAction, isPending] = useActionState(action, initialState);

  // 3. クライアントエラー + サーバーエラーをマージ
  const mergedEmailErrors = [
    ...(clientErrors.email?.message ? [clientErrors.email.message] : []),
    ...(state.status === "error" && state.fieldErrors?.email
      ? state.fieldErrors.email
      : []),
  ];

  // 4. フォーム送信: FormData を生成して Server Action に渡す
  const handleSubmit = handleFormSubmit(async (data: EnrollInput) => {
    const formData = new FormData();
    formData.set("email", data.email);
    await formAction(formData);
  });

  return {
    register,
    handleSubmit,
    mergedEmailErrors,
    formError: state.status === "error" ? state.formError : undefined,
    isPending: isPending || isSubmitting,
  };
};
```

```tsx
// features/enroll/_ui/components/EnrollFormView.tsx
import type { UseFormRegister } from "react-hook-form";
import type { EnrollInput } from "../../validators/enroll";

type Props = {
  register: UseFormRegister<EnrollInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  emailErrors: string[];
  formError?: string;
};

export const EnrollFormView = ({
  register,
  onSubmit,
  emailErrors,
  formError,
}: Props) => {
  return (
    <form onSubmit={onSubmit} noValidate>
      <input {...register("email")} />
      {emailErrors.length > 0 && <span className="error">{emailErrors[0]}</span>}
      {formError && <p className="error">{formError}</p>}
      <button type="submit">送信</button>
    </form>
  );
};
```

**重要：** リダイレクト処理は Server Action 内で `redirect()` を使うため、Client 側の `useEffect` や `router.push()` は不要です。

**利点：**

| 項目 | action のみ | React Hook Form + useActionState |
|-----|-----------|--------------------------------|
| クライアント即時バリデーション | ❌ なし | ✅ onBlur で即座 |
| フォーム状態管理 | FormData のみ | useForm で一元管理 |
| dirty/touched 追跡 | 手動 | 自動 |
| UX（エラー表示） | 送信後のみ | 入力中から表示 |
| 複数フィールド拡張 | FormData 増加 | register で簡潔 |
| リダイレクト | - | Server Action の redirect() |

---

## 4. バリデーション戦略

### zod は UX のため、domain は安全性のため

```
クライアント（UX）
  ↓ zod で即時フィードバック（onChange/onBlur）
Server Action
  ↓ zod で再検証（クライアント改変対策）
  ↓ domain/usecase で最終検証（ビジネスルール）
```

### 実装例

```tsx
// features/enroll/validators/index.ts
import { z } from "zod";
import { emailSchema } from "@/shared/validators";

export const enrollSchema = z.object({
  email: emailSchema,
  consent: z.boolean().refine(v => v, "同意が必須です"),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
```

#### React Hook Form + zod での使用

```tsx
// Client Component
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enrollSchema, type EnrollInput } from "../../validators/enroll";
import { useActionState } from "react";
import { enrollAction } from "@/app/enroll/actions";

export function EnrollForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnrollInput>({
    resolver: zodResolver(enrollSchema), // zod でバリデーション
    mode: "onBlur", // blur 時に検証
  });

  const [state, formAction] = useActionState(enrollAction, null);

  const onSubmit = handleSubmit(async (data: EnrollInput) => {
    // FormData を生成して Server Action に渡す
    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("consent", data.consent ? "on" : "");
    await formAction(formData);
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...register("email")} />
      {errors.email && <span className="error">{errors.email.message}</span>}
      {state?.fieldErrors?.email && (
        <span className="error">{state.fieldErrors.email[0]}</span>
      )}
      <button type="submit" disabled={isSubmitting}>登録</button>
    </form>
  );
}
```

#### domain / usecase での最終検証

```tsx
// features/enroll/domain/enroll.ts
export function validateEnrollment(email: Email, consent: Consent): Result<void, EnrollError> {
  // ビジネスルール検証
  if (isEmailAlreadyEnrolled(email)) {
    return Result.err(new DuplicateEmailError());
  }

  if (!consent.isGiven) {
    return Result.err(new ConsentRequiredError());
  }

  return Result.ok(undefined);
}
```

```tsx
// app/enroll/actions.ts
export async function enrollAction(
  prevState: EnrollActionState | null,
  formData: FormData
): Promise<EnrollActionState> {
  // 1. zod: 入力形式の検証（クライアント改変対策）
  const parseResult = enrollSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on",
  });

  if (!parseResult.success) {
    return { fieldErrors: parseResult.error.flatten().fieldErrors };
  }

  // 2. domain: ビジネスルール検証
  const result = await enrollUsecase.execute(parseResult.data);

  if (!result.isSuccess) {
    return { error: result.error.message };
  }

  return { success: true, data: result.value };
}
```

---

## 5. よくある陥穽と対策

### ❌ 陥穽1：Client Component で `useEffect + fetch`

```tsx
// ❌ 避けるべき
"use client";

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) return <div>読込中...</div>;
  return <div>{user?.name}</div>;
}
```

✅ **対策：** Server Component に変更

```tsx
// ✅ 推奨
export async function UserProfile({ userId }) {
  const user = await fetchUser(userId);
  return <div>{user?.name}</div>;
}
```

### ❌ 陥穽2：Server Actions で複雑なロジック

```tsx
// ❌ 避けるべき
export async function enrollAction(formData) {
  const email = formData.get("email");
  const consent = formData.get("consent");

  // ビジネスロジックが Server Action に混在
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "既に登録済みです" };
  }

  const user = await db.user.create({
    data: { email, consent },
  });

  await sendWelcomeEmail(email);

  return { success: true, userId: user.id };
}
```

✅ **対策：** ビジネスロジックを usecase に切り出す

```tsx
// ✅ 推奨
export async function enrollAction(formData) {
  const parseResult = enrollSchema.safeParse({...});
  if (!parseResult.success) return { fieldErrors: ... };

  // usecase が責務を担当
  const result = await enrollUsecase.execute(parseResult.data);

  if (!result.isSuccess) {
    return { error: result.error.message };
  }

  return { success: true, data: result.value };
}
```

### ❌ 陥穽3：domain/usecase が Prisma に直接依存

```tsx
// ❌ 避けるべき
export async function enrollUsecase(input) {
  // domain が DB (Prisma) に依存
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (user) {
    throw new DuplicateEmailError();
  }

  return prisma.user.create({ data: input });
}
```

✅ **対策：** usecase は gateway interface に依存

```tsx
// ✅ 推奨: usecases/gateway に interface を定義
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

// usecases で gateway に依存
export async function enrollUsecase(
  input: EnrollInput,
  userRepo: UserRepository
) {
  const existing = await userRepo.findByEmail(input.email);
  if (existing) {
    throw new DuplicateEmailError();
  }

  const user = new User(input.email);
  return userRepo.create(user);
}

// infrastructure/prisma で実装
export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(user: User) {
    return prisma.user.create({ data: user.toPrismaData() });
  }
}
```

### ❌ 陥穽4：form の状態を複数の `useState` で管理

```tsx
// ❌ 避けるべき
export function EnrollForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);

  // 複数の setState が分散
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await enrollAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setEmail("");
        setConsent(false);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
}
```

✅ **対策：** React Hook Form + useActionState で一元管理

```tsx
// ✅ 推奨
export function EnrollForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(enrollSchema),
  });

  const [state, formAction, isPending] = useActionState(enrollAction, null);

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();
    formData.set("email", data.email);
    await formAction(formData);
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      {state?.error && <span>{state.error}</span>}
      <button disabled={isPending}>送信</button>
    </form>
  );
}
```

---

## 6. 実装フロー（推奨パターン）

### 新機能を実装する際

```
1. domain/ で値オブジェクト・ビジネスルールを定義
   ↓
2. usecases/gateway に interface を定義
   ↓
3. infrastructure/prisma で Repository を実装
   ↓
4. app/**/actions.ts で Server Action を定義
   ↓
5. features/**/_ui で UI コンポーネントを実装
   ↓
6. 必要に応じて shared/ に共通化
```

### サーバー状態 vs クライアント状態の判断

```
サーバー上にデータがある？
  ↓ YES
  ↓ Server Component で fetch
  ↓ Suspense + fallback で loading UI
  ↓
  ↓ NO
  ↓ Client Component で useState
  ↓ Server Actions で更新
```

### Server Action 定義時のチェックリスト

- [ ] zod で入力検証
- [ ] usecase / domain で business validation
- [ ] エラーを ActionState に変換
- [ ] 戻り値の型は contract に定義した ActionState
- [ ] 副作用（DB操作・外部API）は infrastructure に委譲

### フォーム実装時のパターン選択

#### シンプルなフォーム（複数フィールドなし、validation が単純）

```
action={formAction} で十分
  ↓
useActionState のみで OK
```

#### 複数フィールド or 複雑なバリデーション

```
React Hook Form + useActionState ハイブリッド推奨
  ↓
1. React Hook Form: クライアント即時バリデーション
2. useActionState: Server Action 結果管理
3. zod + resolver: zodResolver で連携
```

**実装チェックリスト：**

- [ ] `useForm({ resolver: zodResolver(schema), mode: 'onBlur' })`
- [ ] `register()` でフィールド登録
- [ ] `handleSubmit()` で FormData 生成
- [ ] `useActionState()` で Server Action 呼び出し
- [ ] クライアントエラー + サーバーエラーをマージ表示

---

## 参考資料

- [Async Reactとは何か](https://zenn.dev/cryptobox/articles/70b502e22954be)
- [useEffect で API を叩くのを卒業しよう](https://zenn.dev/ashunar0/articles/32419c3c60cc53)
- [Next.js Documentation - Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Documentation - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React Documentation - useActionState](https://react.dev/reference/react/useActionState)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---
