//max-w-sm = 24rem = 384px
//w-full → 부모 기준으로 꽉 채우려고 함
//max-w-sm → 근데 384px 이상은 커지지 마

/*
size 종류
max-w-xs  → 320px
max-w-sm  → 384px ⭐
max-w-md  → 448px
max-w-lg  → 512px
max-w-xl  → 576px
max-w-2xl → 672px
*/
const LoginCard = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">로그인</h2>

        <input
          type="email"
          placeholder="이메일"
          className="w-full mb-3 px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="비밀번호"
          className="w-full mb-4 px-3 py-2 border rounded"
        />

        <button className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          로그인
        </button>
      </div>
    </div>
  );
};

export default LoginCard;
