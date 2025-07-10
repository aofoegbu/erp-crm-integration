import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "warning" | "error" | "offline";
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusClasses = {
    online: "status-online",
    warning: "status-warning",
    error: "status-error",
    offline: "bg-slate-500"
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("status-dot", statusClasses[status])}></div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  );
}
