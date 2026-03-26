/**
 * React 19 학습용 데모 (클라이언트 컴포넌트)
 * ---------------------------------------------------------------------------
 * 이 파일은 다음을 **아주 작은 예제**로만 보여 줍니다.
 * - useTransition: 급하지 않은 상태 업데이트를 전환(transition)으로 표시
 * - useActionState: 폼 액션의 이전/다음 상태를 React가 관리
 * - <form action={...}>: 브라우저 폼 제출과 연동되는 함수 액션
 * - useFormStatus: **같은 <form> 안의 자손**에서 제출 진행 여부 읽기
 * - useOptimistic: 서버 응답 전에 UI를 낙관적으로 갱신
 * - use: Promise(또는 Context)를 렌더 중에 읽기 — Suspense / Error Boundary와 함께
 *
 * 공식 문서: https://react.dev/reference/react
 */

import {
  Component,
  Suspense,
  use,
  useActionState,
  useCallback,
  useOptimistic,
  useState,
  useTransition,
  type ErrorInfo,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";

/** useTransition 데모용: 약 1.5만 행짜리 가짜 상품명 (모듈 로드 시 한 번만 생성) */
const CATALOG_SIZE = 15_000;
const PRODUCT_CATALOG: string[] = (() => {
  const colors = ["빨간", "파란", "노란", "초록", "검정", "흰"];
  const kinds = ["위젯", "부품", "센서", "모듈", "케이블", "렌즈"];
  const out: string[] = [];
  for (let i = 0; i < CATALOG_SIZE; i++) {
    out.push(
      `${colors[i % colors.length]}색 ${kinds[i % kinds.length]} · 시리얼 ${(4096 + i).toString(16)}`,
    );
  }
  return out;
})();

type CatalogFilterResult = { count: number; sample: string[] };

/**
 * 순수 CPU 연산만으로 "느린 필터"를 흉내 냅니다 (DOM에는 아직 안 그립니다).
 * 실무에서는 여기에 퍼지 검색·정규화·정렬 등이 들어가 비슷하게 무거워집니다.
 */
function filterCatalogHeavy(
  catalog: readonly string[],
  rawQuery: string,
): CatalogFilterResult {
  const q = rawQuery.trim().toLowerCase();
  const sample: string[] = [];
  const sampleCap = 10;
  let count = 0;

  for (let i = 0; i < catalog.length; i++) {
    const line = catalog[i]!;
    const hay = line.toLowerCase();
    const matches = q.length === 0 || hay.includes(q);
    if (!matches) continue;

    // 의도적 부하: 항목마다 수십 번 문자열을 훑는다고 가정 (관련도·중복 제거 등)
    let score = 0;
    for (let k = 0; k < 48; k++) {
      score += hay.charCodeAt(k % hay.length) ^ (q.charCodeAt(k % (q.length || 1)) | 0);
    }
    void score; // 계산만 하고 쓰지 않음 — 순수 부하용
    count += 1;
    if (sample.length < sampleCap) sample.push(line);
  }

  return { count, sample };
}

/* -------------------------------------------------------------------------- */
/* 공통 UI 래퍼 (섹션 제목)                                                      */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10 border-b border-neutral-200 pb-10 last:mb-0 last:border-b-0">
      <h2 className="mb-1 text-xl font-semibold text-neutral-900">{title}</h2>
      {description ? (
        <p className="mb-4 text-sm text-neutral-600">{description}</p>
      ) : null}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 1) useTransition                                                           */
/* -------------------------------------------------------------------------- */
/**
 * useTransition
 * - 반환값: [isPending, startTransition]
 * - startTransition(() => setState(...)) 안에서 일어나는 업데이트는
 *   "전환(transition)"으로 취급되어, 긴급한 입력(typing 등)보다 우선순위가 낮습니다.
 * - isPending: 그 전환이 아직 끝나지 않았으면 true (로딩 배지 등에 사용).
 *
 * 언제 쓰나?
 * - 탭 전환, 필터 변경처럼 "조금 늦어도 되는" UI 갱신을 입력 반응성과 분리할 때.
 */

