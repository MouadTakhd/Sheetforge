#!/usr/bin/env bash
#
# CORS smoke test: simulate the prod frontend talking to the prod backend.
#
# What it does: replays the exact CORS handshake a browser performs — a
# preflight OPTIONS request (for non-simple requests like Bearer-auth'd
# JSON/PATCH calls) followed by the real request — and checks the
# Access-Control-* response headers the way a browser would.
#
# A green run means real browsers at $ORIGIN will be allowed to call the API.
#
# Usage:
#   ./scripts/cors-test.sh                         # uses defaults below
#   ORIGIN=https://app.sheetforge.app ./scripts/cors-test.sh
#   ./scripts/cors-test.sh https://my-front.vercel.app https://api.example.com
#
set -uo pipefail

# ---- config (override via env or positional args) --------------------------
ORIGIN="${1:-${ORIGIN:-https://your-sheetforge-app.vercel.app}}"
BACKEND="${2:-${BACKEND:-https://sheetforge-backend-z4vy.onrender.com}}"
BACKEND="${BACKEND%/}"  # strip trailing slash

pass=0; fail=0; warn=0
green=$'\e[32m'; red=$'\e[31m'; yellow=$'\e[33m'; dim=$'\e[2m'; bold=$'\e[1m'; reset=$'\e[0m'

ok()   { echo "  ${green}✔${reset} $1"; pass=$((pass+1)); }
no()   { echo "  ${red}✘${reset} $1"; fail=$((fail+1)); }
note() { echo "  ${yellow}!${reset} $1"; warn=$((warn+1)); }

echo "${bold}CORS test${reset}"
echo "  Origin : $ORIGIN"
echo "  Backend: $BACKEND"
echo

# Header lookup that is case-insensitive and trims CR/whitespace.
hval() { # hval <headers-file> <header-name>
  grep -i "^$2:" "$1" | head -n1 | cut -d: -f2- | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

# --------------------------------------------------------------------------
# 1) PREFLIGHT — protected endpoint (GET /me with Authorization header).
#    This is the case that actually breaks: a Bearer header makes the
#    request "non-simple", so the browser sends OPTIONS first.
# --------------------------------------------------------------------------
echo "${bold}[1] Preflight: OPTIONS /me  (Authorization + GET)${reset}"
pf=$(mktemp)
code=$(curl -s -o /dev/null -D "$pf" -w '%{http_code}' -X OPTIONS "$BACKEND/me" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type")

acao=$(hval "$pf" "Access-Control-Allow-Origin")
acam=$(hval "$pf" "Access-Control-Allow-Methods")
acah=$(hval "$pf" "Access-Control-Allow-Headers")
acac=$(hval "$pf" "Access-Control-Allow-Credentials")

echo "  ${dim}HTTP $code${reset}"
[ "$code" -ge 200 ] && [ "$code" -lt 400 ] && ok "preflight status $code" || no "preflight status $code (browser needs 2xx/3xx)"

if [ "$acao" = "$ORIGIN" ]; then ok "Allow-Origin echoes our origin"
elif [ "$acao" = "*" ];  then note "Allow-Origin is '*' (works, but cannot be combined with credentials)"
elif [ -z "$acao" ];     then no "no Access-Control-Allow-Origin header — CORS will be blocked"
else                          no "Allow-Origin is '$acao', not '$ORIGIN'"; fi

echo "$acam" | grep -qi "GET\|\*" && ok "Allow-Methods permits GET (${dim}$acam${reset})" || no "Allow-Methods missing GET (got '$acam')"
echo "$acah" | grep -qi "authorization\|\*" && ok "Allow-Headers permits Authorization (${dim}$acah${reset})" || no "Allow-Headers missing 'authorization' (got '$acah') — Bearer token will be stripped"

if [ "$acac" = "true" ] && [ "$acao" = "*" ]; then
  no "Allow-Credentials:true WITH Allow-Origin:* — browsers reject this combo"
elif [ -n "$acac" ]; then
  note "Allow-Credentials: $acac (only needed if you use cookies; this app uses Bearer tokens)"
fi
rm -f "$pf"
echo

# --------------------------------------------------------------------------
# 2) PREFLIGHT — login endpoint (POST /login_check with JSON body).
# --------------------------------------------------------------------------
echo "${bold}[2] Preflight: OPTIONS /login_check  (POST + JSON)${reset}"
pf=$(mktemp)
code=$(curl -s -o /dev/null -D "$pf" -w '%{http_code}' -X OPTIONS "$BACKEND/login_check" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type")
acao=$(hval "$pf" "Access-Control-Allow-Origin")
acam=$(hval "$pf" "Access-Control-Allow-Methods")
echo "  ${dim}HTTP $code${reset}"
[ "$code" -ge 200 ] && [ "$code" -lt 400 ] && ok "preflight status $code" || no "preflight status $code"
{ [ "$acao" = "$ORIGIN" ] || [ "$acao" = "*" ]; } && ok "Allow-Origin ok ($acao)" || no "Allow-Origin '$acao' will block login"
echo "$acam" | grep -qi "POST\|\*" && ok "Allow-Methods permits POST" || no "Allow-Methods missing POST (got '$acam')"
rm -f "$pf"
echo

# --------------------------------------------------------------------------
# 3) ACTUAL request — confirm the real response also carries Allow-Origin.
#    (Preflight passing but the real response lacking the header is a
#    classic misconfig.) We expect 401 from /me unauthenticated — that's
#    fine; we only care that the CORS header rides along.
# --------------------------------------------------------------------------
echo "${bold}[3] Actual request: GET /me  (no token, expect 401 + CORS header)${reset}"
pf=$(mktemp)
code=$(curl -s -o /dev/null -D "$pf" -w '%{http_code}' "$BACKEND/me" -H "Origin: $ORIGIN")
acao=$(hval "$pf" "Access-Control-Allow-Origin")
echo "  ${dim}HTTP $code${reset}"
{ [ "$acao" = "$ORIGIN" ] || [ "$acao" = "*" ]; } \
  && ok "actual response carries Allow-Origin ($acao)" \
  || no "actual response has no/usable Allow-Origin ('$acao') — preflight-only CORS is broken"
rm -f "$pf"
echo

# ---- summary ---------------------------------------------------------------
echo "${bold}Summary:${reset} ${green}$pass passed${reset}, ${red}$fail failed${reset}, ${yellow}$warn warnings${reset}"
if [ "$fail" -eq 0 ]; then
  echo "${green}${bold}CORS looks healthy — $ORIGIN can call the backend.${reset}"; exit 0
else
  echo "${red}${bold}CORS is misconfigured for $ORIGIN.${reset} Fix the backend (nelmio_cors / Render) to allow that origin + Authorization header."; exit 1
fi
