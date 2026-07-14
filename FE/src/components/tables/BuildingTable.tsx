import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Calendar, Building2, MapPin, Layers } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
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
    const columns = useMemo<ColumnDef<Building>[]>(() => [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="font-mono text-xs text-slate-400">#{row.original.id}</span>
        },
        {
            accessorKey: "buildingName",
            header: "Tên tòa nhà",
            cell: ({ row }) => <span className="flex items-center gap-2 font-semibold text-slate-800"><Building2 className="h-4 w-4 text-blue-500" />{row.original.buildingName}</span>
        },
        {
            accessorKey: "address",
            header: "Địa chỉ",
            cell: ({ row }) => <span className="flex items-center gap-2 text-slate-500"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /><span className="max-w-xs truncate">{row.original.address}</span></span>
        },
        {
            accessorKey: "totalFloors",
            header: "Số tầng",
            cell: ({ row }) => <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-emerald-500" /><span className="font-medium text-slate-700">{row.original.totalFloors} tầng</span></span>
        },
        {
            accessorKey: "createdAt",
            header: "Ngày tạo",
            cell: ({ row }) => <span className="flex items-center gap-2 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5 text-slate-400" />{row.original.createdAt ? new Date(row.original.createdAt).toLocaleString("vi-VN") : "---"}</span>
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => <div className="flex gap-2">
                <button onClick={() => onEdit(row.original)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600" title="Chỉnh sửa" aria-label="Chỉnh sửa"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => row.original.id !== undefined && onDelete(row.original.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600" title="Xóa" aria-label="Xóa"><Trash2 className="h-4 w-4" /></button>
            </div>
        }
    ], [onDelete, onEdit]);

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
                <h3 className="mt-2 text-sm font-semibold text-slate-800">Không tìm thấy kết quả</h3>
                <p className="mt-1 text-xs text-slate-500">Vui lòng thử tìm kiếm với từ khóa khác.</p>
            </div>
        );
    }

    return <DataTable data={buildings} columns={columns} showSearch={false} />;
};
