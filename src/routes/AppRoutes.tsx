import type { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Equipment from "../pages/Equipment";
import Borrowing from "../pages/Borrowing";
import Returns from "../pages/Returns";
import Maintenance from "../pages/Maintenance";
import Reports from "../pages/Reports";

import MainLayout from "../layouts/MainLayout";

function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function StaffRoute({
  children,
}: {
  children: ReactNode;
}) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const profile = JSON.parse(user);

  if (
    profile.role !== "Admin" &&
    profile.role !== "Laboratory Technician"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/equipment" element={<Equipment />} />

          <Route path="/borrowing" element={<Borrowing />} />

          <Route path="/returns" element={<Returns />} />

          <Route
            path="/maintenance"
            element={
              <StaffRoute>
                <Maintenance />
              </StaffRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <StaffRoute>
                <Reports />
              </StaffRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}