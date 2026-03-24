import { useState } from "react";

// 공통 타입
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

const TailwindCssAll = () => {
  return <Layout />;
};
export default TailwindCssAll;

// ✅ Layout
const Layout = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <Sidebar open={open} setOpen={setOpen} />

        <div className="flex flex-col flex-1">
          <AppBar setOpen={setOpen} dark={dark} setDark={setDark} />
          <Content />
        </div>
      </div>
    </div>
  );
};

// ✅ Sidebar Props
type SidebarProps = {
  open: boolean;
  setOpen: SetState<boolean>;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:static z-20
          w-64 h-full bg-white dark:bg-gray-800
          shadow-xl flex flex-col
          transform transition-all duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-4 font-bold text-lg border-b dark:border-gray-700 flex justify-between">
          MyApp
          <button
            className="md:hidden active:scale-90"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-2">
          {["대시보드", "사용자", "설정"].map((menu) => (
            <button
              key={menu}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {menu}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// ✅ AppBar Props
type AppBarProps = {
  setOpen: SetState<boolean>;
  dark: boolean;
  setDark: SetState<boolean>;
};

const AppBar = ({ setOpen, dark, setDark }: AppBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow">
      <button className="md:hidden" onClick={() => setOpen(true)}>
        ☰
      </button>

      <div className="font-semibold dark:text-white">Dashboard</div>

      <div className="flex items-center gap-3">
        <input
          className="hidden sm:block px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="검색"
        />

        <button
          onClick={() => setDark((prev) => !prev)}
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          🌙
        </button>

        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

// ✅ Content
const Content = () => {
  return (
    <div className="p-4 md:p-6 flex-1 overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} item={item} />
        ))}
      </div>
    </div>
  );
};

// ✅ Card Props
type CardProps = {
  item: number;
};

const Card = ({ item }: CardProps) => {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
      <div className="h-40 overflow-hidden">
        <img
          src="https://picsum.photos/300"
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
      </div>

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
        <button className="px-4 py-2 bg-white rounded shadow active:scale-95">
          보기
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold mb-1 dark:text-white">카드 {item}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tailwind 종합 예제
        </p>

        <div className="mt-3">
          <input type="checkbox" id={`chk-${item}`} className="peer hidden" />
          <label
            htmlFor={`chk-${item}`}
            className="cursor-pointer text-sm text-blue-500"
          >
            선택
          </label>

          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded hidden peer-checked:block">
            체크됨!
          </div>
        </div>
      </div>
    </div>
  );
};
