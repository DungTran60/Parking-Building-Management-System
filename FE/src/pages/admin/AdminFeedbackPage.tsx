import { useEffect, useState } from "react";
import { Star, Check, X, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/common/Card";
import { feedbackApi } from "@/api/feedbackApi";
import type { FeedbackItem, FeedbackStatus } from "@/types/domain";

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING:  "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối"
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  PENDING:  "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100  text-green-700",
  REJECTED: "bg-red-100    text-red-700"
};

export function AdminFeedbackPage() {
  const [items, setItems]           = useState<FeedbackItem[]>([]);
  const [filter, setFilter]         = useState<FeedbackStatus | "ALL">("ALL");
  const [loading, setLoading]       = useState(false);
  const [actionId, setActionId]     = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await feedbackApi.getAll(filter === "ALL" ? undefined : filter);
      setItems(data);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleApprove = async (id: number) => {
    setActionId(id);
    try {
      const updated = await feedbackApi.approve(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } finally { setActionId(null); }
  };

  const handleReject = async (id: number) => {
    setActionId(id);
    try {
      const updated = await feedbackApi.reject(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } finally { setActionId(null); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa feedback này?")) return;
    setActionId(id);
    try {
      await feedbackApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally { setActionId(null); }
  };

  return (
    <>
      <PageHeader
        title="Quản lý Feedback"
        description="Xem, duyệt và xóa phản hồi từ khách hàng."
      />

      {/* Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === s
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "ALL" ? "Tất cả" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Không có feedback nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2">Khách hàng</th>
                    <th className="px-3 py-2">Mã vé</th>
                    <th className="px-3 py-2">Đánh giá</th>
                    <th className="px-3 py-2 max-w-xs">Nhận xét</th>
                    <th className="px-3 py-2">Trạng thái</th>
                    <th className="px-3 py-2">Ngày tạo</th>
                    <th className="px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{item.customerName}</td>
                      <td className="px-3 py-2 font-mono text-xs">{item.ticketCode}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate text-gray-600">
                        {item.comment ?? <span className="italic text-gray-400">Không có</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {item.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id)}
                                disabled={actionId === item.id}
                                title="Duyệt"
                                className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                disabled={actionId === item.id}
                                title="Từ chối"
                                className="rounded p-1 text-orange-500 hover:bg-orange-50 disabled:opacity-50"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={actionId === item.id}
                            title="Xóa"
                            className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
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
    </>
  );
}
