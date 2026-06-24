import { useState } from "react";
import type { ReactNode } from "react";
import { MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { submitUserFeedback } from "@/services/mockRepository";
import type { FeedbackTicket, FeedbackType } from "@/types/domain";

const feedbackTypes: { label: string; value: FeedbackType }[] = [
  { label: "Mất thẻ xe / mã gửi xe", value: "LOST_TICKET" },
  { label: "Sai phí gửi xe", value: "WRONG_FEE" },
  { label: "Khó tìm xe", value: "FIND_VEHICLE" },
  { label: "Slot bị chiếm", value: "OCCUPIED_SLOT" },
  { label: "Vấn đề an ninh / vệ sinh", value: "FACILITY_ISSUE" }
];

export function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>("LOST_TICKET");
  const [sessionCode, setSessionCode] = useState("QR-260611-1000");
  const [message, setMessage] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [created, setCreated] = useState<FeedbackTicket | null>(null);

  const submit = async () => {
    if (!message.trim() || !contactPhone.trim()) return;
    const ticket = await submitUserFeedback({ type, sessionCode, message, contactPhone });
    setCreated(ticket);
    setMessage("");
  };

  return (
    <>
      <PageHeader title="Gửi phản hồi sự cố" description="Báo mất thẻ, sai phí, khó tìm xe, slot bị chiếm hoặc vấn đề trong bãi." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Loại phản hồi">
                <Select value={type} onChange={(event) => setType(event.target.value as FeedbackType)}>
                  {feedbackTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </Select>
              </Field>
              <Field label="Mã lượt gửi">
                <Input value={sessionCode} onChange={(event) => setSessionCode(event.target.value)} className="font-mono" />
              </Field>
            </div>
            <Field label="Mô tả chi tiết">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                placeholder="Nhập nội dung cần hỗ trợ..."
              />
            </Field>
            <Field label="Số điện thoại liên hệ">
              <Input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="VD: 09xx xxx xxx" />
            </Field>
            <Button className="h-12" onClick={submit} disabled={!message.trim() || !contactPhone.trim()}>
              <Send size={20} />
              Gửi phản hồi
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
              <p className="font-semibold text-emerald-700">Đã gửi phản hồi</p>
              <p className="mt-1 text-sm text-emerald-600">Mã yêu cầu: <span className="font-mono">{created.id.slice(0, 8)}</span></p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Support({ icon, label }: { icon: ReactNode; label: string }) {
  return <button className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-left hover:bg-slate-100">{icon}{label}</button>;
}
