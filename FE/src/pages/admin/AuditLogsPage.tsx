import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { dateConfig, formatInTz } from "../../utils/dateConfig";
import { Activity, AlertCircle, AlertTriangle, Clock, Download, RefreshCw, Save, Search, ShieldCheck, Unlock } from "lucide-react";
import { auditApi, type AuditLogQuery } from "@/api/auditApi";
import { settingApi, type UpdateSystemSettingsRequest } from "@/api/settingApi";
import { userApi } from "@/api/userApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/common/Badge";
import type { AuditLog } from "@/types/domain";

const ACTION_STYLES: Record<string, string> = {
  LOGIN: "bg-emerald-100 text-emerald-800",
  LOGOUT: "bg-slate-100 text-slate-600",
  LOGIN_FAILED: "bg-red-100 text-red-800",
  USER_CREATED: "bg-green-100 text-green-800",
  USER_UPDATED: "bg-blue-100 text-blue-800",
  USER_DELETED: "bg-red-100 text-red-800",
  USER_LOCKED: "bg-amber-100 text-amber-800",
  USER_UNLOCKED: "bg-emerald-100 text-emerald-800",
  CHECK_IN: "bg-green-100 text-green-800",
  CHECK_OUT: "bg-blue-100 text-blue-800",
  UPDATE_SETTINGS: "bg-purple-100 text-purple-800"
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
  LOGIN_FAILED: "Đăng nhập thất bại",
  USER_CREATED: "Tạo tài khoản",
  USER_UPDATED: "Sửa tài khoản",
  USER_DELETED: "Xóa tài khoản",
  USER_LOCKED: "Khóa tài khoản",
  USER_UNLOCKED: "Mở tài khoản",
  CHECK_IN: "Xe vào",
  CHECK_OUT: "Xe ra",
  UPDATE_SETTINGS: "Cập nhật cài đặt"
};

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "LOGIN", label: "Đăng nhập" },
  { value: "LOGOUT", label: "Đăng xuất" },
  { value: "LOGIN_FAILED", label: "Đăng nhập thất bại" },
  { value: "USER_CREATED", label: "Tạo tài khoản" },
  { value: "USER_UPDATED", label: "Sửa tài khoản" },
  { value: "USER_DELETED", label: "Xóa tài khoản" },
  { value: "USER_LOCKED", label: "Khóa tài khoản" },
  { value: "USER_UNLOCKED", label: "Mở khóa tài khoản" },
  { value: "CHECK_IN", label: "Xe vào" },
  { value: "CHECK_OUT", label: "Xe ra" },
  { value: "UPDATE_SETTINGS", label: "Cập nhật cài đặt" }
];

const LOGIN_COLUMNS: ColumnDef<AuditLog>[] = [
  {
    id: "createdAt",
    header: "Thời gian",
    cell: ({ row }) => formatInTz(row.original.createdAt, dateConfig.timezone, dateConfig.dateTimeFormat)
  },
  {
    accessorKey: "actorUsername",
    header: "Người dùng"
  },
  {
    id: "action",
    header: "Hành động",
    cell: ({ row }) => {
      const action = row.original.action;
      const label = ACTION_LABELS[action] ?? action;
      const style = ACTION_STYLES[action] ?? "bg-slate-100 text-slate-700";
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
          {label}
        </span>
      );
    }
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => row.original.ipAddress ?? "—"
  },
  {
    id: "userAgent",
    header: "Trình duyệt",
    cell: ({ row }) => {
      const ua = row.original.userAgent ?? "";
      if (!ua) return "—";
      const os = ua.match(/\(([^)]+)\)/)?.[1] ?? "";
      const osShort = os.includes("Windows") ? "Win" :
        os.includes("Mac OS") ? "macOS" :
        os.includes("Linux") && ua.includes("Android") ? "Android" :
        os.includes("Linux") ? "Linux" :
        os.includes("iPhone") || os.includes("iPad") ? "iOS" : "";
      const browser = ua.includes("Edg/") ? "Edge" :
        ua.includes("Chrome") && !ua.includes("Edg/") ? "Chrome" :
        ua.includes("Firefox") ? "Firefox" :
        ua.includes("Safari") && !ua.includes("Chrome") ? "Safari" :
        "";
      return browser || osShort ? `${browser}/${osShort}` : ua.length > 30 ? ua.substring(0, 30) + "..." : ua;
    }
  }
];

