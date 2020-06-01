#!/bin/bash
kill $(pgrep node) && git pull && source ~/.profile && nvm use 10 && npm run build-start
