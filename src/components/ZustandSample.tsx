import { create } from "zustand";
import { persist, subscribeWithSelector, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useState, useEffect } from "react";

// ==========================
// 👉 store 정의
// ==========================
type CounterStore = {
  count: number;
  loading: boolean;
  increment: (value: number) => void;
  decrement: (value: number) => void;
  reset: () => void;
  incrementAsync: (value: number) => Promise<void>;
};

const useCounterStore = create<CounterStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set) => ({
          count: 0,
          loading: false,

          increment: (value) =>
            set((state) => {
              state.count += value;
            }),

          decrement: (value) =>
            set((state) => {
              state.count -= value;
            }),

          reset: () =>
            set((state) => {
              state.count = 0;
            }),

          incrementAsync: async (value) => {
            set((state) => {
              state.loading = true;
            });

            await new Promise((res) => setTimeout(res, 1000));

            set((state) => {
              state.count += value;
              state.loading = false;
            });
          },
        })),
        {
          name: "counter-storage", // localStorage key
        },
      ),
    ),
    {
      trace: true,
    },
  ),
);

// ==========================
// 👉 메인
// ==========================
const ZustandSample = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <DebugSubscriber />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <Header />
        <Counter />
        <CounterButtons />
        <CounterOutside />
      </div>
    </div>
  );
};

export default ZustandSample;

// ==========================
// 👉 UI
// ==========================
const Header = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold text-gray-800">Zustand Full Setup</h1>
    <p className="text-gray-400 text-sm">
      persist + immer + subscribeWithSelector
    </p>
  </div>
);

// 👉 카운터
const Counter = () => {
  const count = useCounterStore((state) => state.count);
  const loading = useCounterStore((state) => state.loading);

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
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const incrementAsync = useCounterStore((s) => s.incrementAsync);
  const reset = useCounterStore((s) => s.reset);
  const loading = useCounterStore((s) => s.loading);

  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        type="number"
        value={step}
        onChange={(e) => setStep(Number(e.target.value))}
        className="w-24 px-2 py-1 border rounded text-center"
      />

      <div className="flex gap-2">
        <button
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 disabled:opacity-50"
          onClick={() => decrement(step)}
        >
          -{step}
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 disabled:opacity-50"
          onClick={reset}
        >
          Reset
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50"
          onClick={() => increment(step)}
        >
          +{step}
        </button>
      </div>

      <button
        disabled={loading}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 disabled:opacity-50"
        onClick={() => incrementAsync(step)}
      >
        +{step} (Async)
      </button>
    </div>
  );
};

// 👉 외부 표시
const CounterOutside = () => {
  const count = useCounterStore((state) => state.count);

  return (
    <div className="text-center text-gray-500 text-sm">
      Current value: <span className="font-semibold">{count}</span>
    </div>
  );
};

// ==========================
// 👉 subscribeWithSelector 사용 예 (옵션)
// ==========================
const DebugSubscriber = () => {
  useEffect(() => {
    const unsub = useCounterStore.subscribe(
      (state) => state.count,
      (count) => {
        console.log("count 변경됨:", count);
      },
    );

    return () => unsub();
  }, []);

  return null;
};
