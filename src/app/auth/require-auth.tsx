import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./auth-context";

type Props = {
  children: React.ReactElement;
};

export function RequireAuth({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}

