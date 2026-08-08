import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const login = async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.data.token);

    await getCurrentUser();

    return res.data.data;
  };

  // REGISTER (Email Verification)
 const register = async (name, email, password, role) => {
  const res = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });

  localStorage.setItem("token", res.data.data.token);

  await getCurrentUser();

  return res.data.data;
};

  // UPDATE PROFILE
  const updateProfile = async (profileData) => {
    setLoading(true);

    try {
      const res = await api.patch("/auth/profile", profileData);

      setUser(res.data.data);

      return res.data.data;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);