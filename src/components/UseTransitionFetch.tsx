import { useState, useTransition } from "react";

interface Post {
    id: number;
    title: string;
    views: number;
}

const POSTS_URL = "http://localhost:3000/posts?_page=1&_limit=10";

/**
 * useTransition + fetch
 *
 * - startTransition은 "이번 틱에서 동기적으로 일어나는 setState"를 낮은 우선순위로 표시합니다.
 * - 콜백을 async로 만들거나 그 안에서 await fetch를 쓰면, await 이후의 setState는
 *   콜백이 끝난 뒤(마이크로태스크)에 실행되어 transition으로 묶이지 않습니다.
 *   (React는 Promise를 기다리지 않습니다.)
 * - 그래서 패턴은: await fetch로 데이터를 받은 뒤, 그 결과로 목록을 그리는 setState만
 *   startTransition(() => setPosts(data))로 감쌉니다. 네트워크 자체는 transition 대상이 아닙니다.
 */
const UseTransitionFetch = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [draft, setDraft] = useState("");

    const loadPosts = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await fetch(POSTS_URL, {
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("네트워크 통신 에러");
            const data: Post[] = await res.json();
            // 목록 반영은 transition → isPending 으로 "화면에 반영 중" 표시 가능
            startTransition(() => {
                setPosts(data);
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 p-6">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        useTransition + fetch
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        아래 입력은 항상 즉시 반영되고, 불러오기 후 목록 갱신은 transition
                        처리됩니다. 비교용 입력 — 패칭/갱신 중에도 타이핑이 끊기지 않는지 체감하기 쉽게 함.
                    </p>
                </div>

                <label className="block text-sm text-gray-600">
                    즉시 반영 입력 (비교용)
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800"
                        placeholder="타이핑해 보세요"
                    />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={loadPosts}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "요청 중…" : "posts 불러오기"}
                    </button>
                    {isPending && (
                        <span className="text-sm text-amber-700">
                            목록 화면에 반영 중…
                        </span>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div
                    className={`relative rounded-xl border border-gray-100 min-h-[120px] ${isPending ? "opacity-70" : ""}`}
                >
                    {loading && posts.length === 0 ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {posts.map((post) => (
                                <li
                                    key={post.id}
                                    className="px-4 py-3 flex justify-between gap-2 text-sm"
                                >
                                    <span className="font-medium text-gray-800">{post.title}</span>
                                    <span className="text-gray-400 shrink-0">👁 {post.views}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!loading && posts.length === 0 && !error && (
                        <p className="text-center text-gray-400 text-sm py-8">
                            버튼을 눌러 데이터를 불러오세요.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UseTransitionFetch;
