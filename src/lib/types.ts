export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "done";

export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  createdAt: string;
  dueDate: string | null;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
};

export const STATUS_LABELS: Record<Status, string> = {
  todo: "할 일",
  "in-progress": "진행 중",
  done: "완료",
};

export const MEMBER_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6",
];
