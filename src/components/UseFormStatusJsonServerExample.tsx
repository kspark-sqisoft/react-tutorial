import { useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * json-server: `npm run delayserver` → http://localhost:3000
 * POST /posts — JSON 본문에 id를 넣지 않으면 서버가 id를 부여합니다.
 *
 * useFormStatus는 <form>의 자손 컴포넌트에서만 사용할 수 있어
 * 입력/버튼을 자식으로 분리합니다. 결과 메시지는 이 예시에서만 부모 state로 표시합니다
 * (useActionState 예시와 역할을 나누기 위함).
 */
const POSTS_API = "http://localhost:3000/posts";

type Post = {
  id: number;
  title: string;
  views: number;
  likes: number;
};

type Feedback = { kind: "error" | "success"; text: string } | null;

function PostFields() {
  const { pending } = useFormStatus();

  return (
    <>
      <div className="space-y-1">
        <label htmlFor="ufsjs-title" className="text-sm font-medium">
          제목
        </label>
        <input
          id="ufsjs-title"
          name="title"
          type="text"
          required
          disabled={pending}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
          placeholder="새 글 제목"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="ufsjs-views" className="text-sm font-medium">
          조회수 (선택, 기본 0)
        </label>
        <input
          id="ufsjs-views"
          name="views"
          type="number"
          min={0}
          step={1}
          disabled={pending}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
          placeholder="0"
        />
      </div>
    </>
  );
}

function SubmitRow() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "저장 중…" : "글 등록 (POST /posts)"}
    </button>
  );
}

function PendingNote() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <p className="text-muted-foreground text-sm" aria-live="polite">
      json-server로 POST 요청 중입니다…
    </p>
  );
}

const UseFormStatusJsonServerExample = () => {
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function createPostAction(formData: FormData) {
    setFeedback(null);

    const title = String(formData.get("title") ?? "").trim();
    const viewsRaw = String(formData.get("views") ?? "").trim();
    const views = viewsRaw === "" ? 0 : Number(viewsRaw);

    if (!title) {
      setFeedback({ kind: "error", text: "제목을 입력하세요." });
      return;
    }
    if (Number.isNaN(views) || views < 0) {
      setFeedback({
        kind: "error",
        text: "조회수는 0 이상의 숫자여야 합니다.",
      });
      return;
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
        setFeedback({
          kind: "error",
          text: `요청 실패 (${res.status} ${res.statusText})`,
        });
        return;
      }

      const created: Post = await res.json();
      setFeedback({
        kind: "success",
        text: `저장됨 — id ${created.id}, "${created.title}"`,
      });
    } catch (e) {
      setFeedback({
        kind: "error",
        text:
          e instanceof Error
            ? e.message
            : "네트워크 오류. 터미널에서 json-server를 실행했는지 확인하세요.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          useFormStatus + json-server POST
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          폼 <code className="text-foreground">action</code>에서{" "}
          <code className="text-foreground">POST /posts</code>를 호출합니다. 자식
          컴포넌트의 <code className="text-foreground">useFormStatus().pending</code>
          으로 입력·버튼을 막습니다.{" "}
          <code className="text-foreground">npm run delayserver</code>로 지연을 두면
          pending 상태를 더 잘 볼 수 있습니다.
        </p>
      </div>

      <form
        action={createPostAction}
        className="border-border bg-card space-y-3 rounded-xl border p-4 shadow-sm"
      >
        <PostFields />

        {feedback?.kind === "error" ? (
          <p className="text-destructive text-sm" role="alert">
            {feedback.text}
          </p>
        ) : null}
        {feedback?.kind === "success" ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {feedback.text}
          </p>
        ) : null}

        <PendingNote />
        <SubmitRow />
      </form>
    </div>
  );
};

export default UseFormStatusJsonServerExample;
