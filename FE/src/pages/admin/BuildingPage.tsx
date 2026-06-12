import React, { useEffect, useState, useTransition } from "react";
import { BuildingTable } from "@/components/BuildingTable";
import { BuildingForm } from "@/components/BuildingForm";
import { buildingApi } from "@/api/buildingApi";
import type { Building } from "@/api/buildingApi";
import { Plus, Search, Building2, AlertTriangle, ShieldAlert } from "lucide-react";

export const BuildingPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authWarning, setAuthWarning] = useState<boolean>(false);

  const loadBuildings = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setAuthWarning(false);
    try {
      const data = await buildingApi.getAll();
      setBuildings(data);
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách tòa nhà:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthWarning(true);
      }
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng kiểm tra trạng thái Backend hoặc Token đăng nhập.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const handleCreateOrUpdate = async (data: Omit<Building, "id" | "createdAt">) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingBuilding && editingBuilding.id) {
        const updated = await buildingApi.update(editingBuilding.id, data);
        setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        showToast("Cập nhật tòa nhà thành công!");
      } else {
        const created = await buildingApi.create(data);
        setBuildings((prev) => [created, ...prev]);
        showToast("Thêm tòa nhà mới thành công!");
      }
      setIsFormOpen(false);
      setEditingBuilding(null);
    } catch (err: any) {
      console.error("Lỗi khi lưu tòa nhà:", err);
      const backendError = err.response?.data?.error || err.response?.data?.buildingName || "Không thể thực hiện yêu cầu.";
      setErrorMsg(`Lỗi: ${backendError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tòa nhà này? Tất cả các tầng liên quan có thể bị ảnh hưởng.")) {
      return;
    }
    setErrorMsg(null);
    try {
      await buildingApi.delete(id);
      setBuildings((prev) => prev.filter((b) => b.id !== id));
      showToast("Xóa tòa nhà thành công!");
    } catch (err: any) {
      console.error("Lỗi khi xóa tòa nhà:", err);
      const backendError = err.response?.data?.error || "Không thể xóa tòa nhà này.";
      setErrorMsg(`Lỗi: ${backendError}`);
    }
  };

  const showToast = (message: string) => {
    setSuccessMsg(message);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const filteredBuildings = buildings.filter(
    (b) =>
      b.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-500" />
            Quản lý tòa nhà
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các tòa nhà đỗ xe trong hệ thống, bao gồm tên, địa chỉ và tổng số tầng.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBuilding(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Thêm tòa nhà
        </button>
      </div>

      {/* Auth / Error Banners */}
      {authWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h3 className="font-semibold text-amber-900">Yêu cầu xác thực tài khoản</h3>
              <p className="mt-1 text-sm text-amber-700 leading-relaxed">
                Các API thao tác tòa nhà yêu cầu mã token JWT. Hãy đảm bảo bạn đã đăng nhập và lưu JWT token vào 
                <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-850">localStorage.setItem("token", "YOUR_JWT_HERE")</code> 
                hoặc cấu hình cổng phân quyền Spring Security trong backend.
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Search Bar & Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="relative max-w-sm flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tòa nhà hoặc địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
        <div className="text-sm text-slate-500">
          Hiển thị <span className="font-semibold text-slate-700">{filteredBuildings.length}</span> tòa nhà
        </div>
      </div>

      {/* Buildings Table */}
      <BuildingTable
        buildings={filteredBuildings}
        onEdit={(building) => {
          setEditingBuilding(building);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Form Modal */}
      {isFormOpen && (
        <BuildingForm
          building={editingBuilding}
          onSubmit={handleCreateOrUpdate}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBuilding(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
