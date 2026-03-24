import { useFormStatus } from "react-dom";

/**
 * useFormStatus()
 * - 가장 가까운 부모 <form>의 제출 진행 상태를 읽는다 (pending, data, method, action).
 * - 훅을 쓰는 컴포넌트는 반드시 해당 form의 자손이어야 한다 (같은 파일의 부모에 직접 쓰면 안 됨).
 * - action이 Promise를 반환하는 동안 pending === true.
 */

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "처리 중…" : "제출"}
    </button>
  );
}

function FormPendingHint() {
  const { pending, method } = useFormStatus();

  if (!pending) return null;

  return (
    <p className="text-muted-foreground text-sm" aria-live="polite">
      폼이 제출 중입니다 (method: {method}).
    </p>
  );
}

async function demoFormAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  await new Promise((r) => setTimeout(r, 800));
  // 데모: 콘솔에만 출력 (실제로는 여기서 fetch 등)
  console.log("[useFormStatus demo] submitted:", { name });
}

const UseFormStatusExample = () => {
  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          useFormStatus 예시
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          제출 버튼·힌트는 자식 컴포넌트에서{" "}
          <code className="text-foreground">useFormStatus</code>로{" "}
          <code className="text-foreground">pending</code>을 읽습니다. 부모{" "}
          <code className="text-foreground">form</code>의{" "}
          <code className="text-foreground">action</code>이 비동기인 동안 버튼이
          비활성화됩니다.
        </p>
      </div>

      <form action={demoFormAction} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="ufs-name" className="text-sm font-medium">
            이름
          </label>
          <input
            id="ufs-name"
            name="name"
            type="text"
            required
            placeholder="홍길동"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>

        <FormPendingHint />

        <div className="flex gap-2 pt-1">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
};

export default UseFormStatusExample;
