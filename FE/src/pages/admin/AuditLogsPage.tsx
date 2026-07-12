import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Activity, AlertTriangle, Clock, RefreshCw, RotateCcw, Save, Search, ShieldCheck } from "lucide-react";
import { auditApi, type AuditLogQuery } from "@/api/auditApi";
import { settingApi, type UpdateSystemSettingsRequest } from "@/api/settingApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
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
  { value: "LOGIN_FAILED", label: "Đăng nhập thất bại" }
];

const LOGIN_COLUMNS: ColumnDef<AuditLog>[] = [
  {
    id: "createdAt",
    header: "Thời gian",
    cell: ({ row }) => dayjs(row.original.createdAt).format("DD/MM/YYYY HH:mm")
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
      const ua = row.original.userAgent;
      if (!ua) return "—";
      if (ua.includes("Chrome")) return "Chrome/Windows";
      if (ua.includes("Firefox")) return "Firefox/Windows";
      if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari/macOS";
      if (ua.includes("Mobile")) return "Mobile/App";
      return ua.length > 25 ? ua.substring(0, 25) + "..." : ua;
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

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["audit-timeline"],
    queryFn: () => auditApi.getAll({ size: 10, sort: "createdAt,desc" }),
    refetchInterval: 30000,
    placeholderData: keepPreviousData
  });
  const timelineEvents = timelineData?.content ?? [];

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

  useEffect(() => {
    if (settings) {
      setSecurityForm({
        passwordPolicy: settings.passwordPolicy ?? "medium",
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
    }
  });

  const isFormDirty = Boolean(
    settings && securityForm &&
    (securityForm.passwordPolicy !== (settings.passwordPolicy ?? "medium") ||
     securityForm.sessionTimeout !== (settings.sessionTimeout ?? 30))
  );

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
        <MetricCard icon={Clock} label={lastLogin ? `Lần cuối: ${dayjs(lastLogin.createdAt).format("HH:mm")}` : "Lần đăng nhập cuối"} value={lastLogin?.actorUsername ?? "—"} color="indigo" />
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
                <Field label="Thời gian Timeout phiên (phút)">
                  <Input
                    type="number"
                    value={securityForm.sessionTimeout}
                    onChange={(e) => { setSecurityForm({ ...securityForm, sessionTimeout: parseInt(e.target.value, 10) || 30 }); setSettingsSubmitted(false); }}
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
                  onClick={() => updateSecurityMutation.mutate()}
                  disabled={!isFormDirty || updateSecurityMutation.isPending}
                >
                  <Save size={17} />
                  {updateSecurityMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Dòng thời gian sự kiện bảo mật"
          action={
            <Button variant="secondary" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["audit-timeline"] })} disabled={timelineLoading}>
              <RefreshCw size={16} />
              Làm mới
            </Button>
          }
        />
        <CardContent>
          {timelineLoading ? (
            <p className="text-sm text-slate-500">Đang tải sự kiện...</p>
          ) : timelineEvents.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              Chưa có sự kiện bảo mật nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-3">
              {timelineEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    {dayjs(event.createdAt).format("HH:mm")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{event.actorUsername}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_STYLES[event.action] ?? "bg-slate-100 text-slate-700"}`}>
                        {ACTION_LABELS[event.action] ?? event.action}
                      </span>
                    </div>
                    {event.action === "LOGIN" || event.action === "LOGIN_FAILED" ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {event.ipAddress ?? "—"}
                        {event.userAgent ? (event.userAgent.includes("Chrome") ? " · Chrome" : event.userAgent.includes("Firefox") ? " · Firefox" : "") : ""}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {event.resource} #{event.resourceId}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Lịch sử đăng nhập" />
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
