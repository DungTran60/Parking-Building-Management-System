import React from "react";
import { Pencil, Trash2, Calendar, Building2, MapPin, Layers } from "lucide-react";
import type { Building } from "@/api/buildingApi";

interface BuildingTableProps {
  buildings: Building[];
  onEdit: (building: Building) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const BuildingTable: React.FC<BuildingTableProps> = ({
  buildings,
  onEdit,
  onDelete,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <span className="ml-3 text-slate-500">Đang tải danh sách tòa nhà...</span>
      </div>
    );
  }

  if (buildings.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
        <Building2 className="h-10 w-10 text-slate-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-800">Không có tòa nhà nào</h3>
        <p className="mt-1 text-xs text-slate-500">Bắt đầu bằng cách thêm một tòa nhà mới.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-55 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Tên tòa nhà</th>
              <th className="px-6 py-4">Địa chỉ</th>
              <th className="px-6 py-4">Số tầng</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {buildings.map((building) => (
              <tr key={building.id} className="hover:bg-slate-50/55 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">#{building.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    {building.buildingName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate max-w-xs">{building.address}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-slate-700">{building.totalFloors} tầng</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {building.createdAt ? new Date(building.createdAt).toLocaleString("vi-VN") : "---"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(building)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => building.id && onDelete(building.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
