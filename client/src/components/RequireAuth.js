import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function RequireAuth() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
