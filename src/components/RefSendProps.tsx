//react19에서 ref 를 props로 전달 하는 예제
import { useRef } from "react";

type MyTextFieldProps = {
  label: string;
  inputRef?: React.Ref<HTMLInputElement>;
};

const MyTextField = ({ label, inputRef }: MyTextFieldProps) => {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block" }}>{label}</label>
      <input
        ref={inputRef}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};

const RefSendProps = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ padding: "20px" }}>
      <h2>React 19 ref props 테스트</h2>

      <MyTextField label="이메일" inputRef={emailRef} />
      <MyTextField label="비밀번호" inputRef={passwordRef} />

      <button onClick={() => emailRef.current?.focus()}>이메일 포커스</button>

      <button
        onClick={() => passwordRef.current?.focus()}
        style={{ marginLeft: "8px" }}
      >
        비밀번호 포커스
      </button>
    </div>
  );
};

export default RefSendProps;
