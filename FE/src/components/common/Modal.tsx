import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <Button variant="ghost" className="h-10 w-10 px-0" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </Button>
        </div>
        <div className="max-h-[78vh] overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
