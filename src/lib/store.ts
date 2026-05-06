import { Member, Task, MEMBER_COLORS } from "./types";
import { nanoid } from "nanoid";

const TASKS_KEY = "team-tasks:tasks";
const MEMBERS_KEY = "team-tasks:members";

const DEFAULT_MEMBERS: Member[] = [
  { id: nanoid(), name: "김민준", color: MEMBER_COLORS[0] },
  { id: nanoid(), name: "이서연", color: MEMBER_COLORS[1] },
  { id: nanoid(), name: "박지훈", color: MEMBER_COLORS[2] },
];

function seedTasks(members: Member[]): Task[] {
  return [
    {
      id: nanoid(),
      title: "Next.js 15 업그레이드",
      description: "프로젝트를 Next.js 15로 마이그레이션합니다.",
      status: "done",
      priority: "high",
      assigneeId: members[0]?.id ?? null,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      dueDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    },
    {
      id: nanoid(),
      title: "대시보드 UI 디자인",
      description: "팀 대시보드 화면 와이어프레임 및 UI 구현",
      status: "in-progress",
      priority: "medium",
      assigneeId: members[1]?.id ?? null,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    },
    {
      id: nanoid(),
      title: "API 문서 작성",
      description: "REST API 엔드포인트 문서화",
      status: "todo",
      priority: "low",
      assigneeId: members[2]?.id ?? null,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
    {
      id: nanoid(),
      title: "버그 수정: 로그인 리다이렉트",
      description: "로그인 후 이전 페이지로 리다이렉트되지 않는 문제 수정",
      status: "in-progress",
      priority: "high",
      assigneeId: members[0]?.id ?? null,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    },
    {
      id: nanoid(),
      title: "단위 테스트 작성",
      description: "주요 유틸리티 함수에 대한 단위 테스트 추가",
      status: "todo",
      priority: "medium",
      assigneeId: null,
      createdAt: new Date().toISOString(),
      dueDate: null,
    },
  ];
}

export function getMembers(): Member[] {
  if (typeof window === "undefined") return DEFAULT_MEMBERS;
  const raw = localStorage.getItem(MEMBERS_KEY);
  if (!raw) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(DEFAULT_MEMBERS));
    return DEFAULT_MEMBERS;
  }
  return JSON.parse(raw);
}

export function saveMembers(members: Member[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) {
    const members = getMembers();
    const seed = seedTasks(members);
    localStorage.setItem(TASKS_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export { nanoid };
