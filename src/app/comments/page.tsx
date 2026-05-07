"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

type Comment = Tables<"comments">;
type Task = Tables<"tasks">;

export default function CommentsPage() {
  const supabase = createClient();

  const [comments, setComments] = useState<Comment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [body, setBody] = useState("");
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    const [cRes, tRes] = await Promise.all([
      fetch("/api/comments"),
      fetch("/api/tasks"),
    ]);
    if (cRes.ok) setComments(await cRes.json());
    if (tRes.ok) setTasks(await tRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, task_id: taskId || null }),
    });
    setBody("");
    setTaskId("");
    load();
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditingBody(comment.body);
  }

  async function commitEdit(id: string) {
    const trimmed = editingBody.trim();
    if (trimmed) {
      await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
    }
    setEditingId(null);
    load();
  }

  async function deleteComment(id: string) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    load();
  }

  function taskTitle(tid: string | null) {
    if (!tid) return null;
    const task = tasks.find((t) => t.id === tid);
    return task?.title ?? tid.slice(0, 8) + "…";
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">댓글</h1>

      <form
        onSubmit={addComment}
        className="flex flex-col gap-2 mb-6 p-4 border rounded-lg bg-card"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="댓글 내용을 입력하세요"
          rows={3}
          className="border rounded-md px-3 py-2 text-sm bg-background resize-none"
        />
        <div className="flex gap-2">
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">일감 연결 (선택 사항)</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shrink-0"
          >
            댓글 추가
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          불러오는 중…
        </p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          댓글이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="p-4 border rounded-lg bg-card">
              {taskTitle(comment.task_id) && (
                <p className="text-xs text-muted-foreground mb-1.5">
                  일감: {taskTitle(comment.task_id)}
                </p>
              )}

              {editingId === comment.id ? (
                <textarea
                  ref={editRef}
                  value={editingBody}
                  onChange={(e) => setEditingBody(e.target.value)}
                  onBlur={() => commitEdit(comment.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                      commitEdit(comment.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  rows={3}
                  className="w-full border-b border-primary bg-transparent text-sm outline-none resize-none"
                />
              ) : (
                <p
                  onDoubleClick={() => startEdit(comment)}
                  title="더블클릭하여 수정"
                  className="text-sm whitespace-pre-wrap cursor-text"
                >
                  {comment.body}
                </p>
              )}

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString("ko-KR")}
                </span>
                {comment.author_id === userId && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
