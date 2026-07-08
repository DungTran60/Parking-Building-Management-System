import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

// forwardRef là bắt buộc: react-hook-form (register) truyền ref vào các field.
// Nếu không forward, RHF không đăng ký được input -> value không được đọc, form không submit được.
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, placeholder, type = "text", ...props }, ref) {
    const supportsPlaceholder = ["text", "email", "tel", "search", "url", "number"].includes(type);
    return <input ref={ref} type={type} placeholder={placeholder ?? (supportsPlaceholder ? "Nhập thông tin..." : undefined)} className={cn("h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100", className)} {...props} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn("h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100", className)} {...props} />;
  }
);
