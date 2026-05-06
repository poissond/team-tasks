"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

type Task = Tables<"tasks">;

export default function Page() {
  const router = useRouter();
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    load();
  }

  async function toggleTask(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: task.status === "done" ? "todo" : "done" }),
    });
    load();
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  async function commitEdit(id: string) {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
    }
    setEditingId(null);
    load();
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    load();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">일감 목록</h1>
        <div className="flex items-center gap-3">
          {email && (
            <span className="text-sm text-muted-foreground">{email}</span>
          )}
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 일감 제목"
          className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          추가
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">불러오는 중…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">일감이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-3 border rounded-md bg-card"
            >
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => toggleTask(task)}
                className="h-4 w-4 cursor-pointer shrink-0"
              />

              {editingId === task.id ? (
                <input
                  ref={editRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => commitEdit(task.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(task.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 border-b border-primary bg-transparent text-sm outline-none"
                />
              ) : (
                <span
                  onDoubleClick={() => startEdit(task)}
                  title="더블클릭하여 수정"
                  className={`flex-1 text-sm cursor-text ${
                    task.status === "done"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {task.title}
                </span>
              )}

              <button
                onClick={() => startEdit(task)}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                수정
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-xs text-destructive hover:underline shrink-0"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
