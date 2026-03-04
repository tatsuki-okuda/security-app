#!/bin/zsh
# このプロジェクト用のDocker用zshエイリアス設定
# 使用方法: .zshrc に以下を追加してください
#   source /path/to/security-app/root/docker-aliases.sh

# プロジェクトルートを自動検出する関数
_dc_find_project_root() {
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

# Docker Compose コマンドを実行する関数（プロジェクトルートを自動検出）
_dc() {
  local project_root="$(_dc_find_project_root)"
  if [ -z "$project_root" ]; then
    echo "Error: Could not find project root (root/docker-compose.yml)" >&2
    return 1
  fi
  local compose_file="$project_root/root/docker-compose.yml"
  if [ ! -f "$compose_file" ]; then
    echo "Error: Compose file not found: $compose_file" >&2
    return 1
  fi
  (cd "$project_root" && docker compose -f "$compose_file" "$@")
}

# コンテナをバックグラウンドで起動し、準備完了ログを待つ
_dc_up_bg() {
  local project_root="$(_dc_find_project_root)"
  if [ -z "$project_root" ]; then
    echo "Error: Could not find project root (root/docker-compose.yml)" >&2
    return 1
  fi
  local compose_file="$project_root/root/docker-compose.yml"
  if [ ! -f "$compose_file" ]; then
    echo "Error: Compose file not found: $compose_file" >&2
    return 1
  fi

  (cd "$project_root" && docker compose -f "$compose_file" up -d --build) || return 1

  local timeout="${DC_UP_TIMEOUT:-120}"
  local pattern="ready - started server|started server on|ready in|server is running"
  local start_time
  start_time="$(date +%s)"

  while true; do
    if (cd "$project_root" && docker compose -f "$compose_file" logs next 2>/dev/null | grep -m1 -Ei "$pattern" >/dev/null); then
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

# Docker Compose のエイリアス（プロジェクト配下のどこからでも実行可能）
# 既存の同名エイリアスがある場合は無効化して上書きする
unalias dc dc-up dc-up-fg 2>/dev/null
alias dc='_dc'

# よく使うコマンドのエイリアス
alias dc-up='_dc_up_bg'
alias dc-up-fg='_dc up --build'
alias dc-down='_dc down'
alias dc-logs='_dc logs -f'
alias dc-ps='_dc ps'
alias dc-exec-next='_dc exec next'
alias dc-exec-db='_dc exec db'
alias dc-rebuild='_dc build --no-cache'

# Prisma関連のエイリアス
alias dc-prisma-migrate='dc-exec-next npx prisma migrate dev --schema src/prisma/schema.prisma'
alias dc-prisma-generate='dc-exec-next npx prisma generate --schema src/prisma/schema.prisma'
alias dc-prisma-studio='dc-exec-next npx prisma studio --schema src/prisma/schema.prisma'

# Docker関連のエイリアス
alias d='docker'
alias d-ps='docker ps'
