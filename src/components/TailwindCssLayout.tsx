import { useState } from "react";
/* 
sm → 640px 이상
md → 768px 이상
lg → 1024px 이상
xl → 1280px 이상
2xl → 1536px 이상
*/
const TailwindCssLayout = () => {
  return <Layout />;
};
export default TailwindCssLayout;

const Layout = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      {/*flex 좌우 배치, h-screen 화면 전체 높이, bg-gray-100 배경색 */}
      <div className="flex h-screen bg-gray-100">
        <Sidebar open={open} setOpen={setOpen} />
        {/*flex-col 세로 배치, flex-1 남은 공간 모두 차지 */}
        <div className="flex flex-col flex-1">
          <AppBar setOpen={setOpen} />
          <Content />
        </div>
      </div>
    </>
  );
};

// ✅ 타입 정의
type SidebarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  return (
    <>
      {/*모달   open 일경우 렌더링, fixed inset-0 화면 전체 덮음, bg-black/30 반투명 검정, md:hidden PC 안보임 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {/*모바일: fixed (떠 있음) PC:static(기본 흐름), z 20 다른것보다 위에 떠있음*/}
      <div
        className={`
          fixed md:static
          z-20
          w-64 h-full
          bg-white shadow flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-4 text-xl font-bold border-b flex justify-between">
          MyApp
          <button className="md:hidden" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>
        {/*메뉴*/}
        <nav className="flex flex-col gap-2 p-4">
          <button className="text-left px-3 py-2 rounded hover:bg-gray-100">
            대시보드
          </button>
          <button className="text-left px-3 py-2 rounded hover:bg-gray-100">
            사용자
          </button>
          <button className="text-left px-3 py-2 rounded hover:bg-gray-100">
            설정
          </button>
        </nav>
      </div>
    </>
  );
};

// ✅ 타입 정의
type AppBarProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppBar = ({ setOpen }: AppBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white shadow">
      <button className="md:hidden" onClick={() => setOpen(true)}>
        ☰
      </button>

      <div className="font-semibold">Dashboard</div>

      <div className="flex items-center gap-3">
        <input
          className="px-3 py-1 border rounded hidden sm:block"
          placeholder="검색"
        />
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

const Content = () => {
  return (
    <div className="p-4 md:p-6 flex-1 overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="p-4 bg-white rounded-lg shadow">
            카드 {item}
          </div>
        ))}
      </div>
    </div>
  );
};
