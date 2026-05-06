"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Task, Member } from "./types";
import { getTasks, saveTasks, getMembers, saveMembers, nanoid } from "./store";
import { MEMBER_COLORS } from "./types";

interface AppContextValue {
  tasks: Task[];
  members: Member[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  addMember: (name: string) => void;
  updateMember: (id: string, name: string) => void;
  deleteMember: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    setMembers(getMembers());
    setTasks(getTasks());
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => {
      const next = [
        ...prev,
        { ...task, id: nanoid(), createdAt: new Date().toISOString() },
      ];
      saveTasks(next);
      return next;
    });
  }, []);

  const updateTask = useCallback(
    (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
        saveTasks(next);
        return next;
      });
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTasks(next);
      return next;
    });
  }, []);

  const addMember = useCallback((name: string) => {
    setMembers((prev) => {
      const color = MEMBER_COLORS[prev.length % MEMBER_COLORS.length];
      const next = [...prev, { id: nanoid(), name, color }];
      saveMembers(next);
      return next;
    });
  }, []);

  const updateMember = useCallback((id: string, name: string) => {
    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, name } : m));
      saveMembers(next);
      return next;
    });
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMembers(next);
      return next;
    });
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.assigneeId === id ? { ...t, assigneeId: null } : t
      );
      saveTasks(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks,
        members,
        addTask,
        updateTask,
        deleteTask,
        addMember,
        updateMember,
        deleteMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
