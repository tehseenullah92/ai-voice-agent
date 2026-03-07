import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./auth-context";

type Props = {
  children: React.ReactElement;
};

export function RedirectIfAuthed({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    const from =
      (location.state as { from?: string } | null)?.from ?? "/dashboard";
    return <Navigate to={from} replace />;
  }

  return children;
}

