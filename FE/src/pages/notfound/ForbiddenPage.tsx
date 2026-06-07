import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";

export function ForbiddenPage() {
  return (
    <Card>
      <CardContent className="flex min-h-[55vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="mb-4 text-red-500" size={48} />
        <h1 className="text-2xl font-semibold text-slate-900">Không có quyền truy cập</h1>
        <p className="mt-2 max-w-md text-slate-500">Role hiện tại không được cấp quyền cho màn hình này. Hãy đổi role ở thanh trên để kiểm thử RBAC.</p>
      </CardContent>
    </Card>
  );
}
