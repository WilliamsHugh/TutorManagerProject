import type { ReactNode } from "react";

type RequestFieldProps = {
  children: ReactNode;
  className?: string;
  label: string;
  required?: boolean;
};

export function RequestField({
  children,
  className = "",
  label,
  required = false,
}: RequestFieldProps) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-[#0f172a]">
        {label} {required && <span className="text-[#ef4444]">*</span>}
      </label>
      {children}
    </div>
  );
}
