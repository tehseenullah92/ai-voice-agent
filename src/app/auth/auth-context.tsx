"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthUser = {
  name: string;
  email: string;
  company?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (args: { email: string; password: string }) => Promise<void>;
  signup: (args: {
    name: string;
    email: string;
    password: string;
    company?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (args: { email?: string; name?: string }) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type StoredUser = AuthUser & { password: string };

const STORAGE_KEYS = {
  currentUser: "auth.currentUser",
  users: "auth.users",
} as const;

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.users);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function setStoredUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getStoredCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.currentUser);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredCurrentUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEYS.currentUser);
  } else {
    window.localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  }
}

async function persistServerSession(email: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

async function clearServerSession() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      void persistServerSession(user.email).catch(() => {});
    }
  }, [user?.email]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const users = getStoredUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!found || found.password !== password) {
          throw new Error("Invalid email or password.");
        }

        const authUser: AuthUser = {
          name: found.name,
          email: found.email,
          company: found.company,
        };
        setUser(authUser);
        setStoredCurrentUser(authUser);
        await persistServerSession(authUser.email);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async ({
      name,
      email,
      password,
      company,
    }: {
      name: string;
      email: string;
      password: string;
      company?: string;
    }) => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const users = getStoredUsers();
        const existing = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
          throw new Error("An account with this email already exists.");
        }

        const newUser: StoredUser = {
          name,
          email,
          company,
          password,
        };
        const updated = [...users, newUser];
        setStoredUsers(updated);

        const authUser: AuthUser = { name, email, company };
        setUser(authUser);
        setStoredCurrentUser(authUser);
        await persistServerSession(authUser.email);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setStoredCurrentUser(null);
    void clearServerSession().catch(() => {});
  }, []);

  const updateProfile = useCallback(
    ({ email: newEmail, name: newName }: { email?: string; name?: string }) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          ...(newEmail != null && { email: newEmail }),
          ...(newName != null && { name: newName }),
        };
        setStoredCurrentUser(updated);
        const users = getStoredUsers();
        const idx = users.findIndex(
          (u) => u.email.toLowerCase() === prev.email.toLowerCase()
        );
        if (idx >= 0) {
          const u = users[idx];
          users[idx] = {
            ...u,
            ...(newEmail != null && { email: newEmail }),
            ...(newName != null && { name: newName }),
          };
          setStoredUsers(users);
        }
        return updated;
      });
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, loading, login, signup, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

