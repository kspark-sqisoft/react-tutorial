import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface Post {
  id: number;
  title: string;
  views: number;
}

const AxiosBasicExample = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get<Post[]>("http://localhost:3000/posts", {
        params: {
          _page: 1,
          _limit: 10,
          _sort: "id",
          _order: "desc",
        },
        signal,
      });

      setPosts(response.data);
    } catch (error: unknown) {
      console.error(error);

      if (axios.isCancel(error)) return;

      setError(error instanceof Error ? error.message : "unknown error");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 space-y-6">
        {/* 헤더 + 재요청 버튼 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Axios Posts</h1>
            <p className="text-gray-400 text-sm">json-server 데이터 가져오기</p>
          </div>

          <button
            onClick={() => fetchData()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            🔄 재요청
          </button>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* 로딩 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="p-4 rounded-xl border bg-gray-50 hover:bg-blue-50 transition shadow-sm flex justify-between items-center"
              >
                <span className="font-medium text-gray-700">{post.title}</span>
                <span className="text-xs text-gray-400">👁 {post.views}</span>
              </li>
            ))}
          </ul>
        )}

        {/* 빈 상태 */}
        {!isLoading && posts.length === 0 && !error && (
          <p className="text-center text-gray-400 text-sm">데이터가 없습니다</p>
        )}
      </div>
    </div>
  );
};

export default AxiosBasicExample;
