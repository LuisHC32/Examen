#!/bin/sh
set -e
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
exec pnpm start
