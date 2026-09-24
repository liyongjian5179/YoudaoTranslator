#!/bin/sh

set -eu

root_dir="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
stage_dir="$(mktemp -d "${TMPDIR:-/tmp}/youdao-workflow.XXXXXX")"
output="${root_dir}/YoudaoTranslator.alfredworkflow"

cleanup() {
  rm -rf "$stage_dir"
}

trap cleanup EXIT INT TERM

cd "$root_dir"
npm run build
cp -R dist/. "$stage_dir/"
cp workflow/info.plist workflow/icon.png "$stage_dir/"

rm -f "$output"
(cd "$stage_dir" && zip -qr "$output" .)

printf '%s\n' "$output"
