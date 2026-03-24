import { useId, useRef } from "react";

const NonControl = () => {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <NonControlUseRef />
      <NonControlUseFormData />
    </div>
  );
};
export default NonControl;

const NonControlUseRef = () => {
  const emailUUID = useId();
  const passwordUUID = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(emailRef.current?.value, passwordRef.current?.value);
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <label htmlFor={emailUUID}>Email</label>
        <input
          id={emailUUID}
          className="border border-gray-300 rounded px-3 py-2"
          type="text"
          ref={emailRef}
        />
        <label htmlFor={passwordUUID}>Password</label>
        <input
          id={passwordUUID}
          className="border border-gray-300 rounded px-3 py-2"
          type="password"
          ref={passwordRef}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow hover:bg-blue-600 active:scale-95 transition duration-150"
          type="submit"
        >
          Submit
        </button>
      </form>
    </>
  );
};

const NonControlUseFormData = () => {
  const emailUUID = useId();
  const passwordUUID = useId();
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    console.log(email, password);
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <label htmlFor={emailUUID}>Email</label>
        <input
          className="border border-gray-300 rounded px-3 py-2"
          type="text"
          name="email"
          id={emailUUID}
        />
        <label htmlFor={passwordUUID}>Password</label>
        <input
          className="border border-gray-300 rounded px-3 py-2"
          type="password"
          name="password"
          id={passwordUUID}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow hover:bg-blue-600 active:scale-95 transition duration-150"
          type="submit"
        >
          Submit
        </button>
      </form>
    </>
  );
};
