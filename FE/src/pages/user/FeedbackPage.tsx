import { useState } from "react";
import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { incidentApi } from "@/api/incidentApi";
import { getApiErrorMessage } from "@/utils/apiError";
import type { Incident, IncidentType } from "@/types/domain";

// FeedbackType maps to IncidentType values supported by BE
type FeedbackType = "LOST_TICKET" | "UNPAID" | "WRONG_ZONE" | "FACILITY_ISSUE" | "VEHICLE_DAMAGE";

const feedbackTypes: { label: string; value: FeedbackType }[] = [
  { label: "Mất thẻ xe / mã gửi xe", value: "LOST_TICKET" },
  { label: "Sai phí gửi xe", value: "UNPAID" },
  { label: "Khó tìm xe / gửi sai khu vực", value: "WRONG_ZONE" },
  { label: "Vấn đề an ninh / vệ sinh", value: "FACILITY_ISSUE" },
  { label: "Xe bị hỏng / va chạm", value: "VEHICLE_DAMAGE" }
];

const MAX_MESSAGE = 1000;

export function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>("LOST_TICKET");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<Incident | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => incidentApi.create({
      type: type as IncidentType,
      description: message.trim()
    }),
    onSuccess: (data) => {
      setCreated(data);
      setMessage("");
      setFormError(null);
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, "Không thể gửi phản hồi. Vui lòng thử lại."));
    }
  });

  const submit = () => {
    setFormError(null);
    if (!message.trim()) {
      setFormError("Vui lòng nhập mô tả chi tiết.");
      return;
    }
    if (message.trim().length > MAX_MESSAGE) {
      setFormError(`Mô tả không được vượt quá ${MAX_MESSAGE} ký tự.`);
      return;
    }
    submitMutation.mutate();
  };

  return (
    <>
      <PageHeader title="Gửi phản hồi sự cố" description="Báo mất thẻ, sai phí, khó tìm xe, slot bị chiếm hoặc vấn đề trong bãi." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="grid gap-4">
            <Field label="Loại phản hồi">
              <Select value={type} onChange={(event) => setType(event.target.value as FeedbackType)} disabled={submitMutation.isPending}>
                {feedbackTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
            </Field>

            <Field label={`Mô tả chi tiết (tối đa ${MAX_MESSAGE} ký tự)`}>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                maxLength={MAX_MESSAGE}
                disabled={submitMutation.isPending}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                placeholder="Nhập nội dung cần hỗ trợ..."
              />
              <p className={`mt-1 text-xs text-right ${message.length > MAX_MESSAGE ? 'text-red-500' : 'text-slate-400'}`}>
                {message.length}/{MAX_MESSAGE}
              </p>
            </Field>

            {formError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <Button className="h-12" onClick={submit} disabled={submitMutation.isPending || !message.trim()}>
              <Send size={20} />
              {submitMutation.isPending ? "Đang gửi..." : "Gửi phản hồi"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 content-start">
          <Card>
            <CardHeader title="Kênh hỗ trợ nhanh" />
            <CardContent className="grid gap-2 text-sm">
              <Support icon={<Phone size={16} />} label="Hotline bãi xe" />
              <Support icon={<MessageCircle size={16} />} label="Chat với nhân viên" />
              <Support icon={<Send size={16} />} label="Đến quầy hỗ trợ" />
            </CardContent>
          </Card>

          {created && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="font-semibold text-emerald-700">Đã gửi phản hồi thành công</p>
              <p className="mt-1 text-sm text-emerald-600">
                Mã yêu cầu: <span className="font-mono">#{created.id}</span>
              </p>
              <p className="mt-1 text-xs text-emerald-500">Nhân viên sẽ xử lý trong thời gian sớm nhất.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Support({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-left hover:bg-slate-100">
      {icon}
      {label}
    </button>
  );
}
