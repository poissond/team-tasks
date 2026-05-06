"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useApp } from "@/lib/context";
import { Task, Status, STATUS_LABELS } from "@/lib/types";
import { PriorityBadge } from "@/components/priority-badge";
import { MemberAvatar } from "@/components/member-avatar";
import { TaskDialog } from "@/components/task-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLUMNS: Status[] = ["todo", "in-progress", "done"];

const COLUMN_STYLES: Record<Status, { header: string; dot: string }> = {
  todo: { header: "bg-slate-50 border-slate-200", dot: "bg-slate-400" },
  "in-progress": { header: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  done: { header: "bg-green-50 border-green-200", dot: "bg-green-500" },
};

export default function BoardPage() {
  const { tasks, members, updateTask, deleteTask } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>("todo");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);

  function handleNew(status: Status) {
    setEditTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  }

  function handleEdit(task: Task) {
    setEditTask(task);
    setDialogOpen(true);
  }

  function handleDelete(task: Task) {
    if (confirm(`"${task.title}" 일감을 삭제하시겠습니까?`)) {
      deleteTask(task.id);
      toast.success("일감이 삭제되었습니다.");
    }
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    setDragId(taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, status: Status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(status);
  }

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault();
    if (dragId) {
      const task = tasks.find((t) => t.id === dragId);
      if (task && task.status !== status) {
        updateTask(dragId, { status });
        toast.success(`"${task.title}"을(를) ${STATUS_LABELS[status]}로 이동했습니다.`);
      }
    }
    setDragId(null);
    setDragOver(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setDragOver(null);
  }

  return (
    <div className="p-6 h-full flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">칸반 보드</h2>
          <p className="text-sm text-muted-foreground mt-0.5">드래그로 상태를 변경할 수 있습니다</p>
        </div>
        <Button onClick={() => handleNew("todo")} size="sm">
          <Plus className="h-4 w-4 mr-1" /> 일감 추가
        </Button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          const styles = COLUMN_STYLES[col];
          return (
            <div
              key={col}
              className={cn(
                "flex flex-col rounded-lg border flex-1 min-w-0 transition-colors",
                dragOver === col ? "ring-2 ring-primary ring-offset-2" : ""
              )}
              onDragOver={(e) => handleDragOver(e, col)}
              onDrop={(e) => handleDrop(e, col)}
              onDragLeave={() => setDragOver(null)}
            >
              {/* Column header */}
              <div className={cn("px-4 py-3 border-b rounded-t-lg flex items-center justify-between", styles.header)}>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", styles.dot)} />
                  <span className="font-semibold text-sm">{STATUS_LABELS[col]}</span>
                  <span className="text-xs text-muted-foreground bg-background/80 rounded-full px-2 py-0.5 border">
                    {colTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleNew(col)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {colTasks.map((task) => {
                  const assignee = members.find((m) => m.id === task.assigneeId);
                  const isOverdue =
                    task.dueDate &&
                    task.status !== "done" &&
                    new Date(task.dueDate) < new Date();

                  return (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "cursor-grab active:cursor-grabbing select-none hover:shadow-md transition-shadow",
                        dragId === task.id && "opacity-40"
                      )}
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                            <GripVertical className="h-3.5 w-3.5 shrink-0" />
                          </div>
                          <p className="font-medium text-sm leading-snug flex-1">{task.title}</p>
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEdit(task)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(task)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pb-3 pt-2 space-y-2">
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <PriorityBadge priority={task.priority} />
                          {task.dueDate && (
                            <span
                              className={cn(
                                "text-xs",
                                isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"
                              )}
                            >
                              {task.dueDate}
                            </span>
                          )}
                        </div>
                        {assignee && (
                          <div className="flex items-center gap-1.5">
                            <MemberAvatar member={assignee} size="sm" />
                            <span className="text-xs text-muted-foreground">{assignee.name}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                    <p>일감 없음</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => handleNew(col)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> 추가
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditTask(null);
        }}
        task={editTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
