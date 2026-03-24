import {
  createContext,
  useCallback,
  useMemo,
  type ReactNode,
  use,
  useState,
} from "react";

// ==========================
// 👉 타입 정의
// ==========================
type ActionsType = {
  increment: (value: number) => void;
  decrement: (value: number) => void;
  reset: () => void;
  incrementAsync: (value: number) => Promise<void>;
};

// ==========================
// 👉 Context 생성
// ==========================
const CountContext = createContext<number>(0);
const ActionsContext = createContext<ActionsType | null>(null);
const LoadingContext = createContext<boolean>(false);

// ==========================
// 👉 Provider
// ==========================
type CounterProviderProps = {
  children: ReactNode;
};

const CounterProvider = ({ children }: CounterProviderProps) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const increment = useCallback((value: number) => {
    setCount((c) => c + value);
  }, []);

  const decrement = useCallback((value: number) => {
    setCount((c) => c - value);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  // ✅ 비동기
  const incrementAsync = useCallback(async (value: number) => {
    setLoading(true);

    await new Promise((res) => setTimeout(res, 1000));

    setCount((c) => c + value);
    setLoading(false);
  }, []);

  const actions = useMemo(
    () => ({ increment, decrement, reset, incrementAsync }),
    [increment, decrement, reset, incrementAsync],
  );

  return (
    <CountContext value={count}>
      <LoadingContext value={loading}>
        <ActionsContext value={actions}>{children}</ActionsContext>
      </LoadingContext>
    </CountContext>
  );
};

// ==========================
// 👉 메인
// ==========================
const ContextAPISample = () => {
  return (
    <CounterProvider>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <Header />
          <Counter />
          <CounterButtons />
          <CounterOutside />
        </div>
      </div>
    </CounterProvider>
  );
};

export default ContextAPISample;

// ==========================
// 👉 UI
// ==========================
const Header = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold text-gray-800">Context Async Counter</h1>
    <p className="text-gray-400 text-sm">async + loading state</p>
  </div>
);

// 👉 카운터
const Counter = () => {
  const count = use(CountContext);
  const loading = use(LoadingContext);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-5xl font-extrabold text-blue-500 bg-blue-50 px-6 py-4 rounded-xl shadow-inner">
        {count}
      </div>

      {loading && <p className="text-sm text-gray-400">Updating...</p>}
    </div>
  );
};

// 👉 버튼
const CounterButtons = () => {
  const actions = use(ActionsContext)!;
  const loading = use(LoadingContext);
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        type="number"
        value={step}
        onChange={(e) => setStep(Number(e.target.value))}
        className="w-24 px-2 py-1 border rounded text-center"
      />

      <div className="flex gap-3">
        <button
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 disabled:opacity-50"
          onClick={() => actions.decrement(step)}
        >
          -{step}
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 disabled:opacity-50"
          onClick={actions.reset}
        >
          Reset
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50"
          onClick={() => actions.increment(step)}
        >
          +{step}
        </button>
      </div>

      {/* 👉 비동기 버튼 */}
      <button
        disabled={loading}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 disabled:opacity-50"
        onClick={() => actions.incrementAsync(step)}
      >
        +{step} (Async)
      </button>
    </div>
  );
};

// 👉 외부 표시
const CounterOutside = () => {
  const count = use(CountContext);

  return (
    <div className="text-center text-gray-500 text-sm">
      Current value: <span className="font-semibold">{count}</span>
    </div>
  );
};
