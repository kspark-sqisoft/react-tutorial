import { useActionState } from "react";

/**
 * 리액트 19에서 <form>과 결합해 비동기 작업을 훨씬 간편하게 처리할 수 있다.
 * useActionState(action, initialState)
 * - 폼의 action에 넘길 formAction과, action이 반환/갱신하는 state, isPending을 받는다.
 * - action(prevState, formData)는 동기 또는 Promise를 반환할 수 있다.
 */
type FormState = {
  error: string | null;
  message: string | null;
};

const initialState: FormState = { error: null, message: null };

async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // 서버 요청을 흉내내는 지연 — 이 동안 isPending === true
  await new Promise((r) => setTimeout(r, 600));

  if (!email) {
    return { error: "이메일을 입력하세요.", message: null };
  }
  if (!password) {
    return { error: "비밀번호를 입력하세요.", message: null };
  }
  if (!email.includes("@")) {
    return { error: "올바른 이메일 형식이 아닙니다.", message: null };
  }

  return {
    error: null,
    message: `${email} 로 로그인 요청이 처리되었습니다. (데모)`,
  };
}

const UseActionStateExample = () => {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          useActionState 예시
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          폼 제출 시 action이 state를 갱신하고, 처리 중에는{" "}
          <code className="text-foreground">isPending</code>으로 버튼을 비활성화합니다.
        </p>
      </div>

      <form
        action={formAction}
        className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-sm"
      >
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={isPending}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
            placeholder="••••••••"
          />
        </div>

        {state.error ? (
          <p className="text-destructive text-sm" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? "처리 중…" : "로그인"}
        </button>
      </form>
    </div>
  );
};

export default UseActionStateExample;
