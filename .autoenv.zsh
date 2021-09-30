#!/usr/bin/zsh

if [[ $autoenv_event == 'enter' ]]; then
  autoenv_source_parent
  scc -w -M package-lock.json -M .svg -M tailwind.config.js | ccze -A
fi
