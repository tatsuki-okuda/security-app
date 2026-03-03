#!/bin/zsh
# このプロジェクト用のzshエイリアス設定
# 使用方法: .zshrc に以下を追加してください
#   source /path/to/security-app/root/aliases.sh

# プロジェクトルートを自動検出する関数
_pmc_find_project_root() {
  # Resolve symlinks to avoid missing the repo root when using a symlinked path
  local current_dir
  current_dir="$(pwd -P)"
  while [ "$current_dir" != "/" ]; do
    if [ -f "$current_dir/root/docker-compose.yml" ]; then
      echo "$current_dir"
      return 0
    fi
    current_dir="$(dirname "$current_dir")"
  done
  return 1
}

# Podman Compose コマンドを実行する関数（プロジェクトルートを自動検出）
_pmc() {
  local project_root="$(_pmc_find_project_root)"
  if [ -z "$project_root" ]; then
    echo "Error: Could not find project root (root/docker-compose.yml)" >&2
    return 1
  fi
  local compose_file="$project_root/root/docker-compose.yml"
  if [ ! -f "$compose_file" ]; then
    echo "Error: Compose file not found: $compose_file" >&2
    return 1
  fi
  (cd "$project_root" && podman compose -f "$compose_file" "$@")
}

# コンテナをバックグラウンドで起動し、準備完了ログを待つ
_pmc_up_bg() {
  local project_root="$(_pmc_find_project_root)"
  if [ -z "$project_root" ]; then
    echo "Error: Could not find project root (root/docker-compose.yml)" >&2
    return 1
  fi
  local compose_file="$project_root/root/docker-compose.yml"
  if [ ! -f "$compose_file" ]; then
    echo "Error: Compose file not found: $compose_file" >&2
    return 1
  fi

  (cd "$project_root" && podman compose -f "$compose_file" up -d --build) || return 1

  local timeout="${PMC_UP_TIMEOUT:-120}"
  local pattern="ready - started server|started server on|ready in|server is running"
  local start_time
  start_time="$(date +%s)"

  while true; do
    if (cd "$project_root" && podman compose -f "$compose_file" logs next 2>/dev/null | grep -m1 -Ei "$pattern" >/dev/null); then
      echo "server is running"
      return 0
    fi
    if [ $(( $(date +%s) - start_time )) -ge "$timeout" ]; then
      echo "Warning: timed out waiting for server readiness (${timeout}s)." >&2
      return 1
    fi
    sleep 2
  done
}

# Podman Compose のエイリアス（プロジェクト配下のどこからでも実行可能）
# 既存の同名エイリアスがある場合は無効化して上書きする
unalias pmc pmc-up pmc-up-fg 2>/dev/null
alias pmc='_pmc'

# よく使うコマンドのエイリアス
alias pmc-up='_pmc_up_bg'
alias pmc-up-fg='_pmc up --build'
alias pmc-down='_pmc down'
alias pmc-logs='_pmc logs -f'
alias pmc-ps='_pmc ps'
alias pmc-exec-next='_pmc exec next'
alias pmc-exec-db='_pmc exec db'

# Prisma関連のエイリアス
alias pmc-prisma-migrate='pmc-exec-next npx prisma migrate dev --schema src/prisma/schema.prisma'
alias pmc-prisma-generate='pmc-exec-next npx prisma generate --schema src/prisma/schema.prisma'
alias pmc-prisma-studio='pmc-exec-next npx prisma studio --schema src/prisma/schema.prisma'

# Podman Machine関連のエイリアス
alias pmm='podman machine'
alias pmm-list='podman machine list'
alias pmm-start='podman machine start'
alias pmm-stop='podman machine stop'
alias pmm-restart='podman machine stop && podman machine start'
