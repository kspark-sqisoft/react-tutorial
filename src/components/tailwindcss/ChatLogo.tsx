//shrink-0는 Tailwind에서 flex 아이템이 줄어들지 않도록 막는 옵션입니다.
//mx-auto는 Tailwind에서 가로 가운데 정렬할 때 쓰는 핵심 클래스입니다.
const ChatLogo = () => {
  return (
    <>
      <div className="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <img
          className="size-12 shrink-0"
          src="/favicon.svg"
          alt="ChitChat Logo"
        />
        <div>
          <div className="text-xl font-medium text-black dark:text-white">
            ChitChat
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            You have a new message!
          </p>
        </div>
      </div>
    </>
  );
};
export default ChatLogo;
