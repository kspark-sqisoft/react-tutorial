/**
 * React 19 공식 문서 패턴 기반 예시
 * - useOptimistic: https://react.dev/reference/react/useOptimistic
 * - useFormStatus: https://react.dev/reference/react-dom/hooks/useFormStatus
 *
 * 흐름: “확정 상태(realPosts)”를 useOptimistic에 넘기고,
 * Action 안에서 setOptimistic → await API → startTransition(() => setRealPosts(...)) 로 맞춤.
 *
 * 좋아요: ① 해당 줄만 먼저 올림(낙관적) ② 성공 시 PATCH 응답 본문으로 확정(서버 숫자가 다르면 그걸로 교정)
 *         ③ 실패 시 realPosts는 그대로 → 전환 끝나면 화면은 확정값으로 롤백
 * json-server: http://localhost:3000/posts
 * 페이지네이션: GET …?_page=1&_limit=10&_sort=id&_order=desc (json-server 기본 기능)
 * 딜레이: `npm run delayserver`
 */
import {
  startTransition,
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  type UIEvent,
} from "react";
import axios from "axios";
import { useFormStatus } from "react-dom";

const BASE = "http://localhost:3000";
const PAGE_SIZE = 10;

type Post = {
  id: number;
  title: string;
  views: number;
  likes: number;
};

const client = axios.create({ baseURL: BASE });

/** API에서 likes가 빠지거나 문자열일 때도 UI에서 숫자로 쓰기 위해 통일 */
function normalizePosts(raw: Post[]): Post[] {
  return raw.map((p) => ({
    ...p,
    likes: typeof p.likes === "number" ? p.likes : 0,
  }));
}

/** json-server 페이지네이션: 헤더 x-total-count로 전체 개수(무한 스크롤 여부 판단) */
async function fetchPostsPage(page: number) {
  const res = await client.get<Post[]>("/posts", {
    params: {
      _sort: "id",
      _order: "desc",
      _page: page,
      _limit: PAGE_SIZE,
    },
  });
  const totalHeader =
    res.headers["x-total-count"] ?? res.headers["X-Total-Count"];
  const total = totalHeader ? Number(totalHeader) : 0;
  return {
    data: normalizePosts(res.data),
    total,
  };
}

