import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, logout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  const legacyLogin = (token: string) => {
    localStorage.setItem("token", token);
    useAuthStore.setState({ token, isAuthenticated: true });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login: legacyLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
