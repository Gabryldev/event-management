import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      console.log("Logged in user:", user);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "organizer") {
        navigate("/organizer/events");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

      <h1 className="text-4xl font-bold text-center text-slate-800">
        Welcome Back
      </h1>

      <p className="text-center text-slate-500 mt-2 mb-8">
        Login to continue
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="bg-red-100 text-red-600 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="font-medium text-slate-700">
            Email
          </label>

          <div className="relative mt-2">

            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="email"
              required
              placeholder="Enter email"
              className="w-full pl-12 pr-4 py-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

          </div>
        </div>

        <div>

          <div className="flex justify-between mb-2">

            <label className="font-medium text-slate-700">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-blue-600 text-sm hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          <div className="relative">

            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter password"
              className="w-full pl-12 pr-12 py-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <p className="text-center mt-8 text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 font-semibold"
        >
          Sign Up
        </Link>
      </p>

    </div>
  </div>
);
};

export default Login;