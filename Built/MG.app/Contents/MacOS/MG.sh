#!/usr/bin/env bash

App="$(dirname "$0")/../.."
cd "$App"
App="$PWD"

main() {
  "$App/Contents/MacOS/MG" --url "https://subtlegradient.com" "$@"
}

main "$@" >"$App.log" 2>&1
