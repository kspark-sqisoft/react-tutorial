import { useEffect, useOptimistic, useState, useTransition } from "react";

/**
 * json-server: `npm run delayserver` → http://localhost:3000
 * GET/PATCH /posts — likes만 낙관적으로 +1 후 서버 반영
 */
const API = "http://localhost:3000/posts";

type Post = { id: number; title: string; likes: number };

/** `addOptimistic({ id, likes })`에 넘긴 객체가 그대로 두 번째 매개변수로 들어온다. */
type PendingLike = { id: number; likes: number };

/**
 * “지금 화면에 잠깐 보여 줄 목록”을 만든다.
 * id가 같은 글만 likes를 바꾸고, 나머지 글은 그대로 둔다.
 */
function applyPendingLike(currentList: Post[], pending: PendingLike): Post[] {
  return currentList.map((post) =>
    post.id === pending.id ? { ...post, likes: pending.likes } : post,
  );
}

export default function UseOptimisticBasicExample() {
  // 서버와 맞춘 “진짜” 목록. 성공한 요청 후에만 여기를 고친다.
  const [posts, setPosts] = useState<Post[]>([]);

  // 이 안의 비동기 작업이 끝날 때까지 isPending === true (UI에 “동기화 중” 등)
  const [isPending, startTransition] = useTransition();

  /*
   * useOptimistic(베이스상태, 갱신함수)
   * - optimisticPosts: 베이스(posts) + 진행 중인 낙관적 수정이 합쳐진 결과 (UI는 이걸 쓴다)
   * - addOptimistic(payload): “지금 이 수정을 잠깐 반영해 줘”라고 갱신함수에 payload를 넘김
   *   → 갱신함수는 (현재까지의 베이스+낙관 목록, payload)를 받아 새 목록을 return
   */
  const [optimisticPosts, addOptimistic] = useOptimistic(posts, applyPendingLike);

  useEffect(() => {
    fetch(`${API}?_limit=5&_sort=id&_order=desc`)
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  function like(id: number, likes: number) {
    const next = likes + 1;
    // 낙관적 업데이트는 반드시 transition 안에서 처리 (React가 롤백 타이밍을 알 수 있음)
    startTransition(async () => {
      // await 전에 호출 → 네트워크 기다리는 동안 UI는 이미 next로 보임
      addOptimistic({ id, likes: next });

      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: Post = await res.json();
      // 성공: 베이스 상태를 서버 응답으로 맞춤 → 낙관적 레이어는 사라지고 같은 값이 유지됨
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      // 실패(throw): transition 종료 시 낙관적 덮어쓰기만 제거 → posts(이전 값)로 복귀
    });
  }

  return (
    <div className="mx-auto max-w-md space-y-3 p-4 font-sans">
      <h1 className="text-lg font-semibold">useOptimistic 기본 (json-server)</h1>
      <p className="text-muted-foreground text-sm">
        서버 지연 중에도 숫자가 바로 올라갑니다. 실패 시 자동으로 이전 값으로 돌아갑니다.
        {isPending ? " (동기화 중…)" : ""}
      </p>
      <ul className="space-y-2">
        {/* posts가 아니라 optimisticPosts: 클릭 직후 숫자가 바로 반영됨 */}
        {optimisticPosts.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
          >
            <span className="truncate text-sm">{p.title}</span>
            <button
              type="button"
              className="shrink-0 rounded bg-neutral-800 px-2 py-1 text-xs text-white hover:bg-neutral-700"
              onClick={() => like(p.id, p.likes)}
            >
              ♥ {p.likes}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
