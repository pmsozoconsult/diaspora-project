# Test on your PC via SSH tunnel (no codebase download)

The app runs on the VPS bound to **127.0.0.1:3000** only (not exposed to the public internet). You forward that port to your machine.

## 1. On the VPS (already configured)

Dev server listens on `127.0.0.1:3000`:

```bash
cd /root/docker/diaspora-project
npm run dev:tunnel
```

Or use systemd (keeps running after you disconnect):

```bash
sudo cp deploy/diaspora-dev.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now diaspora-dev
sudo systemctl status diaspora-dev
```

## 2. On your Windows PC (PowerShell)

Open a **second** terminal and run (leave it open):

```powershell
ssh -N -L 3000:127.0.0.1:3000 root@178.104.185.90
```

- `-N` = no remote shell, only forwarding  
- Your local port `3000` → VPS `127.0.0.1:3000`

**Windows: `Permission denied` on port 3000?** Another app (or Windows/Hyper-V) is using or reserving that port. Use a different **local** port instead:

```powershell
ssh -N -L 3001:127.0.0.1:3000 root@178.104.185.90
```

Then open http://localhost:3001 (see troubleshooting if login redirects fail).

## 3. In your browser

Open:

- http://localhost:3000 — public site  
- http://localhost:3000/register — client signup  
- http://localhost:3000/login — sign in (`admin@sozo.local` / `ChangeMe123!` for staff)

Set `AUTH_URL` in `.env` to the **exact URL you open in the browser** (e.g. `http://localhost:3001` if you tunnel to port 3001). A mismatch causes `ClientFetchError` / `Failed to fetch` on `/api/auth/session`.

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Connection refused | On VPS: `systemctl status diaspora-dev` or run `npm run dev:tunnel` |
| `Permission denied` / port 3000 on Windows | Run `netstat -ano \| findstr :3000` — stop that PID, or use `-L 3001:127.0.0.1:3000` and http://localhost:3001 |
| Login redirects to wrong port | On VPS set `AUTH_URL` to the URL you use (e.g. `http://localhost:3001`) and `sudo systemctl restart diaspora-dev` |
| SSH asks for password | Use your VPS SSH key or password for `root@178.104.185.90` |
| Page looks unstyled (plain links, no layout) | Stale dev cache: on VPS run `rm -rf /root/docker/diaspora-project/.next && sudo systemctl restart diaspora-dev`, then hard-refresh the browser (Ctrl+Shift+R) |
| `Cannot read properties of undefined (reading 'call')` or 500 on pages | Same fix — do **not** run `npm run build` while `diaspora-dev` is running; stop dev, clear `.next`, restart |
| Unstyled page (footer only, blue links) | Broken dev cache: `sudo systemctl restart diaspora-dev` (service clears `.next` on start). Wait ~15s, hard-refresh (Ctrl+Shift+R). Do not run `npm run build` while dev is active. |

## Stop the VPS dev server

```bash
sudo systemctl stop diaspora-dev
```

Or if you started manually: `Ctrl+C` in that terminal.
