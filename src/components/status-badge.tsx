import { Badge } from "@/components/ui/badge";
import { Status, STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Status, string> = {
  todo: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  done: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
