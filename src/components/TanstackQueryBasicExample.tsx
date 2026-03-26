/**
 * TanStack Query 기초 학습용 페이지
 * 참고: https://tanstack.com/query/latest/docs/framework/react/overview
 *
 * 앱 루트의 QueryClientProvider는 main.tsx 에서 설정됩니다.
 * 로컬 변이·무한 스크롤 예제는 `npm run server` (json-server, 기본 http://localhost:3000) 가 필요합니다.
 */
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
    type InfiniteData,
} from "@tanstack/react-query";
import {
    useCallback,
    useRef,
    useState,
    type ReactNode,
    type UIEvent,
} from "react";

const JSON_SERVER = "http://localhost:3000";

type GitHubRepo = {
    name: string;
    description: string | null;
    subscribers_count: number;
    stargazers_count: number;
    forks_count: number;
};

type JsonPlaceholderUser = {
    id: number;
    name: string;
    email: string;
};

type LocalPost = {
    id: number;
    title: string;
    views: number;
    likes: number;
};

/** TanstackQueryExample 의 무한 쿼리와 캐시가 겹치지 않도록 별도 키 사용 */
const BASIC_INFINITE_PAGE_SIZE = 5;
const BASIC_POSTS_INFINITE_KEY = ["posts", "basic-infinite"] as const;

type PostsInfinitePage = {
    data: LocalPost[];
    total: number;
};

async function fetchPostsPageBasic(page: number): Promise<PostsInfinitePage> {
    const params = new URLSearchParams({
        _sort: "id",
        _order: "desc",
        _page: String(page),
        _limit: String(BASIC_INFINITE_PAGE_SIZE),
    });
    const res = await fetch(`${JSON_SERVER}/posts?${params}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const raw = (await res.json()) as LocalPost[];
    const totalHeader =
        res.headers.get("X-Total-Count") ?? res.headers.get("x-total-count");
    const total = totalHeader ? Number(totalHeader) : 0;
    return {
        data: raw.map((p) => ({
            ...p,
            likes: typeof p.likes === "number" ? p.likes : 0,
        })),
        total,
    };
}

function flattenInfinitePosts(
    data: InfiniteData<PostsInfinitePage> | undefined,
): LocalPost[] {
    if (!data?.pages.length) return [];
    return data.pages.flatMap((p) => p.data);
}

function Section({
    id,
    title,
    children,
    lead,
}: {
    id: string;
    title: string;
    children: ReactNode;
    lead?: string;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-6 rounded-xl border border-border bg-card/40 p-6 shadow-sm"
        >
            <h2 className="mb-2 font-heading text-xl font-semibold tracking-tight text-foreground">
                {title}
            </h2>
            {lead ? (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {lead}
                </p>
            ) : null}
            {children}
        </section>
    );
}

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed text-foreground">
            <code>{children}</code>
        </pre>
    );
}

/** 공식 문서와 동일한 GitHub 저장소 조회 */
function GithubOverviewQuery() {
    const { isPending, isError, error, isFetching, data, refetch } = useQuery({
        queryKey: ["repoData", "TanStack/query"],
        queryFn: (): Promise<GitHubRepo> =>
            fetch("https://api.github.com/repos/TanStack/query").then((res) => {
                if (!res.ok) throw new Error(res.statusText || String(res.status));
                return res.json();
            }),
    });

    if (isPending) {
        return <p className="text-sm text-muted-foreground">Loading…</p>;
    }
    if (isError) {
        return (
            <p className="text-sm text-destructive">
                오류: {error instanceof Error ? error.message : String(error)}
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {isFetching ? "다시 가져오는 중…" : "refetch()"}
                </button>
                <span className="text-xs text-muted-foreground">
                    백그라운드 갱신 중이면 <code className="rounded bg-muted px-1">isFetching</code>{" "}
                    이 true
                </span>
            </div>
            <div>
                <h3 className="text-lg font-medium">{data.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {data.description ?? "(설명 없음)"}
                </p>
                <p className="mt-2 text-sm">
                    <span className="mr-3">구독 {data.subscribers_count}</span>
                    <span className="mr-3">별 {data.stargazers_count}</span>
                    <span>포크 {data.forks_count}</span>
                </p>
            </div>
        </div>
    );
}

/** enabled: 조건이 맞을 때만 요청 */
function ConditionalUserQuery() {
    const [userId, setUserId] = useState<number | null>(null);

    const { data, isPending, isFetching, isError, error } = useQuery({
        queryKey: ["jsonplaceholder", "user", userId],
        queryFn: (): Promise<JsonPlaceholderUser> =>
            fetch(
                `https://jsonplaceholder.typicode.com/users/${userId}`,
            ).then((res) => {
                if (!res.ok) throw new Error(res.statusText);
                return res.json();
            }),
        enabled: userId != null,
    });

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                사용자 ID를 고르면 그때만{" "}
                <code className="rounded bg-muted px-1">queryFn</code> 이 실행됩니다.
            </p>
            <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((id) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setUserId(id)}
                        className={`rounded-md border px-3 py-1.5 text-sm ${
                            userId === id
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background"
                        }`}
                    >
                        사용자 {id}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => setUserId(null)}
                    className="rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground"
                >
                    선택 해제
                </button>
            </div>
            {userId == null ? (
                <p className="text-sm text-muted-foreground">아직 요청하지 않음 (enabled: false)</p>
            ) : isPending ? (
                <p className="text-sm text-muted-foreground">첫 로딩…</p>
            ) : isError ? (
                <p className="text-sm text-destructive">
                    {error instanceof Error ? error.message : String(error)}
                </p>
            ) : (
                <p className="text-sm">
                    {isFetching && <span className="mr-2 text-muted-foreground">갱신 중…</span>}
                    <strong>{data?.name}</strong> — {data?.email}
                </p>
            )}
        </div>
    );
}

