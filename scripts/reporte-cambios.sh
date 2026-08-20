#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

echo "# Reporte de cambios del repositorio"
echo

echo "## Últimos commits"
GIT_PAGER=cat git --no-pager log --pretty=format:'- %h | %ad | %an | %s' --date=short -n 10
echo

echo "## Resumen por autor"
GIT_PAGER=cat git --no-pager shortlog -sne
echo

echo "## Archivos tocados en los últimos 10 commits"
GIT_PAGER=cat git --no-pager diff --name-only HEAD~10..HEAD 2>/dev/null || GIT_PAGER=cat git --no-pager diff --name-only HEAD

echo

echo "## Estado actual"
GIT_PAGER=cat git --no-pager status --short
