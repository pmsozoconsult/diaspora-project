# Security audit checklist

Last verified: 2026-06-05 (Phases 0–6)

| # | Issue | Status | Verify |
|---|-------|--------|--------|
| A1 | Postgres public on 5433 | ✅ | Only `127.0.0.1:5432` |
| A2 | Weak DB password | ✅ | Rotated — `deploy/CREDENTIALS.local.txt` |
| A3 | Vercel → remote DB | ✅ | Deployment removed by user |
| A4 | No firewall | ✅ | UFW: 22, 80, 443 |
| A5 | Server actions trust client IDs | ✅ | Session via `requireAction*()` |
| A6 | POA chat role spoofing | ✅ | Role from session |
| A7 | Default admin password | ✅ | Rotated |
| A8 | Weak AUTH_SECRET | ✅ | `.env.production` |
| A9 | AUTH_URL mismatch | ✅ | `https://diaspora.sozoconsult.com` |
| A10 | Dev mode as production | ✅ | `diaspora-prod` → `next start` :3001 |
| A11 | No HTTPS | ✅ | Let's Encrypt cert to 2026-09-03 |
| A12 | Login rate limiting | ✅ | nginx `limit_req` + fail2ban |
| A13 | Mock payments | 🔵 | Until Stripe configured |
| A14 | Chat upload validation | ✅ | Type + 10 MB |
| A15 | DB backups | ✅ | Daily cron 03:00 |
| A16 | Security headers | ✅ | nginx + Next.js |
| A17 | SSH password brute force | ✅ | Key-only SSH + fail2ban sshd |
| A18 | Bot registration/login | ✅ | Honeypot fields |
| A19 | Certbot renewal | ✅ | systemd uses `/usr/local/bin/certbot` |
| A20 | Shared VPS blast radius | ⚠️ | Odoo/Weblate still on same host |

## Production URL

https://diaspora.sozoconsult.com

## DNS

Resolvers (Google/Cloudflare): `178.104.185.90` ✅  
If you still see the old site, flush local DNS cache — propagation can take up to 24h.

## Phase 6 applied on server

- `fail2ban` — sshd + nginx rate-limit jails
- SSH — password auth disabled (key only)
- Certbot — pip 5.6.0, auto-renew fixed
- Honeypot — login + register forms

## Not implemented (optional later)

- **MFA** for staff/admin
- **Cloudflare** WAF/DDoS (add in DNS if desired)
- **Stripe** real payments
- **Dedicated VPS** for diaspora isolation

Legend: ✅ Fixed · ⚠️ Partial · ❌ Open · 🔵 Accepted risk
