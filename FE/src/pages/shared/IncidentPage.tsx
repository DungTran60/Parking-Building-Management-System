import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Plus, Play, CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Field, Input, Select } from "@/components/forms/FormField";
import { incidentApi } from "@/api/incidentApi";
import { userApi, type UserResponse } from "@/api/userApi";
import type { Incident, IncidentStatus, IncidentType } from "@/types/domain";
import { useAuthStore } from "@/stores/authStore";
import { getApiErrorMessage } from "@/utils/apiError";

const TYPE_LABELS: Record<IncidentType, string> = {
  LOST_TICKET: "Mất vé / mã gửi xe",
  WRONG_PLATE: "Sai biển số xe",
  WRONG_ZONE: "Gửi sai khu vực",
  OVERTIME: "Quá giờ gửi",
  UNPAID: "Chưa thanh toán",
  VEHICLE_DAMAGE: "Xe bị hỏng / va chạm",
  FACILITY_ISSUE: "Vấn đề cơ sở vật chất"
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: "Mới",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng"
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600"
};

const ALL_TYPES = Object.keys(TYPE_LABELS) as IncidentType[];
const ALL_STATUSES = Object.keys(STATUS_LABELS) as IncidentStatus[];

/* ── Component ──────────────────────────────────────── */
export function IncidentPage() {
  const role = useAuthStore((state) => state.role);
  const isStaff = role === "PARKING_STAFF";
  const isManager = role === "PARKING_MANAGER";
  const isAdmin = role === "SYSTEM_ADMIN";
  const canCreate = isStaff;
  const canAssign = isManager || isAdmin;
  const canProcess = isStaff;
  const canResolve = isStaff;
  const canClose = isManager || isAdmin;
  const canDelete = isAdmin;
  const [items, setItems] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | "ALL">("ALL");
  const [actionId, setActionId] = useState<number | null>(null);
  const [staffUsers, setStaffUsers] = useState<UserResponse[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<IncidentType>("LOST_TICKET");
  const [createDesc, setCreateDesc] = useState("");
  const [createSession, setCreateSession] = useState("");
  const [creating, setCreating] = useState(false);

  // Resolve modal
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolution, setResolution] = useState("");
  const [resolving, setResolving] = useState(false);

  // Assign modal
  const [assignId, setAssignId] = useState<number | null>(null);
  const [assignStaffId, setAssignStaffId] = useState("");
  const [assigning, setAssigning] = useState(false);

  /* ── Data fetch ──────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await incidentApi.getAll(
        filterStatus === "ALL" ? undefined : { status: filterStatus }
      );
      setItems(data);
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách sự cố. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const loadStaffUsers = useCallback(async () => {
    if (staffUsers.length > 0 || loadingStaff) return;
    setLoadingStaff(true);
    try {
      const users = await userApi.getActiveStaff();
      setStaffUsers(users.filter((user) => user.roleName === "STAFF" && user.status === "ACTIVE"));
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách Staff để phân công."));
    } finally {
      setLoadingStaff(false);
    }
  }, [loadingStaff, staffUsers.length]);

  /* ── Actions ─────────────────────────────────────── */
  const handleCreate = async () => {
    if (!createDesc.trim()) return;
    setCreating(true);
    setError("");
    try {
      const created = await incidentApi.create({
        type: createType,
        description: createDesc.trim(),
        sessionId: createSession ? Number(createSession) : undefined
      });
      setItems((prev) => [created, ...prev]);
      setShowCreate(false);
      setCreateDesc("");
      setCreateSession("");
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể ghi nhận sự cố."));
    } finally {
      setCreating(false);
    }
  };

  const handleProcess = async (id: number) => {
    setActionId(id);
    setError("");
    try {
      const updated = await incidentApi.startProcessing(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể nhận xử lý sự cố."));
    } finally { setActionId(null); }
  };

  const handleResolve = async () => {
    if (!resolveId || !resolution.trim()) return;
    setResolving(true);
    setError("");
    try {
      const updated = await incidentApi.resolve(resolveId, { resolution: resolution.trim() });
      setItems((prev) => prev.map((i) => (i.id === resolveId ? updated : i)));
      setResolveId(null);
      setResolution("");
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể xác nhận giải quyết sự cố."));
    } finally { setResolving(false); }
  };

  const handleClose = async (id: number) => {
    setActionId(id);
    setError("");
    try {
      const updated = await incidentApi.close(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể đóng sự cố."));
    } finally { setActionId(null); }
  };

  const handleAssign = async () => {
    if (!assignId || !assignStaffId) return;
    const staffId = Number(assignStaffId);
    if (Number.isNaN(staffId)) return;

    setAssigning(true);
    setActionId(assignId);
    setError("");
    try {
      const updated = await incidentApi.assign(assignId, { assigneeId: staffId });
      setItems((prev) => prev.map((i) => (i.id === assignId ? updated : i)));
      setAssignId(null);
      setAssignStaffId("");
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể phân công sự cố."));
    } finally {
      setAssigning(false);
      setActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa sự cố này?")) return;
    setActionId(id);
    setError("");
    try {
      await incidentApi.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, "Không thể xóa sự cố."));
    } finally { setActionId(null); }
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <>
      <PageHeader
        title={isStaff ? "Quản lý và xử lý sự cố" : "Giám sát sự cố"}
        description={
          isStaff
            ? "Ghi nhận, nhận xử lý và hoàn tất các sự cố phát sinh tại quầy."
            : "Theo dõi tiến độ, phân công Staff và đóng các sự cố đã được xử lý."
        }
      />

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{error}</p>{items.length === 0 && <Button variant="secondary" className="mt-3" onClick={() => void fetchData()} disabled={loading}><RefreshCw size={16} /> Thử lại</Button>}</div>}

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {(["ALL", ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {s === "ALL" ? "Tất cả" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {canCreate && <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Ghi nhận sự cố
        </Button>}
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Không có sự cố nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Loại sự cố</th>
                    <th className="px-3 py-2">Mô tả</th>
                    <th className="px-3 py-2">Mã vé</th>
                    <th className="px-3 py-2">Người báo cáo</th>
                    <th className="px-3 py-2">Người xử lý</th>
                    <th className="px-3 py-2">Trạng thái</th>
                    <th className="px-3 py-2">Thời gian</th>
                    <th className="px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400 text-xs">#{item.id}</td>
                      <td className="px-3 py-2 font-medium">
                        <span className="flex items-center gap-1">
                          <AlertTriangle size={13} className="text-orange-400" />
                          {TYPE_LABELS[item.type]}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate text-gray-600">{item.description}</td>
                      <td className="px-3 py-2 font-mono text-xs text-gray-500">
                        {item.ticketCode ?? "—"}
                      </td>
                      <td className="px-3 py-2">{item.reporterName}</td>
                      <td className="px-3 py-2">{item.assigneeName ?? (item.status === "OPEN" ? "Chưa phân công" : "—")}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(item.reportedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {canProcess && item.status === "OPEN" && (
                            <button
                              onClick={() => handleProcess(item.id)}
                              disabled={actionId === item.id}
                              title="Bắt đầu xử lý"
                              className="rounded p-1 text-blue-500 hover:bg-blue-50 disabled:opacity-50"
                              >
                                <Play size={13} />
                              </button>
                          )}
                          {canAssign && item.status === "OPEN" && (
                            <button
                              onClick={() => {
                                setAssignId(item.id);
                                setAssignStaffId(item.assigneeId ? String(item.assigneeId) : "");
                                void loadStaffUsers();
                              }}
                              disabled={actionId === item.id}
                              title="Phân công Staff"
                              className="rounded p-1 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
                            >
                              <Plus size={13} />
                            </button>
                          )}
                          {canResolve && item.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => { setResolveId(item.id); setResolution(""); }}
                              disabled={actionId === item.id}
                              title="Giải quyết"
                              className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                            >
                              <CheckCircle size={13} />
                            </button>
                          )}
                          {canClose && item.status === "RESOLVED" && (
                            <button
                              onClick={() => handleClose(item.id)}
                              disabled={actionId === item.id}
                              title="Đóng sự cố"
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                          {canDelete && <button
                            onClick={() => handleDelete(item.id)}
                            disabled={actionId === item.id}
                            title="Xóa"
                            className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                          </button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal: Ghi nhận sự cố ─────────────────── */}
      <Modal open={showCreate} title="Ghi nhận sự cố mới" onClose={() => setShowCreate(false)}>
        <div className="grid gap-4">
          <Field label="Loại sự cố">
            <Select value={createType} onChange={(e) => setCreateType(e.target.value as IncidentType)}>
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Mô tả chi tiết">
            <textarea
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
              placeholder="Mô tả sự cố..."
            />
            <p className="text-right text-xs text-gray-400">{createDesc.length}/1000</p>
          </Field>
          <Field label="ID lượt gửi xe liên quan (tùy chọn)">
            <Input
              type="number"
              value={createSession}
              onChange={(e) => setCreateSession(e.target.value)}
              placeholder="Để trống nếu không liên quan đến lượt gửi xe cụ thể"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleCreate} disabled={!createDesc.trim() || creating}>
              {creating ? "Đang ghi nhận..." : "Ghi nhận"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Giải quyết sự cố ──────────────── */}
      <Modal
        open={resolveId !== null}
        title="Giải quyết sự cố"
        onClose={() => { setResolveId(null); setResolution(""); }}
      >
        <div className="grid gap-4">
          <Field label="Ghi chú giải quyết">
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
              placeholder="Mô tả cách đã xử lý sự cố..."
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setResolveId(null); setResolution(""); }}>
              Hủy
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim() || resolving}>
              {resolving ? "Đang lưu..." : "Xác nhận giải quyết"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Phân công sự cố */}
      <Modal
        open={assignId !== null}
        title="Phân công sự cố"
        onClose={() => {
          setAssignId(null);
          setAssignStaffId("");
        }}
      >
        <div className="grid gap-4">
          <Field label="Staff xử lý">
            <Select
              value={assignStaffId}
              onChange={(e) => setAssignStaffId(e.target.value)}
              disabled={loadingStaff}
            >
              <option value="">{loadingStaff ? "Đang tải..." : "Chọn Staff"}</option>
              {staffUsers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.username} - {staff.email}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAssignId(null);
                setAssignStaffId("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAssign} disabled={!assignStaffId || assigning || loadingStaff}>
              {assigning ? "Đang phân công..." : "Xác nhận phân công"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
