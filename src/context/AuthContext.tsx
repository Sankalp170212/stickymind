"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/note";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      return;
    }

    setIsLoading(true);
    setToken(storedToken);

    // Verify token validity with backend
    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Token expired or invalid");
        }
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
