"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/lib/context";
import { MemberAvatar } from "@/components/member-avatar";
import { StatusBadge } from "@/components/status-badge";
import { Status, STATUS_LABELS } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MembersPage() {
  const { members, tasks, addMember, updateMember, deleteMember } = useApp();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    addMember(name);
    setNewName("");
    toast.success(`${name}님이 추가되었습니다.`);
  }

  function startEdit(id: string, name: string) {
    setEditId(id);
    setEditName(name);
  }

  function commitEdit(id: string) {
    const name = editName.trim();
    if (!name) return;
    updateMember(id, name);
    setEditId(null);
    toast.success("이름이 수정되었습니다.");
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`"${name}"님을 삭제하시겠습니까? 해당 담당자의 일감 배정이 해제됩니다.`)) {
      deleteMember(id);
      toast.success("팀원이 삭제되었습니다.");
    }
  }

  const STATUS_COLS: Status[] = ["todo", "in-progress", "done"];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">팀원 관리</h2>
        <p className="text-sm text-muted-foreground mt-0.5">팀원을 추가하고 일감 현황을 확인합니다</p>
      </div>

      {/* Add member */}
      <form onSubmit={handleAdd} className="flex gap-2 max-w-sm">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="팀원 이름 입력..."
        />
        <Button type="submit" disabled={!newName.trim()}>
          <Plus className="h-4 w-4 mr-1" /> 추가
        </Button>
      </form>

      {/* Member cards */}
      {members.length === 0 && (
        <p className="text-muted-foreground text-sm">등록된 팀원이 없습니다.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
          return (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <MemberAvatar member={member} size="md" />
                  <div className="flex-1 min-w-0">
                    {editId === member.id ? (
                      <div className="flex gap-1.5">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-7 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(member.id);
                            if (e.key === "Escape") setEditId(null);
                          }}
                          autoFocus
                        />
                        <Button
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => commitEdit(member.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={() => setEditId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate">{member.name}</p>
                        <div className="flex gap-0.5 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startEdit(member.id, member.name)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(member.id, member.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      담당 일감 {memberTasks.length}개
                    </p>
                  </div>
                </div>

                {/* Task breakdown */}
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_COLS.map((s) => {
                    const count = memberTasks.filter((t) => t.status === s).length;
                    return (
                      <div
                        key={s}
                        className={cn(
                          "rounded-md p-2 text-center border",
                          s === "todo" && "bg-slate-50",
                          s === "in-progress" && "bg-blue-50 border-blue-100",
                          s === "done" && "bg-green-50 border-green-100"
                        )}
                      >
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{STATUS_LABELS[s]}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Recent tasks */}
                {memberTasks.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      최근 일감
                    </p>
                    {memberTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">{t.title}</span>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