function UseTransitionDemo() {
  /** 입력창에 보이는 값 — setState만 하므로 매 키 입력마다 즉시 화면에 반영됩니다. */
  const [inputValue, setInputValue] = useState("");
  /**
   * 아래 통계/미리보기는 이 상태에만 의존합니다.
   * 이걸 startTransition 안에서만 갱신하면, 타이핑은 부드럽고 목록 요약은 조금 늦게 따라옵니다.
   */
  const [filtered, setFiltered] = useState<CatalogFilterResult>(() => ({
    count: PRODUCT_CATALOG.length,
    sample: PRODUCT_CATALOG.slice(0, 10),
  }));
  const [isPending, startTransition] = useTransition();
  /** 끄면 같은 필터를 동기로 돌려서, 입력이 버벅이는 느낌을 직접 비교할 수 있습니다. */
  const [transitionOn, setTransitionOn] = useState(true);

  return (
    <div className="space-y-4 text-sm">
      <p className="text-neutral-600">
        위에 있는 <strong>{CATALOG_SIZE.toLocaleString()}개</strong> 가짜 상품명을 대상으로
        검색합니다. 필터 연산은 일부러 무겁게 만들었습니다.{" "}
        <code>startTransition</code>을 끄고 같은 글자를 빠르게 쳐 보면 차이가 납니다.
      </p>

      <label className="flex max-w-md cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          className="size-4"
          checked={transitionOn}
          onChange={(e) => setTransitionOn(e.target.checked)}
        />
        <span className="font-medium text-neutral-800">
          startTransition 사용 (켜 두면 입력이 끊기지 않아야 함)
        </span>
      </label>

      <label className="block max-w-md">
        <span className="mb-1 block font-medium text-neutral-700">
          검색어 — 이 setState는 전환 밖에서 호출 (항상 즉시)
        </span>
        <input
          className="w-full rounded border border-neutral-300 px-2 py-1"
          value={inputValue}
          onChange={(e) => {
            const v = e.target.value;
            setInputValue(v);
            const runFilter = () =>
              setFiltered(filterCatalogHeavy(PRODUCT_CATALOG, v));
            if (transitionOn) {
              startTransition(runFilter);
            } else {
              runFilter();
            }
          }}
          placeholder="예: 빨간, 위젯, ff0 (16진 시리얼 일부)"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 text-neutral-700">
        <span
          className={
            isPending && transitionOn
              ? "rounded-full bg-amber-100 px-2 py-0.5 text-amber-900"
              : "rounded-full bg-neutral-200 px-2 py-0.5"
          }
        >
          {transitionOn
            ? isPending
              ? "목록 요약 갱신 중… (isPending)"
              : "목록 요약 최신"
            : "동기 필터 — 입력과 같은 스레드에서 전부 처리"}
        </span>
        <span>
          <span className="font-medium">일치 개수:</span>{" "}
          {filtered.count.toLocaleString()}
        </span>
      </div>

      <div>
        <p className="mb-1 font-medium text-neutral-700">
          미리보기 (최대 10줄, 전환으로 갱신되는 쪽)
        </p>
        <ul className="max-h-40 overflow-y-auto rounded border border-neutral-200 bg-white p-2 font-mono text-xs text-neutral-800">
          {filtered.sample.length === 0 ? (
            <li className="text-neutral-500">일치 항목 없음</li>
          ) : (
            filtered.sample.map((line) => <li key={line}>{line}</li>)
          )}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2) useActionState + form action + useFormStatus                             */
/* -------------------------------------------------------------------------- */
/**
 * useActionState (React 19, 패키지 `react`)
 * - 서버 액션이 아니어도 **클라이언트**에서 async 함수를 액션으로 쓸 수 있습니다.
 * - 시그니처: const [state, formAction, isPending] = useActionState(fn, initialState)
 *   - fn(prevState, payload) → 다음 state (또는 Promise<state>)
 *   - <form action={formAction}> 로 연결하면 payload로 FormData가 넘어옵니다.
 *
 * useFormStatus (패키지 `react-dom`)
 * - **주의:** <form>의 자손 컴포넌트 안에서만 호출 가능합니다. (훅 규칙 + DOM 트리 규칙)
 * - pending, data, method, action 등 제출 상태를 읽습니다.
 * - 제출 버튼을 별도 컴포넌트로 빼서 그 안에서 useFormStatus를 쓰는 패턴이 흔합니다.
 */

type LoginFormState = {
  message: string;
  ok: boolean;
};

/** 폼이 action으로 넘기는 FormData를 받아 다음 상태를 계산하는 비동기 액션 */
async function loginFormAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const name = String(formData.get("name") ?? "").trim();
  // 네트워크 지연 흉내
  await new Promise((r) => setTimeout(r, 600));

  if (name.length < 2) {
    return { ok: false, message: "이름은 2글자 이상 입력하세요." };
  }
  return { ok: true, message: `환영합니다, ${name} 님!` };
}

