import { createBrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import App from "@/App";
import { AiOptimizationPage } from "@/pages/admin/AiOptimizationPage";
import { BuildingPage } from "@/pages/admin/BuildingPage";
import { CheckInPage } from "@/pages/staff/CheckInPage";
import { CheckOutPage } from "@/pages/staff/CheckOutPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { FloorsPage } from "@/pages/admin/FloorsPage";
import { ForbiddenPage } from "@/pages/notfound/ForbiddenPage";
import { PricingPage } from "@/pages/admin/PricingPage";
import { ReportsPage } from "@/pages/admin/ReportsPage";
import { ReservationsPage } from "@/pages/user/ReservationsPage";
import { RolesPage } from "@/pages/admin/RolesPage";
import { SessionsPage } from "@/pages/admin/SessionsPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { SlotsPage } from "@/pages/admin/SlotsPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { VehicleTypesPage } from "@/pages/admin/VehicleTypesPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import type { Permission } from "@/types/rbac";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LandingPage from "@/pages/auth/LandingPage";

const protectedChild = (permission: Permission, element: ReactNode) => ({
  element: <ProtectedRoute permission={permission} />,
  children: [{ element, index: true }]
});

export const router = createBrowserRouter([
  // Public standalone routes (no AppLayout/sidebar)
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // Authenticated app routes (with AppLayout)
  {
    path: "/app",
    element: <App />,
    children: [
      protectedChild("dashboard:view", <DashboardPage />),
      { path: "buildings", ...protectedChild("buildings:manage", <BuildingPage />) },
      { path: "vehicle-types", ...protectedChild("vehicleTypes:manage", <VehicleTypesPage />) },
      { path: "floors", ...protectedChild("floors:manage", <FloorsPage />) },
      { path: "slots", ...protectedChild("slots:manage", <SlotsPage />) },
      { path: "pricing", ...protectedChild("pricing:manage", <PricingPage />) },
      { path: "check-in", ...protectedChild("checkin:create", <CheckInPage />) },
      { path: "check-out", ...protectedChild("checkout:create", <CheckOutPage />) },
      { path: "sessions", ...protectedChild("sessions:manage", <SessionsPage />) },
      { path: "reservations", ...protectedChild("reservations:manage", <ReservationsPage />) },
      { path: "reports", ...protectedChild("reports:view", <ReportsPage />) },
      { path: "ai-optimization", ...protectedChild("ai:view", <AiOptimizationPage />) },
      { path: "users", ...protectedChild("users:manage", <UsersPage />) },
      { path: "roles", ...protectedChild("roles:manage", <RolesPage />) },
      { path: "settings", ...protectedChild("settings:manage", <SettingsPage />) },
      { path: "403", element: <ForbiddenPage /> }
    ]
  }
]);