/* 문서: useFormStatus는 <form>의 자식 컴포넌트에서만 사용 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? "보내는 중…" : "추가"}
    </button>
  );
}

export default function UseOptimisticExample() {
  /** 서버와 일치시키는 확정 목록 — Action이 끝나면 이 값이 화면의 기준이 됨 */
  /**
   * 확정 상태(source of truth). 서버 응답을 반영한 뒤 여기만 바꾼다.
   * Action이 끝나면 useOptimistic은 이 값을 기준으로 다시 그린다(실패 시 롤백도 이 덕분).
   */
  const [realPosts, setRealPosts] = useState<Post[]>([]);

  /**
   * 화면에 쓰는 목록 = realPosts + (진행 중인 전환 동안만) 낙관적 덧씌움.
   * setOptimisticPosts는 realPosts를 직접 바꾸지 않고, “잠깐 보여 줄 스냅샷”만 쌓는다.
   */
  const [posts, setOptimisticPosts] = useOptimistic(realPosts);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listBooting, setListBooting] = useState(true);

  const pageRef = useRef(0);
  const totalRef = useRef<number | null>(null);
  const loadingMoreRef = useRef(false);
  const listScrollRef = useRef<HTMLDivElement>(null);

  // 마운트 시 1페이지 로드 → 성공 시 realPosts에만 반영(낙관적 레이어 없음)
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data, total } = await fetchPostsPage(1);
        if (cancel) return;
        if (total > 0) totalRef.current = total;
        setRealPosts(data);
        pageRef.current = 1;
        setHasMore(
          total > 0 ? data.length < total : data.length === PAGE_SIZE,
        );
      } catch {
        if (!cancel) setErr("목록을 불러오지 못했습니다.");
      } finally {
        if (!cancel) setListBooting(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  /** 스크롤 끝 근처에서 다음 페이지를 realPosts 끝에 이어 붙임 */
  const loadNextPage = useCallback(async () => {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setErr("");
    try {
      const next = pageRef.current + 1;
      const { data, total } = await fetchPostsPage(next);
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      if (total > 0) totalRef.current = total;
      pageRef.current = next;
      setRealPosts((prev) => {
        const merged = [...prev, ...data];
        const t = totalRef.current;
        setHasMore(
          t != null && t > 0 ? merged.length < t : data.length === PAGE_SIZE,
        );
        return merged;
      });
    } catch {
      setErr("더 불러오기 실패");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore]);

  /** 바닥 근처(80px)면 loadNextPage 한 번 호출 — 중복은 loadingMoreRef로 막음 */
  function handleListScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (listBooting || !hasMore || loadingMoreRef.current) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) void loadNextPage();
  }

  /**
   * 폼 제출 = React가 Action으로 감싸서 실행 → useFormStatus의 pending과 맞물림.
   * 순서: ① 임시 id로 목록 맨 위에 즉시 표시 → ② POST 성공 시 서버 id로 realPosts 교체
   */
  async function addAction(formData: FormData) {
    setErr("");
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;

    // 서버 id 전까지 음수 임시 id로 행을 구분(수정/삭제/좋아요 비활성 등)
    const tempId = -Date.now();
    const optimisticRow: Post = {
      id: tempId,
      title,
      views: 0,
      likes: 0,
    };

    // 아직 realPosts는 그대로 — 화면에는 새 글이 바로 보임
    setOptimisticPosts((current) => [optimisticRow, ...current]);

    try {
      const { data } = await client.post<Post>("/posts", {
        title,
        views: 0,
        likes: 0,
      });
      const saved: Post = {
        ...data,
        likes: typeof data.likes === "number" ? data.likes : 0,
      };
      // 확정: 임시 행 제거하고 서버가 준 행으로 교체 → 낙관적 레이어 자동 정리
      startTransition(() => {
        setRealPosts((prev) => [
          saved,
          ...prev.filter((p) => p.id !== tempId),
        ]);
      });
    } catch {
      setErr("추가 실패");
      // realPosts는 변하지 않았으므로 새 배열로만 트리거해도 목록에서 임시 행이 사라짐(롤백)
      startTransition(() => setRealPosts((p) => [...p]));
    }
  }

  function startEdit(p: Post) {
    if (p.id < 0) return;
    setEditingId(p.id);
    setDraft(p.title);
  }

  /** 제목 수정: 전환 안에서 낙관적 반영 → PATCH 후 realPosts로 확정, 실패 시 롤백 */
  async function saveEdit(id: number) {
    const title = draft.trim();
    if (!title) return;
    setErr("");
    startTransition(async () => {
      setOptimisticPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, title } : p)),
      );
      try {
        const { data } = await client.patch<Post>(`/posts/${id}`, { title });
        const saved: Post = {
          ...data,
          likes: typeof data.likes === "number" ? data.likes : 0,
        };
        startTransition(() => {
          setRealPosts((prev) => prev.map((p) => (p.id === id ? saved : p)));
        });
        setEditingId(null);
      } catch {
        setErr("수정 실패");
        startTransition(() => setRealPosts((p) => [...p]));
      }
    });
  }

  /** 삭제: 목록에서 먼저 빼 보이기 → DELETE 성공 시 realPosts에서도 제거 */
  async function removePost(id: number) {
    if (id < 0) return;
    setErr("");
    if (editingId === id) {
      setEditingId(null);
      setDraft("");
    }
    startTransition(async () => {
      setOptimisticPosts((prev) => prev.filter((p) => p.id !== id));
      try {
        await client.delete(`/posts/${id}`);
        startTransition(() => {
          setRealPosts((prev) => prev.filter((p) => p.id !== id));
        });
      } catch {
        setErr("삭제 실패");
        startTransition(() => setRealPosts((p) => [...p]));
      }
    });
  }

  /**
   * 좋아요 낙관적 업데이트 대표 패턴.
   * posts에서 현재 행을 읽어 +1을 계산한 뒤, 같은 전환 안에서 PATCH까지 이어 간다.
   */
  async function likePost(id: number) {
    if (id < 0) return;
    setErr("");
    const row = posts.find((p) => p.id === id);
    if (!row) return;
    const optimisticNext = row.likes + 1;

    startTransition(async () => {
      // ① 화면에만 먼저 반영 (확정 realPosts는 아직 이전 값)
      setOptimisticPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: optimisticNext } : p)),
      );
      try {
        const { data } = await client.patch<Post>(`/posts/${id}`, {
          likes: optimisticNext,
        });
        // ② 서버가 준 값으로 확정 — 클라 예상과 다르면 여기서 숫자가 맞춰짐
        const fromServer: Post = {
          ...data,
          likes: typeof data.likes === "number" ? data.likes : optimisticNext,
        };
        startTransition(() => {
          setRealPosts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...fromServer } : p)),
          );
        });
      } catch {
        setErr("좋아요 실패");
        // ③ realPosts는 증가시키지 않았음 → Action 종료 후 useOptimistic은 확정 목록만 보여 줌(롤백)
        startTransition(() => setRealPosts((p) => [...p]));
      }
    });
  }

  /* ---------- UI: 렌더는 항상 `posts`(낙관적이 적용된 목록) 기준 ---------- */

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-lg font-semibold text-slate-800">
          Posts (useOptimistic + useFormStatus)
        </h1>

        <form action={addAction} className="flex gap-2">
          <input
            name="title"
            placeholder="제목"
            className="flex-1 rounded border px-3 py-2"
          />
          <SubmitButton />
        </form>

        {err ? (
          <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
        ) : null}

        <p className="text-xs text-slate-500">
          처음 {PAGE_SIZE}개만 불러온 뒤, 아래 목록을 끝까지 스크롤하면 다음{" "}
          {PAGE_SIZE}개를 이어서 가져옵니다. (json-server{" "}
          <code className="rounded bg-slate-100 px-1">_page</code>,{" "}
          <code className="rounded bg-slate-100 px-1">_limit</code>)
        </p>

        <div
          ref={listScrollRef}
          onScroll={handleListScroll}
          className="max-h-[min(600px,55vh)] space-y-2 overflow-y-auto rounded-lg border border-slate-100 p-1"
        >
          {listBooting ? (
            <p className="py-8 text-center text-sm text-slate-400">
              목록 불러오는 중…
            </p>
          ) : null}

          {!listBooting && posts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">데이터 없음</p>
          ) : null}

          <ul className="space-y-2">
            {posts.map((p) => {
              const editing = editingId === p.id;
              // p.id < 0: 추가 직후 서버 id 없음 → 파란 테두리로 낙관적 행 표시
              return (
                <li
                  key={p.id}
                  className={`rounded-lg border p-3 ${p.id < 0 ? "border-blue-200 bg-blue-50/60" : "border-slate-200"
                    }`}
                >
                  <div className="flex justify-between gap-2">
                    {editing ? (
                      <input
                        className="w-full rounded border px-2 py-1 text-sm"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{p.title}</span>
                    )}
                    <span className="shrink-0 text-xs text-slate-500">
                      조회 {p.views}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2">
                    <button
                      type="button"
                      className="text-sm text-rose-600"
                      disabled={p.id < 0 || editing}
                      onClick={() => void likePost(p.id)}
                    >
                      ♥ {p.likes}
                    </button>
                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <button
                            type="button"
                            className="rounded bg-emerald-600 px-2 py-1 text-sm text-white"
                            onClick={() => void saveEdit(p.id)}
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            className="rounded border px-2 py-1 text-sm"
                            onClick={() => setEditingId(null)}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="rounded bg-amber-400 px-2 py-1 text-sm"
                            disabled={p.id < 0}
                            onClick={() => startEdit(p)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className="rounded bg-red-500 px-2 py-1 text-sm text-white"
                            disabled={p.id < 0}
                            onClick={() => void removePost(p.id)}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {loadingMore ? (
            <p className="py-3 text-center text-xs text-slate-400">
              다음 페이지 불러오는 중…
            </p>
          ) : null}
          {!listBooting && !hasMore && posts.length > 0 ? (
            <p className="py-2 text-center text-xs text-slate-400">모두 불러왔습니다</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
