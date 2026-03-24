//제어 컴포넌트 기반
//Formik → state 업데이트 → 전체 렌더링
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too short").required("Required"),
});

const FormikExample = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {({ errors, touched }) => (
          <Form className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
              Login
            </h2>

            {/* Email */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Field
                name="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition
                  ${
                    errors.email && touched.email
                      ? "border-red-500 focus:ring-2 focus:ring-red-400"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                  }
                  dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              />
              <ErrorMessage
                name="email"
                component="p"
                className="mt-1 text-xs text-red-500"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Field
                name="password"
                type="password"
                placeholder="Enter your password"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition
                  ${
                    errors.password && touched.password
                      ? "border-red-500 focus:ring-2 focus:ring-red-400"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                  }
                  dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              />
              <ErrorMessage
                name="password"
                component="p"
                className="mt-1 text-xs text-red-500"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FormikExample;
