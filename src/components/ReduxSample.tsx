import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useState } from "react";
// 내부적으로 **Immer**가 자동 적용됨
// ==========================
// 👉 slice
// ==========================
type CounterState = {
  value: number;
  loading: boolean;
};

const initialState: CounterState = {
  value: 0,
  loading: false,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    decrement: (state, action: PayloadAction<number>) => {
      state.value -= action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },

    // 👉 비동기 상태 관리용
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

const { increment, decrement, reset, setLoading } = counterSlice.actions;

// ==========================
// 👉 thunk (비동기 액션)
// ==========================
const incrementAsync = (value: number) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true));

  await new Promise((resolve) => setTimeout(resolve, 1000));

  dispatch(increment(value));
  dispatch(setLoading(false));
};

// ==========================
// 👉 store
// ==========================
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// ==========================
// 👉 메인
// ==========================
const ReduxSample = () => {
  return (
    <Provider store={store}>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <Header />
          <Counter />
          <CounterButtons />
          <CounterOutside />
        </div>
      </div>
    </Provider>
  );
};

export default ReduxSample;

// ==========================
// 👉 UI
// ==========================
const Header = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold text-gray-800">Redux Async Counter</h1>
    <p className="text-gray-400 text-sm">async increment example</p>
  </div>
);

// 👉 값 표시
const Counter = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const loading = useSelector((state: RootState) => state.counter.loading);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-5xl font-extrabold text-blue-500 bg-blue-50 px-6 py-4 rounded-xl shadow-inner">
        {count}
      </div>

      {loading && <p className="text-sm text-gray-400">Updating...</p>}
    </div>
  );
};

// 👉 버튼 + 입력값
const CounterButtons = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState(1);
  const loading = useSelector((state: RootState) => state.counter.loading);

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
          onClick={() => dispatch(decrement(step))}
        >
          -{step}
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 disabled:opacity-50"
          onClick={() => dispatch(reset())}
        >
          Reset
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50"
          onClick={() => dispatch(increment(step))}
        >
          +{step}
        </button>
      </div>

      {/* 👉 비동기 버튼 */}
      <button
        disabled={loading}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 disabled:opacity-50"
        onClick={() => dispatch(incrementAsync(step))}
      >
        +{step} (Async)
      </button>
    </div>
  );
};

// 👉 외부 표시
const CounterOutside = () => {
  const count = useSelector((state: RootState) => state.counter.value);

  return (
    <div className="text-center text-gray-500 text-sm">
      Current value: <span className="font-semibold">{count}</span>
    </div>
  );
};
