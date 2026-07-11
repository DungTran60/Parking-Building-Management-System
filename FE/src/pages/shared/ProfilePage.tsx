import { useState, type FormEvent } from "react";
import { UserRound } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Field, Input } from "@/components/forms/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROLE_LABELS } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";
import { userApi } from "@/api/userApi";
import { getApiErrorMessage } from "@/utils/apiError";

export function ProfilePage() {
  const role = useAuthStore((state) => state.role);
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: userApi.getProfile
  });

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditOpen(false);
      setPwOpen(false);
      setFormError(null);
    },
    onError: (err) => setFormError(getApiErrorMessage(err, "Không thể cập nhật hồ sơ."))
  });

  const openEdit = () => { setFormError(null); setNotice(null); setEditOpen(true); };
  const openPw = () => { setFormError(null); setNotice(null); setPwOpen(true); };
  const closeEdit = () => { setEditOpen(false); setFormError(null); };
  const closePw = () => { setPwOpen(false); setFormError(null); };

  const saveInfo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const form = new FormData(event.currentTarget);
    updateMutation.mutate(
      {
        email: String(form.get("email") ?? "").trim(),
        phoneNumber: String(form.get("phoneNumber") ?? "").trim()
      },
      { onSuccess: () => setNotice("Đã cập nhật thông tin liên hệ.") }
    );
  };

  const savePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");
    if (newPassword !== confirm) {
      setFormError("Mật khẩu xác nhận không khớp.");
      return;
    }
    updateMutation.mutate(
      {
        currentPassword: String(form.get("currentPassword") ?? ""),
        newPassword
      },
      { onSuccess: () => setNotice("Đã đổi mật khẩu.") }
    );
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Hồ sơ" description="Thông tin tài khoản đang đăng nhập." />
        <Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải hồ sơ...</CardContent></Card>
      </>
    );
  }

  if (isError || !profile) {
    return (
      <>
        <PageHeader title="Hồ sơ" description="Thông tin tài khoản đang đăng nhập." />
        <Card>
          <CardContent className="grid justify-items-center gap-3 py-12 text-center">
            <p className="text-sm text-red-600">{getApiErrorMessage(error, "Không thể tải hồ sơ.")}</p>
            <Button variant="secondary" onClick={() => void refetch()}>Thử lại</Button>
          </CardContent>
        </Card>
      </>
    );
  }

  const active = profile.status === "ACTIVE";

  return (
    <>
      <PageHeader title="Hồ sơ" description="Thông tin tài khoản đang đăng nhập." />

      {notice && (
        <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <Card>
        <CardHeader
          title="Thông tin cá nhân"
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={openEdit}>Chỉnh sửa thông tin</Button>
              <Button variant="secondary" onClick={openPw}>Đổi mật khẩu</Button>
            </div>
          }
        />
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-primary">
              <UserRound size={30} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-slate-900">{profile.username}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {active ? "Đang hoạt động" : "Tạm khóa"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{ROLE_LABELS[role]}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Info label="Email" value={profile.email || "—"} />
            <Info label="Số điện thoại" value={profile.phoneNumber || "—"} />
            <Info label="Mã tài khoản" value={`#${profile.id}`} />
          </div>
        </CardContent>
      </Card>

      <Modal open={editOpen} title="Chỉnh sửa thông tin" onClose={closeEdit}>
        <form className="grid gap-4" onSubmit={saveInfo}>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={profile.email || ""} disabled={updateMutation.isPending} />
          </Field>
          <Field label="Số điện thoại">
            <Input name="phoneNumber" defaultValue={profile.phoneNumber || ""} maxLength={20} disabled={updateMutation.isPending} />
          </Field>
          {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeEdit} disabled={updateMutation.isPending}>Hủy</Button>
            <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={pwOpen} title="Đổi mật khẩu" onClose={closePw}>
        <form className="grid gap-4" onSubmit={savePassword}>
          <Field label="Mật khẩu hiện tại">
            <Input name="currentPassword" type="password" required disabled={updateMutation.isPending} />
          </Field>
          <Field label="Mật khẩu mới (tối thiểu 6 ký tự)">
            <Input name="newPassword" type="password" minLength={6} required disabled={updateMutation.isPending} />
          </Field>
          <Field label="Xác nhận mật khẩu mới">
            <Input name="confirmPassword" type="password" minLength={6} required disabled={updateMutation.isPending} />
          </Field>
          {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closePw} disabled={updateMutation.isPending}>Hủy</Button>
            <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Đang lưu..." : "Đổi mật khẩu"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
