# API 엔드포인트

| METHOD | PATH | 설명 | 인증 |
|--------|------|------|------|
| GET | /api/auth/me | 현재 로그인 사용자 정보 반환 | 필요 |
| POST | /api/auth/logout | 세션 종료 및 쿠키 삭제 | 필요 |
| GET | /api/tasks | 전체 일감 목록 조회 | 필요 |
| POST | /api/tasks | 새 일감 생성 (title, assignee_id 수신) | 필요 |
| PATCH | /api/tasks/[id] | 일감 제목·담당자·상태 부분 수정 | 필요 |
| DELETE | /api/tasks/[id] | 일감 삭제 | 필요 |
| GET | /api/users | 담당자 드롭다운용 팀원 목록 조회 | 필요 |
