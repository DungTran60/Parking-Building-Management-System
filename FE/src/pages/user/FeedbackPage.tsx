import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input } from "@/components/forms/FormField";
import { feedbackApi } from "@/api/feedbackApi";
import type { FeedbackItem } from "@/types/domain";

export function FeedbackPage() {
  const [parkingSessionId, setParkingSessionId] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<FeedbackItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = parkingSessionId.trim() !== "" && rating >= 1 && rating <= 5 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await feedbackApi.create({
        parkingSessionId: Number(parkingSessionId),
        rating,
        comment: comment.trim() || undefined
      });
      setCreated(result);
      setParkingSessionId("");
      setRating(0);
      setComment("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Gửi phản hồi thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Gửi đánh giá dịch vụ"
        description="Chia sẻ trải nghiệm gửi xe của bạn để chúng tôi cải thiện dịch vụ."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="grid gap-5">
            {/* Session ID */}
            <Field label="ID lượt gửi xe">
              <Input
                type="number"
                value={parkingSessionId}
                onChange={(e) => setParkingSessionId(e.target.value)}
                placeholder="Nhập ID lượt gửi xe đã hoàn thành"
              />
            </Field>

            {/* Rating stars */}
            <Field label="Đánh giá">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-2xl focus:outline-none"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      size={28}
                      className={
                        star <= (hovered || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 self-center text-sm text-gray-500">
                    {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][rating]}
                  </span>
                )}
              </div>
            </Field>

            {/* Comment */}
            <Field label="Nhận xét (tùy chọn)">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                placeholder="Chia sẻ thêm trải nghiệm của bạn..."
              />
              <p className="text-right text-xs text-gray-400">{comment.length}/1000</p>
            </Field>

            {/* Error */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              className="h-12"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <Send size={18} />
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </CardContent>
        </Card>

        {/* Success */}
        <div className="grid gap-4 content-start">
          {created && (
            <Card>
              <CardHeader title="Đánh giá đã được gửi" />
              <CardContent className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã phiên gửi xe</span>
                  <span className="font-mono font-medium">{created.ticketCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Đánh giá</span>
                  <span className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= created.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Trạng thái</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    {created.status}
                  </span>
                </div>
                {created.comment && (
                  <p className="mt-1 text-gray-600 italic">"{created.comment}"</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