export function AuditLogsPage() {
  const queryClient = useQueryClient();

  const today = dayjs().format("YYYY-MM-DD");
  const weekAgo = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const monthAgo = dayjs().subtract(30, "day").format("YYYY-MM-DD");

  const commonQuery = (overrides?: Partial<AuditLogQuery>): AuditLogQuery => ({
    size: 1,
    sort: "createdAt,desc",
    ...overrides
  });

  const { data: todayLoginsData } = useQuery({
    queryKey: ["audit-count", "LOGIN", today],
    queryFn: () => auditApi.getAll(commonQuery({ action: "LOGIN", from: `${today}T00:00:00`, to: `${today}T23:59:59` })),
    placeholderData: keepPreviousData
  });

  const { data: failedLoginsData } = useQuery({
    queryKey: ["audit-count", "LOGIN_FAILED", weekAgo],
    queryFn: () => auditApi.getAll(commonQuery({ action: "LOGIN_FAILED", from: `${weekAgo}T00:00:00`, to: `${today}T23:59:59` })),
    placeholderData: keepPreviousData
  });

  const { data: totalEventsData } = useQuery({
    queryKey: ["audit-count", "ALL", monthAgo],
    queryFn: () => auditApi.getAll(commonQuery({ from: `${monthAgo}T00:00:00`, to: `${today}T23:59:59` })),
    placeholderData: keepPreviousData
  });

  const { data: lastLoginData } = useQuery({
    queryKey: ["audit-last-login"],
    queryFn: () => auditApi.getAll(commonQuery({ action: "LOGIN" })),
    placeholderData: keepPreviousData
  });

  const todayLogins = todayLoginsData?.totalElements ?? 0;
  const failedLogins = failedLoginsData?.totalElements ?? 0;
  const totalEvents = totalEventsData?.totalElements ?? 0;
  const lastLogin = lastLoginData?.content?.[0] ?? null;

  const [loginFilter, setLoginFilter] = useState({
    action: "",
    actorUsername: "",
    from: "",
    to: "",
    page: 0
  });

  const invalidRange = Boolean(loginFilter.from && loginFilter.to && new Date(loginFilter.to) < new Date(loginFilter.from));

  const loginQueryParams: AuditLogQuery = {};
  if (!invalidRange) {
    if (loginFilter.action) loginQueryParams.action = loginFilter.action;
    if (loginFilter.actorUsername) loginQueryParams.actorUsername = loginFilter.actorUsername;
    if (loginFilter.from) loginQueryParams.from = `${loginFilter.from}T00:00:00`;
    if (loginFilter.to) loginQueryParams.to = `${loginFilter.to}T23:59:59`;
    loginQueryParams.page = loginFilter.page;
    loginQueryParams.size = 10;
    loginQueryParams.sort = "createdAt,desc";
  }

  const { data: loginHistoryData, isLoading: loginHistoryLoading } = useQuery({
    queryKey: ["audit-login-history", loginFilter],
    queryFn: () => auditApi.getAll(loginQueryParams),
    enabled: !invalidRange,
    placeholderData: keepPreviousData
  });
  const loginHistory = loginHistoryData?.content ?? [];
  const loginTotalPages = loginHistoryData?.totalPages ?? 0;

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: settingApi.get
  });

  const [securityForm, setSecurityForm] = useState<{ passwordPolicy: string; sessionTimeout: number } | null>(null);
  const [settingsSubmitted, setSettingsSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeoutError, setTimoutError] = useState("");

  useEffect(() => {
    if (settings) {
      setSecurityForm({
        passwordPolicy: settings.passwordPolicy?.toLowerCase() ?? "medium",
        sessionTimeout: settings.sessionTimeout ?? 30
      });
    }
  }, [settings]);

  const updateSecurityMutation = useMutation({
    mutationFn: () => {
      if (!settings || !securityForm) throw new Error("Chưa có dữ liệu cấu hình.");
      const payload: UpdateSystemSettingsRequest = {
        systemName: settings.systemName,
        passwordPolicy: securityForm.passwordPolicy,
        sessionTimeout: securityForm.sessionTimeout,
        logoUrl: settings.logoUrl,
        version: settings.version,
        themeColor: settings.themeColor,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat
      };
      return settingApi.update(payload);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["system-settings"], result);
      setSettingsSubmitted(true);
      setShowConfirm(false);
    }
  });

  const isFormDirty = Boolean(
    settings && securityForm &&
    (securityForm.passwordPolicy !== (settings.passwordPolicy ?? "medium") ||
     securityForm.sessionTimeout !== (settings.sessionTimeout ?? 30))
  );

  const handleSessionTimeoutChange = (value: string) => {
    setSettingsSubmitted(false);
    if (value === "") {
      setSecurityForm(prev => prev ? { ...prev, sessionTimeout: 0 } : prev);
      setTimoutError("Thời gian timeout tối thiểu là 5 phút.");
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    if (num < 5) setTimoutError("Thời gian timeout tối thiểu là 5 phút.");
    else if (num > 480) setTimoutError("Thời gian timeout tối đa là 480 phút (8 giờ).");
    else setTimoutError("");
    setSecurityForm(prev => prev ? { ...prev, sessionTimeout: num } : prev);
  };

  const handleSave = () => {
    if (!timeoutError) setShowConfirm(true);
  };

  const { data: lockedUsers, isLoading: lockedLoading } = useQuery({
    queryKey: ["users-locked"],
    queryFn: async () => {
      const all = await userApi.getAll();
      return all.filter(u => u.status === "INACTIVE");
    },
    refetchInterval: 30000,
    placeholderData: keepPreviousData
  });

  const unlockMutation = useMutation({
    mutationFn: (userId: number | string) => userApi.updateStatus(userId, "ACTIVE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-locked"] });
    }
  });

  const exportLogs = async () => {
    const allData = await auditApi.getAll({
      from: loginFilter.from ? `${loginFilter.from}T00:00:00` : undefined,
      to: loginFilter.to ? `${loginFilter.to}T23:59:59` : undefined,
      action: loginFilter.action || undefined,
      sort: "createdAt,desc"
    });
    const rows = allData.content ?? [];
    const header = "Thời gian,Người dùng,Hành động,IP,Trình duyệt";
    const csv = [
      header,
      ...rows.map(r =>
        [
          formatInTz(r.createdAt, dateConfig.timezone, dateConfig.dateTimeFormat),
          r.actorUsername,
          ACTION_LABELS[r.action] ?? r.action,
          r.ipAddress ?? "",
          r.userAgent ?? ""
        ].join(",")
      )
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = `audit-logs-${dayjs().format("YYYYMMDDHHmm")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <PageHeader
        title="Bảo mật"
        description="Giám sát đăng nhập, sự kiện bảo mật và cấu hình an toàn hệ thống."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Activity} label="Đăng nhập hôm nay" value={String(todayLogins)} color="emerald" />
        <MetricCard icon={AlertTriangle} label="Đăng nhập thất bại (7 ngày)" value={String(failedLogins)} color="red" />
        <MetricCard icon={ShieldCheck} label="Tổng sự kiện (30 ngày)" value={String(totalEvents)} color="blue" />
        <MetricCard icon={Clock} label={lastLogin ? `Lần cuối: ${formatInTz(lastLogin.createdAt, dateConfig.timezone, "HH:mm")}` : "Lần đăng nhập cuối"} value={lastLogin?.actorUsername ?? "—"} color="indigo" />
      </div>

      <Card>
        <CardHeader title="Cấu hình bảo mật" />
        <CardContent>
          {settingsLoading ? (
            <p className="text-sm text-slate-500">Đang tải cấu hình...</p>
          ) : securityForm ? (
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Chính sách mật khẩu">
                  <Select
                    value={securityForm.passwordPolicy}
                    onChange={(e) => { setSecurityForm({ ...securityForm, passwordPolicy: e.target.value }); setSettingsSubmitted(false); }}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </Select>
                </Field>
                <Field
                  label="Thời gian Timeout phiên (phút)"
                  error={timeoutError}
                  hint="Cho phép: 5 - 480 phút"
                >
                  <Input
                    type="number"
                    min={5}
                    max={480}
                    value={securityForm.sessionTimeout}
                    onChange={(e) => handleSessionTimeoutChange(e.target.value)}
                  />
                </Field>
              </div>

              {settingsSubmitted && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
                  <ShieldCheck size={17} />
                  Cấu hình bảo mật đã được lưu thành công.
                </div>
              )}

              {updateSecurityMutation.isError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {updateSecurityMutation.error instanceof Error ? updateSecurityMutation.error.message : "Không thể lưu cấu hình."}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={!isFormDirty || updateSecurityMutation.isPending || !!timeoutError}
                >
                  <Save size={17} />
                  {updateSecurityMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal open={showConfirm} title="Xác nhận thay đổi cấu hình bảo mật" onClose={() => setShowConfirm(false)}>
        <div className="grid gap-4">
          <div className="flex items-start gap-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>Các thay đổi sau sẽ được áp dụng ngay lập tức:</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 font-medium text-slate-600">Chính sách mật khẩu</td>
                <td className="py-2 text-right">
                  {securityForm?.passwordPolicy === "low" ? "Thấp" :
                   securityForm?.passwordPolicy === "high" ? "Cao" : "Trung bình"}
                </td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-slate-600">Thời gian timeout phiên</td>
                <td className="py-2 text-right">{securityForm?.sessionTimeout} phút</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>Hủy</Button>
            <Button onClick={() => updateSecurityMutation.mutate()}>Xác nhận lưu</Button>
          </div>
        </div>
      </Modal>

      <Card>
        <CardHeader title="Tài khoản đã khóa" />
        <CardContent>
          {lockedLoading ? (
            <p className="text-sm text-slate-500">Đang tải danh sách...</p>
          ) : !lockedUsers || lockedUsers.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              <ShieldCheck size={24} className="mx-auto mb-2 text-slate-300" />
              Không có tài khoản nào bị khóa.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {lockedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">{user.email} · {user.roleName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge value="INACTIVE" />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => unlockMutation.mutate(user.id)}
                      disabled={unlockMutation.isPending}
                    >
                      <Unlock size={14} />
                      Mở khóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Lịch sử đăng nhập"
          action={
            <Button variant="secondary" size="sm" onClick={exportLogs}>
              <Download size={16} />
              Xuất CSV
            </Button>
          }
        />
        <CardContent className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
            <Field label="Tên người dùng">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
                <Input
                  value={loginFilter.actorUsername}
                  onChange={(e) => setLoginFilter({ ...loginFilter, actorUsername: e.target.value, page: 0 })}
                  placeholder="VD: admin"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Hành động">
              <Select
                value={loginFilter.action}
                onChange={(e) => setLoginFilter({ ...loginFilter, action: e.target.value, page: 0 })}
              >
                {ACTION_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-700">Khoảng ngày</span>
              <DateRangePicker
                value={{ from: loginFilter.from, to: loginFilter.to }}
                onChange={(next) => setLoginFilter({ ...loginFilter, from: next.from, to: next.to, page: 0 })}
              />
            </div>
            <Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ["audit-login-history"] })}>
              <RefreshCw size={16} />
              Làm mới
            </Button>
          </div>

          {invalidRange && (
            <p className="text-xs text-red-600">"Đến ngày" phải sau "Từ ngày".</p>
          )}

          {loginHistoryLoading ? (
            <p className="text-sm text-slate-500">Đang tải lịch sử đăng nhập...</p>
          ) : loginHistory.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              Không tìm thấy lịch sử đăng nhập phù hợp.
            </div>
          ) : (
            <DataTable data={loginHistory} columns={LOGIN_COLUMNS} showSearch={false} />
          )}

          {loginTotalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Trang {loginFilter.page + 1} / {loginTotalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={loginFilter.page === 0} onClick={() => setLoginFilter({ ...loginFilter, page: loginFilter.page - 1 })}>Trang trước</Button>
                <Button variant="secondary" disabled={loginFilter.page >= loginTotalPages - 1} onClick={() => setLoginFilter({ ...loginFilter, page: loginFilter.page + 1 })}>Trang sau</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string; size?: number }>; label: string; value: string; color: string }) {
  const colorClass: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700"
  };

  return (
    <div className={`rounded-lg p-4 ${colorClass[color] ?? "bg-slate-50 text-slate-700"}`}>
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
