import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [email] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/verify-email", {
        email,
        code,
      });

      localStorage.setItem("token", res.data.data.token);

      setUser({
        _id: res.data.data._id,
        name: res.data.data.name,
        email: res.data.data.email,
        role: res.data.data.role,
      });

      toast.success(res.data.message);

      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-3">
          Verify Email
        </h1>

        <p className="text-gray-500 mb-6">
          Enter the 6-digit verification code sent to your email.
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border rounded-lg p-3 bg-gray-100"
          />

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
            className="w-full border rounded-lg p-3 text-center tracking-[8px] text-xl"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;