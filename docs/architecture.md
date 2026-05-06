# 아키텍처

```
[ 브라우저 ]
     │  HTTPS
     ▼
[ Next.js on Vercel ]  ──API Routes──▶  [ Supabase (Postgres + Auth) ]
     │  OAuth redirect                        ▲
     └──────────────────▶  [ Google OAuth ]───┘
```
