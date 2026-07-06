import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
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

export function Input({ className, placeholder, type = "text", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const supportsPlaceholder = ["text", "email", "tel", "search", "url", "number"].includes(type);
  return <input type={type} placeholder={placeholder ?? (supportsPlaceholder ? "Nhập thông tin..." : undefined)} className={cn("h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100", className)} {...props} />;
}
