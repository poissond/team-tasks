import { Badge } from "@/components/ui/badge";
import { Priority, PRIORITY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
  medium: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  high: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", PRIORITY_STYLES[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
