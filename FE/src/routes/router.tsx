import { Navigate, createBrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import App from "@/App";
import { AiOptimizationPage } from "@/pages/manager/AiOptimizationPage";
import { BuildingsPage } from "@/pages/manager/BuildingPage";
import { CheckInPage } from "@/pages/staff/CheckInPage";
import { CheckOutPage } from "@/pages/staff/CheckOutPage";
import { CurrentSessionPage } from "@/pages/user/CurrentSessionPage";
import { DashboardPage } from "@/pages/shared/DashboardPage";
import { FeedbackPage } from "@/pages/user/FeedbackPage";
import { FloorsPage } from "@/pages/manager/FloorsPage";
import { ForbiddenPage } from "@/pages/notfound/ForbiddenPage";
import { ParkingInfoPage } from "@/pages/user/ParkingInfoPage";
import { PaymentPage } from "@/pages/user/PaymentPage";
import { PricingPage } from "@/pages/manager/PricingPage";
import { ProfilePage } from "@/pages/shared/ProfilePage";
import { ReportsPage } from "@/pages/manager/ReportsPageLive";
import { ReservationsPage } from "@/pages/user/ReservationsPage";
import { RolesPage } from "@/pages/admin/RolesPage";
import { SessionsPage } from "@/pages/shared/SessionsPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { SlotsPage } from "@/pages/shared/SlotsPage";
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { VehiclesPage } from "@/pages/admin/VehiclesPage";
import { VehicleTypesPage } from "@/pages/manager/VehicleTypesPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import type { Permission } from "@/types/rbac";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LandingPage from "@/pages/auth/LandingPage";
import { IncidentPage } from "@/pages/shared/IncidentPage";

const protectedChild = (permission: Permission | Permission[], element: ReactNode) => ({
  element: <ProtectedRoute permission={permission} />,
  children: [{ element, index: true }]
});

function DefaultAppPage() {
  const role = useAuthStore((state) => state.role);
  const defaultPath = {
    SYSTEM_ADMIN: "/app/users",
    PARKING_MANAGER: "/app/dashboard",
    PARKING_STAFF: "/app/dashboard",
    PARKING_USER: "/app/parking-info"
  }[role];
  return <Navigate to={defaultPath} replace />;
}

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
      { index: true, element: <DefaultAppPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "dashboard", ...protectedChild("dashboard:view", <DashboardPage />) },
      { path: "buildings", ...protectedChild("buildings:manage", <BuildingsPage />) },
      { path: "parking-info", ...protectedChild("parkingInfo:view", <ParkingInfoPage />) },
      { path: "vehicle-types", ...protectedChild("vehicleTypes:manage", <VehicleTypesPage />) },
      { path: "vehicles", ...protectedChild("vehicles:manage", <VehiclesPage />) },
      { path: "floors", ...protectedChild("floors:manage", <FloorsPage />) },
      { path: "slots", ...protectedChild("slots:view", <SlotsPage />) },
      { path: "pricing", ...protectedChild("pricing:manage", <PricingPage />) },
      { path: "incidents", ...protectedChild("exceptions:manage", <IncidentPage />) },
      { path: "check-in", ...protectedChild("checkin:create", <CheckInPage />) },
      { path: "check-out", ...protectedChild("checkout:create", <CheckOutPage />) },
      { path: "sessions", ...protectedChild("sessions:view", <SessionsPage />) },
      { path: "reservations", ...protectedChild(["reservations:selfManage", "reservations:manage"], <ReservationsPage />) },
      { path: "current-session", ...protectedChild("currentSession:view", <CurrentSessionPage />) },
      { path: "payments", ...protectedChild("payments:pay", <PaymentPage />) },
      { path: "feedback", ...protectedChild("feedback:create", <FeedbackPage />) },
      { path: "reports", ...protectedChild("reports:view", <ReportsPage />) },
      { path: "ai-optimization", ...protectedChild("ai:view", <AiOptimizationPage />) },
      { path: "users", ...protectedChild("users:manage", <UsersPage />) },
      { path: "roles", ...protectedChild("roles:manage", <RolesPage />) },
      { path: "settings", ...protectedChild("settings:manage", <SettingsPage />) },
      { path: "audit-logs", ...protectedChild("audit:view", <AuditLogsPage />) },
      { path: "403", element: <ForbiddenPage /> }
    ]
  }
]);
