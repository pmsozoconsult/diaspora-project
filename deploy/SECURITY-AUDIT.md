# Security audit checklist (post full-VPS migration)

Last verified: 2026-06-05

| # | Issue | Status | Verify |
|---|-------|--------|--------|
| A1 | Postgres public on 5433 | ✅ | `ss -tlnp \| grep 5433` empty; only `127.0.0.1:5432` |
| A2 | Weak DB password | ✅ | Rotated; see `deploy/CREDENTIALS.local.txt` |
| A3 | Vercel → remote DB | ⚠️ | Disable Vercel project manually in dashboard |
| A4 | No firewall | ✅ | `ufw status` active (22, 80, 443) |
| A5 | Server actions trust client IDs | ✅ | Actions use `requireAction*()` session |
| A6 | POA chat role spoofing | ✅ | Role read from session only |
| A7 | Default admin password | ✅ | Rotated from `ChangeMe123!` |
| A8 | Weak AUTH_SECRET | ✅ | New secret in `.env.production` |
| A9 | AUTH_URL mismatch | ⚠️ | Set to `https://diaspora.sozoconsult.com` — needs DNS + TLS |
| A10 | Dev mode as production | ✅ | `diaspora-prod` runs `next start` on 3001 |
| A11 | No HTTPS | ❌ | DNS points to wrong IP; certbot broken on host |
| A12 | Login rate limiting | ✅ | nginx `limit_req` on /login, /register, /api/auth |
| A13 | Mock payments | 🔵 | Accepted until Stripe |
| A14 | Chat upload validation | ✅ | PDF/images only, 10 MB max |
| A15 | DB backups | ✅ | Daily cron `deploy/backup-diaspora.sh` |
| A16 | Security headers | ✅ | Next.js + nginx headers |

## Remaining manual steps

1. **DNS:** Point `diaspora.sozoconsult.com` A record to `178.104.185.90` (currently `46.30.215.185`).
2. **HTTPS:** After DNS propagates, fix certbot on the host and run:
   `sudo certbot --nginx -d diaspora.sozoconsult.com`
3. **Vercel:** Pause or delete the `diaspora-project` Vercel deployment.

Legend: ✅ Fixed · ⚠️ Partial · ❌ Open · 🔵 Accepted risk
