"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Kanban, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "대시보드" },
  { href: "/tasks", icon: List, label: "일감 목록" },
  { href: "/board", icon: Kanban, label: "칸반 보드" },
  { href: "/members", icon: Users, label: "팀원 관리" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r bg-card flex flex-col shrink-0">
      <div className="px-5 py-4 border-b">
        <h1 className="font-bold text-lg tracking-tight">팀 일감 관리</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Team Tasks</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-3 border-t text-xs text-muted-foreground">
        데이터는 브라우저에 저장됩니다
      </div>
    </aside>
  );
}