/**
 * useFormStatus는 반드시 form **내부**에 두는 작은 컴포넌트로 분리합니다.
 * 이렇게 해야 "이 폼이 지금 제출 중인가?"를 버튼 레이블에 반영할 수 있습니다.
 */
function SubmitButtonWithFormStatus() {
  const status = useFormStatus();

  return (
    <button
      type="submit"
      disabled={status.pending}
      className="rounded bg-blue-600 px-3 py-1.5 text-white disabled:opacity-60"
    >
      {status.pending ? "제출 중 (useFormStatus)…" : "제출"}
    </button>
  );
}

function UseActionStateAndFormDemo() {
  const [state, formAction, actionPending] = useActionState(loginFormAction, {
    ok: false,
    message: "이름을 입력해 보세요.",
  });

  return (
    <div className="space-y-3 text-sm">
      {/*
        action={formAction}
        - React 19는 form의 action에 **함수**를 줄 수 있습니다.
        - 제출 시 React가 FormData를 만들어 formAction(디스패치)에 넘깁니다.
      */}
      <form action={formAction} className="flex max-w-md flex-col gap-2">
        <label className="block">
          <span className="mb-1 block font-medium">이름</span>
          <input
            name="name"
            className="w-full rounded border border-neutral-300 px-2 py-1"
            placeholder="홍길동"
          />
        </label>

        <SubmitButtonWithFormStatus />

        <p className="text-xs text-neutral-500">
          useActionState의 isPending:{" "}
          <strong>{actionPending ? "true" : "false"}</strong>
          <br />
          (폼 액션이 끝날 때까지 true. useFormStatus와 비슷하지만 **훅 위치 제약이
          다름**)
        </p>
      </form>

      <p
        className={
          state.ok ? "font-medium text-green-700" : "text-neutral-700"
        }
      >
        상태 메시지: {state.message}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3) useOptimistic                                                           */
/* -------------------------------------------------------------------------- */
/**
 * useOptimistic
 * - [optimisticState, addOptimistic] = useOptimistic(realState, reducer)
 * - realState가 바뀌면 optimistic 표시는 자동으로 realState에 맞춰 정리됩니다.
 * - 서버 요청이 끝나기 전에 리스트에 항목을 "잠정적으로" 보여 줄 때 유용합니다.
 *
 * 보통 패턴:
 * - startTransition 안에서 addOptimistic(...) 후 비동기 작업 → 완료 후 real state 갱신
 */

type Todo = { id: number; text: string; pending?: boolean };

function UseOptimisticDemo() {
  const [serverTodos, setServerTodos] = useState<Todo[]>([
    { id: 1, text: "학습: useTransition" },
  ]);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const [optimisticTodos, addOptimistic] = useOptimistic(
    serverTodos,
    (current: Todo[], nextText: string) => [
      ...current,
      { id: Date.now(), text: nextText, pending: true },
    ],
  );

  const addTodo = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    startTransition(async () => {
      // 1) UI에는 즉시(낙관적으로) 반영
      addOptimistic(trimmed);
      setText("");

      // 2) 가짜 서버 지연
      await new Promise((r) => setTimeout(r, 800));

      // 3) 진짜 상태 갱신 → useOptimistic의 임시 항목은 realState에 흡수됨
      setServerTodos((prev) => [...prev, { id: Date.now(), text: trimmed }]);
    });
  };

  return (
    <div className="space-y-3 text-sm">
      <form onSubmit={addTodo} className="flex max-w-lg flex-wrap items-end gap-2">
        <label className="min-w-48 flex-1">
          <span className="mb-1 block font-medium">할 일</span>
          <input
            className="w-full rounded border border-neutral-300 px-2 py-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-emerald-600 px-3 py-1.5 text-white disabled:opacity-50"
        >
          {isPending ? "추가 중…" : "추가 (낙관적)"}
        </button>
      </form>

      <ul className="list-inside list-disc space-y-1 text-neutral-800">
        {optimisticTodos.map((t) => (
          <li key={t.id}>
            {t.text}
            {t.pending ? (
              <span className="ml-2 text-xs text-amber-600">(전송 중…)</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4) use + Suspense (+ 성공)                                                 */
/* -------------------------------------------------------------------------- */
/**
 * use(usable)
 * - Promise가 이행(fulfill)될 때까지 컴포넌트를 "일시 정지"시키고,
 *   가장 가까운 <Suspense fallback>을 보여 줍니다.
 * - 같은 Promise를 매 렌더마다 새로 만들면 안 됩니다 (무한 suspend).
 *   → useMemo / 모듈 스코프 캐시 / 상태로 Promise를 고정하는 패턴을 씁니다.
 *
 * 아래는 "버튼으로 key를 바꿔 새 Promise를 요청"하는 가장 단순한 패턴입니다.
 */

function createMessagePromise(ms: number, label: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${label} — ${ms}ms 후 도착`), ms);
  });
}

function MessageFromPromise({ promise }: { promise: Promise<string> }) {
  // 이 줄에서 아직 pending이면 상위 Suspense가 fallback을 렌더합니다.
  const message = use(promise);
  return <p className="text-neutral-800">{message}</p>;
}

function UseWithSuspenseDemo() {
  const [bundle, setBundle] = useState(() => ({
    key: 0,
    promise: createMessagePromise(900, "첫 요청"),
  }));

  const retry = useCallback(() => {
    setBundle((b) => ({
      key: b.key + 1,
      promise: createMessagePromise(900, `재요청 #${b.key + 1}`),
    }));
  }, []);

  return (
    <div className="space-y-3 text-sm">
      <button
        type="button"
        onClick={retry}
        className="rounded border border-neutral-400 px-3 py-1.5 hover:bg-white"
      >
        새 Promise로 다시 불러오기 (key +1)
      </button>

      {/*
        Suspense 경계: 자식 트리에서 use(promise)가 suspend되면 이 fallback이 보임
      */}
      <Suspense
        fallback={
          <p className="animate-pulse text-amber-700">데이터 로딩 중 (Suspense)…</p>
        }
      >
        {/* key가 바뀌면 완전히 새 트리로 마운트되어 새 promise를 읽습니다 */}
        <MessageFromPromise key={bundle.key} promise={bundle.promise} />
      </Suspense>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5) use + Promise reject → Error Boundary                                   */
/* -------------------------------------------------------------------------- */
/**
 * use()는 Promise가 reject되면 **렌더 단계에서 예외를 던집니다.**
 * - 이때 함수형 컴포넌트만으로는 잡을 수 없고,
 *   클래스형 Error Boundary (또는 라이브러리)가 필요합니다.
 *
 * 주의: Error Boundary는 모든 종류의 에러를 잡는 것은 아닙니다
 * (이벤트 핸들러 내부 오류 등은 별도 처리). 공식 문서의 "Error Boundary" 절을 참고하세요.
 */

class HookDemoErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 학습용: 실제 서비스에서는 로깅 서비스로 전송하는 경우가 많습니다.
    console.error("[HookDemoErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-900">
          <p className="font-medium">Error Boundary가 잡은 오류</p>
          <p className="text-sm">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function createFailingPromise(message: string): Promise<string> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), 500);
  });
}

