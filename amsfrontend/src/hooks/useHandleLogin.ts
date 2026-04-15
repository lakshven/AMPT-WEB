import { useAuth } from "../context/AuthContext";

export function useHandleLogin() {
  const { login } = useAuth();

  const handleLogin = (response: any) => {
    const { token } = response;

    // ⭐ Save token to localStorage
    if (token) {
      localStorage.setItem("token", token);
    }

    // ⭐ Let AuthContext decode and set user
    login(token);
  };

  return handleLogin;
}