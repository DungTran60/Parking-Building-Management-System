import { Navigate, createBrowserRouter } from "react-router-dom";
import type { ReactNode } from "react";
import App from "@/App";
import { AiOptimizationPage } from "@/pages/manager/AiOptimizationPage";
import { BuildingsPage } from "@/pages/manager/BuildingPage";
import { CheckInPage } from "@/pages/staff/CheckInPage";
import { CheckOutPage } from "@/pages/staff/CheckOutPage";
import { CurrentSessionPage } from "@/pages/user/CurrentSessionPage";
import { DashboardPage } from "@/pages/manager/DashboardPage";
import { FeedbackPage } from "@/pages/user/FeedbackPage";
import { FloorsPage } from "@/pages/manager/FloorsPage";
import { ForbiddenPage } from "@/pages/notfound/ForbiddenPage";
import { ParkingInfoPage } from "@/pages/user/ParkingInfoPage";
import { PaymentPage } from "@/pages/user/PaymentPage";
import { PricingPage } from "@/pages/manager/PricingPage";
import { ReportsPage } from "@/pages/manager/ReportsPage";
import { ReservationsPage } from "@/pages/user/ReservationsPage";
import { RolesPage } from "@/pages/admin/RolesPage";
import { SessionsPage } from "@/pages/manager/SessionsPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { SlotsPage } from "@/pages/manager/SlotsPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { VehicleTypesPage } from "@/pages/manager/VehicleTypesPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";
import type { Permission } from "@/types/rbac";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import LandingPage from "@/pages/auth/LandingPage";

const protectedChild = (permission: Permission, element: ReactNode) => ({
  element: <ProtectedRoute permission={permission} />,
  children: [{ element, index: true }]
});

function DefaultAppPage() {
  const role = useAuthStore((state) => state.role);
  return <Navigate to={role === "PARKING_USER" ? "/app/parking-info" : "/app/dashboard"} replace />;
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
      { path: "dashboard", ...protectedChild("dashboard:view", <DashboardPage />) },
      { path: "buildings", ...protectedChild("buildings:manage", <BuildingsPage />) },
      { path: "parking-info", ...protectedChild("parkingInfo:view", <ParkingInfoPage />) },
      { path: "vehicle-types", ...protectedChild("vehicleTypes:manage", <VehicleTypesPage />) },
      { path: "floors", ...protectedChild("floors:manage", <FloorsPage />) },
      { path: "slots", ...protectedChild("slots:manage", <SlotsPage />) },
      { path: "pricing", ...protectedChild("pricing:manage", <PricingPage />) },
      { path: "check-in", ...protectedChild("checkin:create", <CheckInPage />) },
      { path: "check-out", ...protectedChild("checkout:create", <CheckOutPage />) },
      { path: "sessions", ...protectedChild("sessions:manage", <SessionsPage />) },
      { path: "reservations", ...protectedChild("reservations:manage", <ReservationsPage />) },
      { path: "current-session", ...protectedChild("currentSession:view", <CurrentSessionPage />) },
      { path: "payments", ...protectedChild("payments:create", <PaymentPage />) },
      { path: "feedback", ...protectedChild("feedback:create", <FeedbackPage />) },
      { path: "reports", ...protectedChild("reports:view", <ReportsPage />) },
      { path: "ai-optimization", ...protectedChild("ai:view", <AiOptimizationPage />) },
      { path: "users", ...protectedChild("users:manage", <UsersPage />) },
      { path: "roles", ...protectedChild("roles:manage", <RolesPage />) },
      { path: "settings", ...protectedChild("settings:manage", <SettingsPage />) },
      { path: "403", element: <ForbiddenPage /> }
    ]
  }
]);
