import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROLE_LABELS } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";

export function ProfilePage() {
  const { role, userName } = useAuthStore();

  return (
    <>
      <PageHeader title="Hồ sơ" description="Thông tin tài khoản đang đăng nhập." />
      <Card>
        <CardHeader title="Thông tin cá nhân" />
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-primary">
              <UserRound size={30} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{userName}</p>
              <p className="text-sm text-slate-500">{ROLE_LABELS[role]}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
