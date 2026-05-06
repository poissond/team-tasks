"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/context";
import { Task, Priority, Status, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import { MemberAvatar } from "@/components/member-avatar";
import { TaskDialog } from "@/components/task-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SortKey = "createdAt" | "dueDate" | "priority" | "status";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_ORDER: Record<Status, number> = { "in-progress": 0, todo: 1, done: 2 };

export default function TasksPage() {
  const { tasks, members, deleteTask } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        if (assigneeFilter !== "all" && t.assigneeId !== assigneeFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "createdAt")
          cmp = a.createdAt.localeCompare(b.createdAt);
        else if (sortKey === "dueDate")
          cmp = (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
        else if (sortKey === "priority")
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        else if (sortKey === "status")
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, sortKey, sortDir]);

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

  function handleNew() {
    setEditTask(null);
    setDialogOpen(true);
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? null : sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 ml-1 inline" />
      : <ChevronDown className="h-3 w-3 ml-1 inline" />;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">일감 목록</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            전체 {tasks.length}개 · 표시 {filtered.length}개
          </p>
        </div>
        <Button onClick={handleNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> 일감 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 w-48"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="우선순위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 우선순위</SelectItem>
            {(Object.entries(PRIORITY_LABELS) as [Priority, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="담당자" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 담당자</SelectItem>
            <SelectItem value="none">미배정</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-full">
                제목
              </th>
              <th
                className="text-left px-4 py-3 font-medium whitespace-nowrap cursor-pointer hover:text-foreground text-muted-foreground"
                onClick={() => toggleSort("status")}
              >
                상태<SortIcon k="status" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium whitespace-nowrap cursor-pointer hover:text-foreground text-muted-foreground"
                onClick={() => toggleSort("priority")}
              >
                우선순위<SortIcon k="priority" />
              </th>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap text-muted-foreground">
                담당자
              </th>
              <th
                className="text-left px-4 py-3 font-medium whitespace-nowrap cursor-pointer hover:text-foreground text-muted-foreground"
                onClick={() => toggleSort("dueDate")}
              >
                마감일<SortIcon k="dueDate" />
              </th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  일감이 없습니다.
                </td>
              </tr>
            )}
            {filtered.map((task) => {
              const assignee = members.find((m) => m.id === task.assigneeId);
              const isOverdue =
                task.dueDate &&
                task.status !== "done" &&
                new Date(task.dueDate) < new Date();
              return (
                <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <MemberAvatar member={assignee} />
                        <span>{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">미배정</span>
                    )}
                  </td>
                  <td className={cn("px-4 py-3 text-sm whitespace-nowrap", isOverdue && "text-red-600 font-medium")}>
                    {task.dueDate ?? <span className="text-muted-foreground text-xs">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-7 w-7 hover:bg-accent transition-colors">
                        <span className="sr-only">메뉴</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                          <circle cx="7.5" cy="2.5" r="1.25" />
                          <circle cx="7.5" cy="7.5" r="1.25" />
                          <circle cx="7.5" cy="12.5" r="1.25" />
                        </svg>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(task)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(task)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditTask(null);
        }}
        task={editTask}
      />
    </div>
  );
}
