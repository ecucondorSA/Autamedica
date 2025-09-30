#!/bin/bash
set -e

cd /root/altamedica-reboot-fresh

# Build packages
pnpm -w build:packages

# Build patients app
DEBUG=webpack:* TURBOPACK=0 NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--trace-deprecation" \
 pnpm --filter @autamedica/patients build > build.log 2>&1

cat build.log