#!/bin/bash
# SessionStart hook: install Agent Reach (web/search/YouTube/RSS access for the agent) in
# Claude Code cloud sessions. Everything lives under $HOME, never inside the repo.
set -euo pipefail

# Cloud sessions only; local machines manage their own tooling.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Pinned to a reviewed commit so third-party code can't change under us. To upgrade, review
# the new commit at https://github.com/Panniantong/agent-reach and update this SHA.
AGENT_REACH_REF="94f06c1969dfc1834001269d79d3ad0972d9dee6"
VENV="$HOME/.agent-reach-venv"

# Agent Reach is a convenience, not a dependency of the site: never fail the session over it.
warn() { echo "session-start: agent-reach setup skipped: $1" >&2; exit 0; }

# 1. CLI in a venv (the PyPI package named agent-reach is NOT this project).
if [ ! -x "$VENV/bin/agent-reach" ]; then
  python3 -m venv "$VENV" || warn "could not create venv"
  # git+https, not the archive/*.zip URL the upstream docs use: the cloud proxy 403s zip downloads.
  "$VENV/bin/pip" install --quiet \
    "git+https://github.com/Panniantong/agent-reach.git@${AGENT_REACH_REF}" \
    || warn "pip install failed"
fi

# 2. mcporter + Exa search config + agent skill (idempotent; skipped once present). The installer
#    writes the skill to ~/.claude/skills when that dir exists, else falls back to ~/.agents/skills.
if ! command -v mcporter >/dev/null 2>&1 \
  || { [ ! -d "$HOME/.claude/skills/agent-reach" ] && [ ! -d "$HOME/.agents/skills/agent-reach" ]; }; then
  PATH="$VENV/bin:$PATH" agent-reach install --env=auto --system >/dev/null 2>&1 \
    || warn "agent-reach install --system failed"
fi

# 3. Put the CLI (and yt-dlp) on PATH for the rest of the session.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  LINE="export PATH=\"$VENV/bin:\$PATH\""
  grep -qxF "$LINE" "$CLAUDE_ENV_FILE" 2>/dev/null || echo "$LINE" >> "$CLAUDE_ENV_FILE"
fi
