/**
 * UseOptimisticExample와 동일한 기능/UI — TanStack Query로 구현
 * - useInfiniteQuery: 페이지네이션 + 무한 스크롤
 * - useMutation + onMutate/onError: 추가·수정·삭제·좋아요 낙관적 업데이트
 *
 * json-server: http://localhost:3000/posts
 * 딜레이: `npm run delayserver`
 */
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
    type InfiniteData,
} from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useRef, useState, type UIEvent } from "react";

const BASE = "http://localhost:3000";
const PAGE_SIZE = 10;
const POSTS_INFINITE_KEY = ["posts", "infinite"] as const;

type Post = {
    id: number;
    title: string;
    views: number;
    likes: number;
};

type PostsPage = {
    data: Post[];
    total: number;
};

const client = axios.create({ baseURL: BASE });

function normalizePost(p: Post): Post {
    return {
        ...p,
        likes: typeof p.likes === "number" ? p.likes : 0,
    };
}

function normalizePosts(raw: Post[]): Post[] {
    return raw.map(normalizePost);
}

async function fetchPostsPage(page: number): Promise<PostsPage> {
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

function flattenPosts(data: InfiniteData<PostsPage> | undefined): Post[] {
    if (!data?.pages.length) return [];
    return data.pages.flatMap((p) => p.data);
}

export default function TanstackQueryExample() {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState("");
    const [err, setErr] = useState("");
    const loadingMoreRef = useRef(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending: listBooting,
        isError: listError,
    } = useInfiniteQuery({
        queryKey: POSTS_INFINITE_KEY,
        queryFn: ({ pageParam }) => fetchPostsPage(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((n, p) => n + p.data.length, 0);
            const total = lastPage.total;
            const hasMore =
                total > 0 ? loaded < total : lastPage.data.length === PAGE_SIZE;
            return hasMore ? allPages.length + 1 : undefined;
        },
        staleTime: 60_000,
    });

    const posts = flattenPosts(data);

    const addMutation = useMutation({
        mutationFn: (title: string) =>
            client
                .post<Post>("/posts", { title, views: 0, likes: 0 })
                .then((r) => normalizePost(r.data)),
        onMutate: async (title) => {
            setErr("");
            await queryClient.cancelQueries({ queryKey: POSTS_INFINITE_KEY });
            const previous = queryClient.getQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
            );
            const tempId = -Date.now();
            const optimisticRow: Post = {
                id: tempId,
                title,
                views: 0,
                likes: 0,
            };
            queryClient.setQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
                (old) => {
                    if (!old?.pages.length) return old;
                    const [first, ...rest] = old.pages;
                    return {
                        ...old,
                        pages: [
                            { ...first, data: [optimisticRow, ...first.data] },
                            ...rest,
                        ],
                    };
                },
            );
            return { previous, tempId };
        },
        onError: (_e, _title, ctx) => {
            if (ctx?.previous !== undefined) {
                queryClient.setQueryData(POSTS_INFINITE_KEY, ctx.previous);
            }
            setErr("추가 실패");
        },
        onSuccess: (saved, _title, ctx) => {
            queryClient.setQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
                (old) => {
                    if (!old?.pages.length || !ctx) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page, i) =>
                            i === 0
                                ? {
                                    ...page,
                                    data: page.data.map((p) =>
                                        p.id === ctx.tempId ? saved : p,
                                    ),
                                }
                                : page,
                        ),
                    };
                },
            );
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, title }: { id: number; title: string }) =>
            client
                .patch<Post>(`/posts/${id}`, { title })
                .then((r) => normalizePost(r.data)),
        onMutate: async ({ id, title }) => {
            setErr("");
            await queryClient.cancelQueries({ queryKey: POSTS_INFINITE_KEY });
            const previous = queryClient.getQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
            );
            queryClient.setQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((p) =>
                                p.id === id ? { ...p, title } : p,
                            ),
                        })),
                    };
                },
            );
            return { previous };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.previous !== undefined) {
                queryClient.setQueryData(POSTS_INFINITE_KEY, ctx.previous);
            }
            setErr("수정 실패");
        },
        onSuccess: (saved) => {
            queryClient.setQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((p) => (p.id === saved.id ? saved : p)),
                        })),
                    };
                },
            );
            setEditingId(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => client.delete(`/posts/${id}`),
        onMutate: async (id) => {
            setErr("");
            if (editingId === id) {
                setEditingId(null);
                setDraft("");
            }
            await queryClient.cancelQueries({ queryKey: POSTS_INFINITE_KEY });
            const previous = queryClient.getQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
            );
            queryClient.setQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.filter((p) => p.id !== id),
                        })),
                    };
                },
            );
            return { previous };
        },
        onError: (_e, _id, ctx) => {
            if (ctx?.previous !== undefined) {
                queryClient.setQueryData(POSTS_INFINITE_KEY, ctx.previous);
            }
            setErr("삭제 실패");
        },
    });

    const likeMutation = useMutation({
        mutationFn: ({ id, likes }: { id: number; likes: number }) =>
            client
                .patch<Post>(`/posts/${id}`, { likes })
                .then((r) => normalizePost(r.data)),
        onMutate: async ({ id, likes }) => {
            setErr("");
            await queryClient.cancelQueries({ queryKey: POSTS_INFINITE_KEY });
            const previous = queryClient.getQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
            );
            queryClient.setQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((p) =>
                                p.id === id ? { ...p, likes } : p,
                            ),
                        })),
                    };
                },
            );
            return { previous, optimisticLikes: likes };
        },
        onError: (_e, _v, ctx) => {
            if (ctx?.previous !== undefined) {
                queryClient.setQueryData(POSTS_INFINITE_KEY, ctx.previous);
            }
            setErr("좋아요 실패");
        },
        onSuccess: (fromServer, variables, ctx) => {
            const likes =
                typeof fromServer.likes === "number"
                    ? fromServer.likes
                    : ctx?.optimisticLikes ?? variables.likes;
            const merged: Post = { ...fromServer, likes };
            queryClient.setQueryData<InfiniteData<PostsPage>>(
                POSTS_INFINITE_KEY,
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((p) =>
                                p.id === merged.id ? { ...p, ...merged } : p,
                            ),
                        })),
                    };
                },
            );
        },
    });

    const loadNextPage = useCallback(async () => {
        if (!hasNextPage || loadingMoreRef.current || isFetchingNextPage) return;
        loadingMoreRef.current = true;
        setErr("");
        try {
            await fetchNextPage();
        } catch {
            setErr("더 불러오기 실패");
        } finally {
            loadingMoreRef.current = false;
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    function handleListScroll(e: UIEvent<HTMLDivElement>) {
        const el = e.currentTarget;
        if (listBooting || !hasNextPage || loadingMoreRef.current) return;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (nearBottom) void loadNextPage();
    }

    async function addAction(formData: FormData) {
        const title = String(
            formData.get("title") ?? "",
        ).trim();
        if (!title) return;
        try {
            await addMutation.mutateAsync(title);

        } catch {
            /* onError sets err */
        }
    }

    function startEdit(p: Post) {
        if (p.id < 0) return;
        setEditingId(p.id);
        setDraft(p.title);
    }

    function saveEdit(id: number) {
        const title = draft.trim();
        if (!title) return;
        updateMutation.mutate({ id, title });
    }

    function removePost(id: number) {
        if (id < 0) return;
        deleteMutation.mutate(id);
    }

    function likePost(id: number) {
        if (id < 0) return;
        const row = posts.find((p) => p.id === id);
        if (!row) return;
        likeMutation.mutate({ id, likes: row.likes + 1 });
    }

    const listErrMsg = listError ? "목록을 불러오지 못했습니다." : err;

    return (
        <div className="min-h-screen bg-slate-100 p-6">
            <div className="mx-auto max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow">
                <h1 className="text-lg font-semibold text-slate-800">
                    Posts (TanStack Query)
                </h1>

                <form action={addAction} className="flex gap-2">
                    <input
                        name="title"
                        placeholder="제목"
                        className="flex-1 rounded border px-3 py-2"
                    />
                    <button
                        type="submit"
                        disabled={addMutation.isPending}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                        {addMutation.isPending ? "보내는 중…" : "추가"}
                    </button>
                </form>

                {listErrMsg ? (
                    <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
                        {listErrMsg}
                    </p>
                ) : null}

                <p className="text-xs text-slate-500">
                    처음 {PAGE_SIZE}개만 불러온 뒤, 아래 목록을 끝까지 스크롤하면 다음{" "}
                    {PAGE_SIZE}개를 이어서 가져옵니다. (json-server{" "}
                    <code className="rounded bg-slate-100 px-1">_page</code>,{" "}
                    <code className="rounded bg-slate-100 px-1">_limit</code>)
                </p>

                <div
                    onScroll={handleListScroll}
                    className="max-h-[min(600px,55vh)] space-y-2 overflow-y-auto rounded-lg border border-slate-100 p-1"
                >
                    {listBooting ? (
                        <p className="py-8 text-center text-sm text-slate-400">
                            목록 불러오는 중…
                        </p>
                    ) : null}

                    {!listBooting && posts.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">
                            데이터 없음
                        </p>
                    ) : null}

                    <ul className="space-y-2">
                        {posts.map((p) => {
                            const editing = editingId === p.id;
                            return (
                                <li
                                    key={p.id}
                                    className={`rounded-lg border p-3 ${p.id < 0
                                        ? "border-blue-200 bg-blue-50/60"
                                        : "border-slate-200"
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
                                            onClick={() => likePost(p.id)}
                                        >
                                            ♥ {p.likes}
                                        </button>
                                        <div className="flex gap-2">
                                            {editing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="rounded bg-emerald-600 px-2 py-1 text-sm text-white"
                                                        disabled={updateMutation.isPending}
                                                        onClick={() => saveEdit(p.id)}
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
                                                        disabled={p.id < 0 || deleteMutation.isPending}
                                                        onClick={() => removePost(p.id)}
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

                    {isFetchingNextPage ? (
                        <p className="py-3 text-center text-xs text-slate-400">
                            다음 페이지 불러오는 중…
                        </p>
                    ) : null}
                    {!listBooting && !hasNextPage && posts.length > 0 ? (
                        <p className="py-2 text-center text-xs text-slate-400">
                            모두 불러왔습니다
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
