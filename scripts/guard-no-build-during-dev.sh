#!/bin/sh
# Refuse production build while diaspora-dev is running (mixes .next and breaks dev).
if systemctl is-active --quiet diaspora-dev 2>/dev/null; then
  echo "ERROR: diaspora-dev is running. Stop it first:"
  echo "  sudo systemctl stop diaspora-dev"
  echo "Then run: npm run build"
  echo "Or use dev only: sudo systemctl restart diaspora-dev"
  exit 1
fi
# After a manual build, never start dev on that .next — restart diaspora-dev (it clears .next).
exit 0
