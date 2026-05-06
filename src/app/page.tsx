"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { Status, STATUS_LABELS, Priority, PRIORITY_LABELS } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { MemberAvatar } from "@/components/member-avatar";
import { TaskDialog } from "@/components/task-dialog";
import { Plus, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLS: Status[] = ["todo", "in-progress", "done"];
const STATUS_COLORS: Record<Status, string> = {
  todo: "bg-slate-500",
  "in-progress": "bg-blue-500",
  done: "bg-green-500",
};

export default function DashboardPage() {
  const { tasks, members } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(
      STATUS_COLS.map((s) => [s, tasks.filter((t) => t.status === s).length])
    ) as Record<Status, number>;

    const overdue = tasks.filter(
      (t) =>
        t.status !== "done" &&
        t.dueDate &&
        new Date(t.dueDate) < new Date()
    );

    const byPriority = (["high", "medium", "low"] as Priority[]).map((p) => ({
      priority: p,
      count: tasks.filter((t) => t.priority === p).length,
    }));

    const recentTasks = [...tasks]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);

    return { byStatus, overdue, byPriority, recentTasks };
  }, [tasks]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">대시보드</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            팀 일감 현황을 한눈에 확인합니다
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> 일감 추가
        </Button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {STATUS_COLS.map((s) => (
          <Card key={s}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <span className={cn("h-3 w-3 rounded-full", STATUS_COLORS[s])} />
                <p className="text-sm text-muted-foreground">{STATUS_LABELS[s]}</p>
              </div>
              <p className="text-4xl font-bold mt-2">{stats.byStatus[s]}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tasks.length > 0
                  ? `전체의 ${Math.round((stats.byStatus[s] / tasks.length) * 100)}%`
                  : "일감 없음"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Overdue alert */}
        <Card className={cn(stats.overdue.length > 0 ? "border-red-200 bg-red-50" : "")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  "h-4 w-4",
                  stats.overdue.length > 0 ? "text-red-500" : "text-muted-foreground"
                )}
              />
              기한 초과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">기한 초과 일감 없음</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-red-600">{stats.overdue.length}</p>
                <div className="space-y-1.5">
                  {stats.overdue.slice(0, 3).map((t) => (
                    <div key={t.id} className="text-xs text-red-700 font-medium truncate">
                      · {t.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Priority breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">우선순위별 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.byPriority.map(({ priority, count }) => (
              <div key={priority} className="flex items-center justify-between">
                <PriorityBadge priority={priority} />
                <span className="font-semibold text-sm">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Members summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">팀원별 일감</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.slice(0, 4).map((m) => {
              const count = tasks.filter((t) => t.assigneeId === m.id).length;
              return (
                <div key={m.id} className="flex items-center gap-2">
                  <MemberAvatar member={m} size="sm" />
                  <span className="text-sm flex-1 truncate">{m.name}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              );
            })}
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground">팀원 없음</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent tasks */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">최근 일감</CardTitle>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            전체 보기 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              일감이 없습니다. 첫 일감을 추가해 보세요!
            </p>
          ) : (
            <div className="divide-y">
              {stats.recentTasks.map((task) => {
                const assignee = members.find((m) => m.id === task.assigneeId);
                return (
                  <div key={task.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(task.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      {assignee && <MemberAvatar member={assignee} size="sm" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
