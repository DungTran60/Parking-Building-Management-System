import { Outlet } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
