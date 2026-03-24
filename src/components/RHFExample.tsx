//비제어 컴포넌트 기반 (성능 좋음)
//RHF → DOM에서 값 관리 → 필요한 부분만 업데이트
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Too short"),
});

type FormData = z.infer<typeof schema>;

const RHFExample = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          Login
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            {...register("email")}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition
              ${
                errors.email
                  ? "border-red-500 focus:ring-2 focus:ring-red-400"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
              }
              dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition
              ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-400"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
              }
              dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white font-semibold transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default RHFExample;
