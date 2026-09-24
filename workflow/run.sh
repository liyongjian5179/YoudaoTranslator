#!/bin/sh

cache_dir="${alfred_workflow_cache:-}"

if [ -n "$cache_dir" ] && mkdir -p "$cache_dir" 2>/dev/null; then
  now="$(date +%s)"
  cache_time="$(stat -f %m "$cache_dir/update-cache.json" 2>/dev/null || printf '0')"
  attempt_time="$(stat -f %m "$cache_dir/update-attempt" 2>/dev/null || printf '0')"
  lock_dir="$cache_dir/update-lock"
  lock_time="$(stat -f %m "$lock_dir" 2>/dev/null || printf '0')"

  if [ "$lock_time" -gt 0 ] && [ "$((now - lock_time))" -ge 3600 ]; then
    rmdir "$lock_dir" 2>/dev/null || true
  fi

  if [ "$((now - cache_time))" -ge 86400 ] && [ "$((now - attempt_time))" -ge 3600 ]; then
    if mkdir "$lock_dir" 2>/dev/null; then
      touch "$cache_dir/update-attempt"
      (
        trap 'rmdir "$lock_dir" 2>/dev/null || true' 0
        ./runtime/txiki ./index.js --background-update >/dev/null 2>&1
      ) </dev/null >/dev/null 2>&1 &
    fi
  fi
fi

exec ./runtime/txiki ./index.js "$1"