/** 로컬 json-server: 조회 + 좋아요 PATCH + invalidateQueries */
function LocalPostMutationDemo() {
    const queryClient = useQueryClient();
    const [useLocal, setUseLocal] = useState(false);

    const postQuery = useQuery({
        queryKey: ["posts", 1],
        queryFn: (): Promise<LocalPost> =>
            fetch(`${JSON_SERVER}/posts/1`).then((res) => {
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                return res.json();
            }),
        enabled: useLocal,
        retry: 1,
    });

    const likeMutation = useMutation({
        mutationFn: async (nextLikes: number) => {
            const res = await fetch(`${JSON_SERVER}/posts/1`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ likes: nextLikes }),
            });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res.json() as Promise<LocalPost>;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["posts", 1] });
        },
    });

    return (
        <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={useLocal}
                    onChange={(e) => setUseLocal(e.target.checked)}
                    className="rounded border-border"
                />
                json-server 사용 (localhost:3000)
            </label>
            {!useLocal ? (
                <p className="text-sm text-muted-foreground">
                    터미널에서 <code className="rounded bg-muted px-1">npm run server</code> 후
                    체크하세요.
                </p>
            ) : postQuery.isPending ? (
                <p className="text-sm text-muted-foreground">게시글 1번 로딩…</p>
            ) : postQuery.isError ? (
                <p className="text-sm text-destructive">
                    연결 실패:{" "}
                    {postQuery.error instanceof Error
                        ? postQuery.error.message
                        : String(postQuery.error)}
                </p>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm">
                        <span className="text-muted-foreground">제목</span>{" "}
                        {postQuery.data?.title} —{" "}
                        <span className="text-muted-foreground">좋아요</span>{" "}
                        <strong>{postQuery.data?.likes ?? 0}</strong>
                    </p>
                    <button
                        type="button"
                        disabled={likeMutation.isPending}
                        onClick={() =>
                            likeMutation.mutate((postQuery.data?.likes ?? 0) + 1)
                        }
                        className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground disabled:opacity-50"
                    >
                        {likeMutation.isPending ? "저장 중…" : "좋아요 +1"}
                    </button>
                </div>
            )}
            <p className="text-xs text-muted-foreground">
                변이 성공 후{" "}
                <code className="rounded bg-muted px-1">invalidateQueries</code> 로 같은{" "}
                <code className="rounded bg-muted px-1">queryKey</code> 를 무효화해 최신 데이터를
                다시 가져옵니다.
            </p>
        </div>
    );
}