function MessageThatMayFail({ promise }: { promise: Promise<string> }) {
  const value = use(promise);
  return <p>{value}</p>;
}

function UseWithErrorBoundaryDemo() {
  const [bundle, setBundle] = useState(() => ({
    key: 0,
    promise: createFailingPromise("의도적인 fetch 실패"),
  }));

  return (
    <div className="space-y-3 text-sm">
      <button
        type="button"
        className="rounded border border-neutral-400 px-3 py-1.5 hover:bg-white"
        onClick={() =>
          setBundle((b) => ({
            key: b.key + 1,
            promise: createFailingPromise(`실패 #${b.key + 1}`),
          }))
        }
      >
        다시 시도 (새로운 실패 Promise)
      </button>

      {/*
        Error Boundary는 한 번 에러를 잡으면 state.hasError가 true로 고정됩니다.
        같은 경계 안에서만 자식 key를 바꿔도 복구되지 않으므로, 경계 자체에 key를 줘
        "새 시도 = 새 경계"로 리마운트합니다.
      */}
      <HookDemoErrorBoundary key={bundle.key}>
        <Suspense fallback={<p className="text-amber-700">곧 에러가 납니다…</p>}>
          <MessageThatMayFail promise={bundle.promise} />
        </Suspense>
      </HookDemoErrorBoundary>

      <p className="text-xs text-neutral-500">
        순서: Suspense 안에서 먼저 대기 → reject 시 Error Boundary가 표시.
        (실패하는 promise도 처음에는 pending이므로 fallback이 잠깐 보일 수 있습니다.)
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 페이지: 모든 섹션 나열                                                      */
/* -------------------------------------------------------------------------- */

const ReactNewHookExample = () => {
  return (
    <main className="mx-auto max-w-3xl p-6 text-neutral-900">
      <h1 className="mb-2 text-2xl font-bold">React 19 훅 · 폼 · Suspense 학습 예제</h1>
      <p className="mb-8 text-sm text-neutral-600">
        각 블록은 독립적으로 동작합니다. 주석은 &quot;왜 이렇게 쓰는지&quot;를
        읽을 수 있도록 길게 달았습니다.
      </p>

      <Section
        title="1. useTransition"
        description="1.5만 행 카탈로그를 무겁게 필터링할 때, 목록 요약만 transition으로 갱신해 타이핑 체감을 비교합니다."
      >
        <UseTransitionDemo />
      </Section>

      <Section
        title="2. useActionState + form action"
        description="<form action={formAction}> 과 비동기 액션으로 서버 스타일 폼 흐름을 클라이언트에서 재현합니다."
      >
        <UseActionStateAndFormDemo />
      </Section>

      <Section
        title="3. useFormStatus"
        description="제출 버튼을 form 자손 컴포넌트로 분리해 pending UI를 만듭니다. (위 섹션의 SubmitButton 참고)"
      >
        <p className="text-sm text-neutral-600">
          실제 코드는 <strong>섹션 2</strong>의 <code>SubmitButtonWithFormStatus</code>
          안에 있습니다. useFormStatus는 <strong>form 바깥</strong>에서 호출하면
          작동하지 않습니다.
        </p>
      </Section>

      <Section
        title="4. useOptimistic"
        description="서버 완료 전에 목록에 항목을 임시로 올렸다가, 확정 상태와 합쳐집니다."
      >
        <UseOptimisticDemo />
      </Section>

      <Section
        title="5. use + Suspense (성공)"
        description="Promise가 풀릴 때까지 가까운 Suspense fallback을 보여 줍니다."
      >
        <UseWithSuspenseDemo />
      </Section>

      <Section
        title="6. use + Suspense + Error Boundary (실패)"
        description="reject된 Promise는 use에서 예외로 전파되므로 Error Boundary로 표시합니다."
      >
        <UseWithErrorBoundaryDemo />
      </Section>
    </main>
  );
};

export default ReactNewHookExample;
