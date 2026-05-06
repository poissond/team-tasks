# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드 (tsc + next build)
npm run lint     # eslint 실행
```

테스트 러너는 설정되어 있지 않습니다.

## 아키텍처

**현재 상태:** 완전 클라이언트 사이드. 모든 데이터는 `localStorage`에만 저장 — 백엔드·인증·네트워크 요청 없음.

**목표 상태** (`docs/` 참고): Next.js API Routes → Supabase (Postgres + Auth) + Google OAuth, Vercel 배포.

### 데이터 흐름

```
AppProvider (src/lib/context.tsx)
  └── 읽기/쓰기: src/lib/store.ts  ──▶  localStorage
        키: "team-tasks:tasks" · "team-tasks:members"
```

`AppProvider`가 `layout.tsx`에서 앱 전체를 감쌉니다. 모든 페이지·컴포넌트는 `useApp()`으로 상태를 읽고 변경합니다. 외부 상태 라이브러리는 없습니다.

### 주요 파일

| 파일 | 역할 |
|------|------|
| `src/lib/types.ts` | `Task`, `Member`, `Priority`, `Status` 타입 및 한국어 레이블 맵의 단일 출처 |
| `src/lib/store.ts` | localStorage 읽기/쓰기 + 최초 실행 시 시드 데이터 삽입 |
| `src/lib/context.tsx` | store를 감싸는 React Context. `tasks`, `members` 및 모든 변경 함수 노출 |
| `src/components/task-dialog.tsx` | 일감 목록 페이지와 칸반 보드 양쪽에서 공유하는 생성/수정 다이얼로그 |
| `src/components/sidebar.tsx` | 클라이언트 컴포넌트 — `usePathname`으로 활성 링크 강조 처리 |

### 페이지

- `/` — 대시보드: 상태별 집계, 기한 초과 경고, 우선순위·팀원 현황, 최근 일감
- `/tasks` — 필터·정렬 가능한 테이블, 인라인 수정/삭제
- `/board` — 칸반 (HTML5 `draggable` 드래그&드롭, 별도 라이브러리 없음)
- `/members` — 팀원 CRUD + 팀원별 일감 현황 카드

### shadcn/ui 버전 주의사항

이 프로젝트는 **shadcn v4 (`@base-ui/react` 기반)** 를 사용합니다 (Radix UI 아님). 일반 shadcn 문서와 다른 점 두 가지:

- `DropdownMenuTrigger`는 `asChild`를 **지원하지 않음** — `className`으로 직접 스타일링.
- `Button`은 `asChild`를 **지원하지 않음** — 일반 `<Link>`로 감싸거나 링크에 직접 스타일 적용.

새 shadcn 컴포넌트 추가: `npx shadcn@latest add <component> --yes`