const OPTIMISTIC_POST_ID = 2;
const optimisticPostKey = ["posts", OPTIMISTIC_POST_ID] as const;

/** 캐시를 먼저 고쳐 보이게 한 뒤 서버 응답으로 맞추는 낙관적 업데이트 (게시글 2번) */
function LocalPostOptimisticDemo() {
    const queryClient = useQueryClient();
    const [useLocal, setUseLocal] = useState(false);

    const postQuery = useQuery({
        queryKey: optimisticPostKey,
        queryFn: (): Promise<LocalPost> =>
            fetch(`${JSON_SERVER}/posts/${OPTIMISTIC_POST_ID}`).then((res) => {
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                return res.json();
            }),
        enabled: useLocal,
        retry: 1,
    });

    const optimisticLike = useMutation({
        mutationFn: async (nextLikes: number) => {
            const res = await fetch(`${JSON_SERVER}/posts/${OPTIMISTIC_POST_ID}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ likes: nextLikes }),
            });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res.json() as Promise<LocalPost>;
        },
        onMutate: async (nextLikes) => {
            await queryClient.cancelQueries({ queryKey: optimisticPostKey });
            const previous = queryClient.getQueryData<LocalPost>(optimisticPostKey);
            queryClient.setQueryData<LocalPost>(optimisticPostKey, (old) =>
                old ? { ...old, likes: nextLikes } : old,
            );
            return { previous };
        },
        onError: (_err, _nextLikes, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(optimisticPostKey, context.previous);
            }
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: optimisticPostKey });
        },
    });

    return (
        <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={useLocal}
                    onChange={(e) => setUseLocal(e.target.checked)}
                    className="rounded border-border"
                />
                json-server 사용 — 게시글 #{OPTIMISTIC_POST_ID} (섹션 7의 1번과 캐시 분리)
            </label>
            {!useLocal ? (
                <p className="text-sm text-muted-foreground">
                    <code className="rounded bg-muted px-1">npm run server</code> 후 체크하세요.
                </p>
            ) : postQuery.isPending ? (
                <p className="text-sm text-muted-foreground">로딩…</p>
            ) : postQuery.isError ? (
                <p className="text-sm text-destructive">
                    {postQuery.error instanceof Error
                        ? postQuery.error.message
                        : String(postQuery.error)}
                </p>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm">
                        <span className="text-muted-foreground">제목</span>{" "}
                        {postQuery.data?.title} —{" "}
                        <span className="text-muted-foreground">좋아요</span>{" "}
                        <strong>{postQuery.data?.likes ?? 0}</strong>
                    </p>
                    <button
                        type="button"
                        disabled={optimisticLike.isPending}
                        onClick={() =>
                            optimisticLike.mutate((postQuery.data?.likes ?? 0) + 1)
                        }
                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                        {optimisticLike.isPending ? "서버 반영 중…" : "낙관적 좋아요 +1"}
                    </button>
                </div>
            )}
            <p className="text-xs text-muted-foreground">
                클릭 직후 캐시의 좋아요 수가 바로 올라갑니다. 실패 시{" "}
                <code className="rounded bg-muted px-1">onError</code> 에서 이전 스냅샷으로
                되돌립니다. <code className="rounded bg-muted px-1">onSettled</code> 에서{" "}
                무효화해 서버와 최종 일치를 맞춥니다.
            </p>
        </div>
    );
}

/** useInfiniteQuery + 스크롤 하단 근접 시 fetchNextPage (json-server _page / _limit) */
function InfiniteScrollBasicsDemo() {
    const [useLocal, setUseLocal] = useState(false);
    const loadingMoreRef = useRef(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: BASIC_POSTS_INFINITE_KEY,
        queryFn: ({ pageParam }) => fetchPostsPageBasic(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((n, p) => n + p.data.length, 0);
            const total = lastPage.total;
            const hasMore =
                total > 0
                    ? loaded < total
                    : lastPage.data.length === BASIC_INFINITE_PAGE_SIZE;
            return hasMore ? allPages.length + 1 : undefined;
        },
        enabled: useLocal,
        retry: 1,
        staleTime: 30_000,
    });

    const posts = flattenInfinitePosts(data);

    const loadNextPage = useCallback(async () => {
        if (!hasNextPage || loadingMoreRef.current || isFetchingNextPage) return;
        loadingMoreRef.current = true;
        try {
            await fetchNextPage();
        } finally {
            loadingMoreRef.current = false;
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    function handleListScroll(e: UIEvent<HTMLDivElement>) {
        const el = e.currentTarget;
        if (isPending || !hasNextPage || loadingMoreRef.current) return;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (nearBottom) void loadNextPage();
    }

    return (
        <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={useLocal}
                    onChange={(e) => setUseLocal(e.target.checked)}
                    className="rounded border-border"
                />
                json-server 사용 —{" "}
                <code className="rounded bg-muted px-1">queryKey: [&quot;posts&quot;, &quot;basic-infinite&quot;]</code>
            </label>
            {!useLocal ? (
                <p className="text-sm text-muted-foreground">
                    <code className="rounded bg-muted px-1">npm run server</code> 후 체크하세요. 한
                    번에 {BASIC_INFINITE_PAGE_SIZE}개씩 내려받고, 아래 목록 끝까지 스크롤하면 다음
                    페이지를 불러옵니다.
                </p>
            ) : isPending ? (
                <p className="text-sm text-muted-foreground">첫 페이지 로딩…</p>
            ) : isError ? (
                <p className="text-sm text-destructive">
                    {error instanceof Error ? error.message : String(error)}
                </p>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground">
                        스크롤이 하단 80px 안쪽이면{" "}
                        <code className="rounded bg-muted px-1">fetchNextPage()</code> 호출.{" "}
                        <code className="rounded bg-muted px-1">hasNextPage</code> 가 false면
                        중단.
                    </p>
                    <div
                        role="region"
                        aria-label="게시글 무한 스크롤 목록"
                        onScroll={handleListScroll}
                        className="max-h-[min(320px,45vh)] space-y-2 overflow-y-auto rounded-lg border border-border bg-background p-2"
                    >
                        <ul className="space-y-2">
                            {posts.map((p) => (
                                <li
                                    key={p.id}
                                    className="rounded-md border border-border px-3 py-2 text-sm"
                                >
                                    <span className="font-medium">#{p.id}</span> {p.title}
                                    <span className="ml-2 text-muted-foreground">
                                        좋아요 {p.likes}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {isFetchingNextPage ? (
                            <p className="py-2 text-center text-xs text-muted-foreground">
                                다음 페이지 불러오는 중…
                            </p>
                        ) : null}
                        {!hasNextPage && posts.length > 0 ? (
                            <p className="py-2 text-center text-xs text-muted-foreground">
                                모두 불러왔습니다.
                            </p>
                        ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>누적 {posts.length}개</span>
                        {hasNextPage ? (
                            <button
                                type="button"
                                onClick={() => void loadNextPage()}
                                disabled={isFetchingNextPage}
                                className="rounded border border-border bg-background px-2 py-0.5 hover:bg-muted disabled:opacity-50"
                            >
                                수동으로 다음 페이지
                            </button>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}

const nav = [
    { href: "#overview", label: "개요" },
    { href: "#setup", label: "설정" },
    { href: "#use-query", label: "useQuery" },
    { href: "#keys", label: "queryKey" },
    { href: "#states", label: "상태·refetch" },
    { href: "#enabled", label: "enabled" },
    { href: "#mutation", label: "useMutation" },
    { href: "#defaults", label: "기본값" },
    { href: "#infinite", label: "무한 스크롤" },
    { href: "#optimistic", label: "낙관적 업데이트" },
    { href: "#next", label: "다음 단계" },
];

export default function TanstackQueryBasicExample() {
    return (
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
            <header>
                <h1 className="font-heading text-2xl font-bold tracking-tight">
                    TanStack Query 기초
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    공식 개요 문서 흐름에 맞춰, 서버 상태를 가져오고·갱신하는 패턴을 섹션별로
                    익힙니다.{" "}
                    <a
                        href="https://tanstack.com/query/latest/docs/framework/react/overview"
                        className="text-primary underline-offset-4 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Overview 문서
                    </a>
                </p>
                <nav
                    aria-label="페이지 내 목차"
                    className="mt-4 flex flex-wrap gap-2 text-sm"
                >
                    {nav.map(({ href, label }) => (
                        <a
                            key={href}
                            href={href}
                            className="rounded-full border border-border bg-background px-3 py-1 text-muted-foreground hover:text-foreground"
                        >
                            {label}
                        </a>
                    ))}
                </nav>
            </header>

            <Section
                id="overview"
                title="1. TanStack Query가 다루는 것"
                lead="클라이언트 상태(폼 입력, UI 토글)와 달리 서버 상태는 원격에 있고, 비동기로 가져오며, 다른 사용자나 탭에 의해 바뀔 수 있습니다. 캐시·중복 제거·백그라운드 갱신·재시도 등을 일관되게 처리하는 데 도움을 줍니다."
            >
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>가져오기(fetch)·캐싱·동기화·갱신을 한 라이브러리로 정리</li>
                    <li>같은 queryKey로 동시에 여러 컴포넌트가 구독해도 요청은 합쳐짐(중복 제거)</li>
                    <li>문서의 첫 예제처럼 useQuery로 선언적으로 로딩·에러·데이터를 표현</li>
                </ul>
            </Section>

            <Section
                id="setup"
                title="2. 앱 전역 설정: QueryClientProvider"
                lead="QueryClient 한 개와 Provider로 트리 전체에 쿼리 클라이언트를 넘깁니다. 이 프로젝트는 main.tsx 에 이미 연결되어 있습니다."
            >
                <CodeBlock
                    children={`import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);`}
                />
            </Section>

            <Section
                id="use-query"
                title="3. 가장 작은 예: useQuery"
                lead="queryKey로 캐시 항목을 식별하고, queryFn에서 실제 비동기 작업(여기서는 fetch)을 수행합니다. 공식 문서의 TanStack/query 저장소 예제와 동일한 API입니다."
            >
                <GithubOverviewQuery />
            </Section>

            <Section
                id="keys"
                title="4. queryKey와 queryFn"
                lead="queryKey는 문자열·배열 등 직렬화 가능한 값으로 캐시를 구분합니다. 관련 매개변수(예: repo 이름, user id)를 배열에 넣으면 키가 바뀔 때마다 별도 캐시로 취급됩니다."
            >
                <p className="text-sm text-muted-foreground">
                    위 GitHub 예제 키:{" "}
                    <code className="rounded bg-muted px-1">[&quot;repoData&quot;, &quot;TanStack/query&quot;]</code> — 저장소를
                    바꾸려면 이 배열의 두 번째 값을 바꾸거나 항목을 추가하면 됩니다.
                </p>
                <CodeBlock
                    children={`useQuery({
  queryKey: ["repoData", "TanStack/query"],
  queryFn: () =>
    fetch("https://api.github.com/repos/TanStack/query").then((res) => res.json()),
});`}
                />
            </Section>

            <Section
                id="states"
                title="5. 로딩·에러·데이터와 refetch"
                lead="v5에서는 첫 펜딩에 isPending을 씁니다. 캐시가 있는 상태에서 백그라운드 갱신은 isFetching으로 구분합니다. refetch()로 수동 재요청이 가능합니다."
            >
                <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>
                        <code className="rounded bg-muted px-1">isPending</code> — 아직 성공 데이터가
                        없을 때의 대기
                    </li>
                    <li>
                        <code className="rounded bg-muted px-1">isError</code> /{" "}
                        <code className="rounded bg-muted px-1">error</code> — queryFn 실패
                    </li>
                    <li>
                        <code className="rounded bg-muted px-1">data</code> — 성공 시 결과
                    </li>
                    <li>
                        <code className="rounded bg-muted px-1">refetch()</code> — 같은 키로 다시
                        가져오기
                    </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                    실제 동작은 위 섹션 3의 GitHub 블록에서 버튼으로 확인할 수 있습니다.
                </p>
            </Section>

            <Section
                id="enabled"
                title="6. enabled: 의존·조건부 쿼리"
                lead="아직 필요한 값이 없을 때(예: 사용자가 ID를 고르기 전) 요청을 막으려면 enabled: false를 사용합니다."
            >
                <ConditionalUserQuery />
            </Section>

            <Section
                id="mutation"
                title="7. useMutation과 캐시 무효화"
                lead="서버 데이터를 바꾸는 작업은 useMutation으로 실행하고, 성공 후 invalidateQueries로 관련 queryKey를 무효화하면 연결된 useQuery가 자동으로 다시 가져옵니다."
            >
                <LocalPostMutationDemo />
            </Section>

            <Section
                id="defaults"
                title="8. 알아두면 좋은 기본 동작(요약)"
                lead="자세한 내용은 공식 가이드 Important Defaults를 참고하세요."
            >
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>staleTime 기본 0 — 마운트·포커스 등에서 다시 가져올 수 있음</li>
                    <li>실패 시 기본 재시도(네트워크 에러 등)</li>
                    <li>윈도 포커스 시 stale 쿼리 refetch(브라우저 환경)</li>
                </ul>
            </Section>

            <Section
                id="infinite"
                title="9. useInfiniteQuery와 무한 스크롤"
                lead="페이지 단위로 나뉜 목록을 이어 붙일 때 useInfiniteQuery가 data.pages 배열을 쌓아 줍니다. initialPageParam과 getNextPageParam으로 다음 페이지 번호(또는 커서)를 정하고, 스크롤·버튼 등에서 fetchNextPage를 호출합니다."
            >
                <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>
                        <code className="rounded bg-muted px-1">queryFn</code> 의{" "}
                        <code className="rounded bg-muted px-1">pageParam</code> 이 1페이지, 2페이지…
                        값으로 전달됩니다.
                    </li>
                    <li>
                        json-server는{" "}
                        <code className="rounded bg-muted px-1">_page</code>,{" "}
                        <code className="rounded bg-muted px-1">_limit</code> 와 응답 헤더{" "}
                        <code className="rounded bg-muted px-1">X-Total-Count</code> 로 전체 개수를
                        알 수 있어, 남은 개수로 hasNext를 계산하기 좋습니다.
                    </li>
                    <li>
                        <code className="rounded bg-muted px-1">TanstackQueryExample.tsx</code> 는
                        같은 패턴에 낙관적 업데이트까지 붙인 확장 예제입니다.
                    </li>
                </ul>
                <p className="mb-2 text-sm text-muted-foreground">
                    <a
                        href="https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries"
                        className="text-primary underline-offset-4 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Infinite Queries 가이드
                    </a>
                </p>
                <CodeBlock
                    children={`useInfiniteQuery({
  queryKey: ["posts", "basic-infinite"],
  queryFn: ({ pageParam }) => fetchPage(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage, allPages) =>
    hasMore(lastPage, allPages) ? allPages.length + 1 : undefined,
});`}
                />
                <InfiniteScrollBasicsDemo />
            </Section>

            <Section
                id="next"
                title="10. 다음 단계"
                lead="낙관적 업데이트는 서버 응답을 기다리지 않고 캐시를 먼저 수정해 UI를 즉시 반응하게 만드는 패턴입니다. 실패 시 이전 데이터로 롤백하고, 끝나면 refetch로 서버와 맞춥니다."
            >
                <div
                    id="optimistic"
                    className="scroll-mt-6 space-y-4 border-b border-border pb-6"
                >
                    <h3 className="font-heading text-base font-semibold text-foreground">
                        TanStack Query 방식의 낙관적 업데이트
                    </h3>
                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                        <li>
                            <code className="rounded bg-muted px-1">onMutate</code>: 진행 중인
                            refetch와 겹치지 않게{" "}
                            <code className="rounded bg-muted px-1">cancelQueries</code> 후,{" "}
                            <code className="rounded bg-muted px-1">getQueryData</code> 로 이전 값을
                            저장하고 <code className="rounded bg-muted px-1">setQueryData</code> 로
                            캐시만 먼저 갱신합니다. 반환값은 롤백용 컨텍스트로{" "}
                            <code className="rounded bg-muted px-1">onError</code> 에 전달됩니다.
                        </li>
                        <li>
                            <code className="rounded bg-muted px-1">onError</code>: 네트워크·서버
                            오류 시 컨텍스트의 스냅샷으로{" "}
                            <code className="rounded bg-muted px-1">setQueryData</code> 롤백.
                        </li>
                        <li>
                            <code className="rounded bg-muted px-1">onSettled</code> (또는{" "}
                            <code className="rounded bg-muted px-1">onSuccess</code>): 성공·실패
                            모두 끝난 뒤{" "}
                            <code className="rounded bg-muted px-1">invalidateQueries</code> 로
                            서버 기준으로 다시 맞추면 안전합니다. 리스트·무한 스크롤처럼 구조가
                            복잡하면 <code className="rounded bg-muted px-1">TanstackQueryExample.tsx</code>
                            처럼 <code className="rounded bg-muted px-1">onSuccess</code> 에서
                            임시 id를 실제 응답으로 바꿔 주는 식으로 다듬습니다.
                        </li>
                    </ol>
                    <p className="text-sm text-muted-foreground">
                        공식 가이드:{" "}
                        <a
                            href="https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates"
                            className="text-primary underline-offset-4 hover:underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Optimistic Updates
                        </a>
                    </p>
                    <CodeBlock
                        children={`useMutation({
  mutationFn: patchLikes,
  onMutate: async (nextLikes) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old) =>
      old ? { ...old, likes: nextLikes } : old,
    );
    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.previous !== undefined) queryClient.setQueryData(queryKey, ctx.previous);
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey }),
});`}
                    />
                    <LocalPostOptimisticDemo />
                </div>

                <h3 className="mb-2 font-heading text-base font-semibold text-foreground">
                    문서·예제로 이어지기
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>
                        같은 저장소의{" "}
                        <code className="rounded bg-muted px-1">TanstackQueryExample.tsx</code> —
                        무한 스크롤·추가·수정·삭제·좋아요에 낙관적 캐시 업데이트
                    </li>
                    <li>
                        <a
                            href="https://tanstack.com/query/latest/docs/framework/react/installation"
                            className="text-primary underline-offset-4 hover:underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Installation & Quick Start
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://tanstack.com/query/latest/docs/framework/react/devtools"
                            className="text-primary underline-offset-4 hover:underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Devtools
                        </a>{" "}
                        로 캐시·쿼리 상태를 시각적으로 확인
                    </li>
                    <li>
                        가이드: Queries, Mutations, Query Invalidation, Optimistic Updates
                    </li>
                </ul>
            </Section>
        </div>
    );
}
