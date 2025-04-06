import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, fullPage = false }) {
  return (
    <div className={cn(
      "flex items-center justify-center",
      fullPage ? "fixed inset-0" : "w-full h-full",
      className
    )}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
    </div>
  );
} 