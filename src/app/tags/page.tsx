"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

type Tag = Tables<"tags">;

const DEFAULT_COLOR = "#6366f1";

export default function TagsPage() {
  const supabase = createClient();

  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState(DEFAULT_COLOR);
  const [userId, setUserId] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/tags");
    if (res.ok) setTags(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    setName("");
    setColor(DEFAULT_COLOR);
    load();
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
  }

  async function commitEdit(id: string) {
    const trimmed = editingName.trim();
    if (trimmed) {
      await fetch(`/api/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, color: editingColor }),
      });
    }
    setEditingId(null);
    load();
  }

  async function deleteTag(id: string) {
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">태그 관리</h1>

      <form onSubmit={addTag} className="flex gap-2 mb-6">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-10 cursor-pointer rounded border p-0.5 bg-background shrink-0"
          title="태그 색상"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="태그 이름"
          className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 shrink-0"
        >
          추가
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">불러오는 중…</p>
      ) : tags.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">태그가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-3 p-3 border rounded-md bg-card"
            >
              <span
                className="h-5 w-5 rounded-full shrink-0 border"
                style={{ backgroundColor: tag.color }}
              />

              {editingId === tag.id ? (
                <>
                  <input
                    type="color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    className="h-7 w-8 cursor-pointer rounded border p-0.5 bg-background shrink-0"
                  />
                  <input
                    ref={editRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => commitEdit(tag.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(tag.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 border-b border-primary bg-transparent text-sm outline-none"
                  />
                </>
              ) : (
                <span
                  onDoubleClick={() => startEdit(tag)}
                  title="더블클릭하여 수정"
                  className="flex-1 text-sm cursor-text"
                >
                  {tag.name}
                </span>
              )}

              {tag.created_by === userId && (
                <>
                  <button
                    onClick={() => startEdit(tag)}
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="text-xs text-destructive hover:underline shrink-0"
                  >
                    삭제
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
