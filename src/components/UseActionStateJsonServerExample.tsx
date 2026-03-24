import { useActionState } from "react";

/**
 * json-server: `npm run delayserver` → http://localhost:3000
 * POST /posts — body에 id를 넣지 않으면 서버가 id를 부여하고 db.json에 반영됩니다.
 */
const POSTS_API = "http://localhost:3000/posts";

type Post = {
  id: number;
  title: string;
  views: number;
  likes: number;
};

type FormState = {
  error: string | null;
  message: string | null;
};

const initialState: FormState = { error: null, message: null };

async function createPostAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = String(formData.get("title") ?? "").trim();
  const viewsRaw = String(formData.get("views") ?? "").trim();
  const views = viewsRaw === "" ? 0 : Number(viewsRaw);

  if (!title) {
    return { error: "제목을 입력하세요.", message: null };
  }
  if (Number.isNaN(views) || views < 0) {
    return { error: "조회수는 0 이상의 숫자여야 합니다.", message: null };
  }

  try {
    const res = await fetch(POSTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        views,
        likes: 0,
      }),
    });

    if (!res.ok) {
      return {
        error: `요청 실패 (${res.status} ${res.statusText})`,
        message: null,
      };
    }

    const created: Post = await res.json();
    return {
      error: null,
      message: `저장됨 — id ${created.id}, "${created.title}"`,
    };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "네트워크 오류. 터미널에서 json-server를 실행했는지 확인하세요.",
      message: null,
    };
  }
}

const UseActionStateJsonServerExample = () => {
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState,
  );

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          useActionState + json-server POST
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          폼을 제출하면 <code className="text-foreground">POST /posts</code>로 글이
          추가됩니다. <code className="text-foreground">npm run delayserver</code>로
          지연을 두면 <code className="text-foreground">isPending</code>을 더
          잘 볼 수 있습니다.
        </p>
      </div>

      <form
        action={formAction}
        className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-sm"
      >
        <div className="space-y-1">
          <label htmlFor="post-title" className="text-sm font-medium">
            제목
          </label>
          <input
            id="post-title"
            name="title"
            type="text"
            required
            disabled={isPending}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
            placeholder="새 글 제목"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="post-views" className="text-sm font-medium">
            조회수 (선택, 기본 0)
          </label>
          <input
            id="post-views"
            name="views"
            type="number"
            min={0}
            step={1}
            disabled={isPending}
            className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
            placeholder="0"
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
          {isPending ? "저장 중…" : "글 등록"}
        </button>
      </form>
    </div>
  );
};

export default UseActionStateJsonServerExample;
