FROM node:24-slim
WORKDIR /app
RUN corepack enable \
  && apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
COPY src ./src
COPY vitest.config.ts tsconfig.json docker-entrypoint.sh ./
RUN pnpm exec prisma generate \
  && pnpm test \
  && sed -i 's/\r$//' docker-entrypoint.sh \
  && chmod +x docker-entrypoint.sh \
  && mkdir -p /app/uploads
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="postgresql://ventasfix:ventasfix@db:5432/ventasfix"
ENV JWT_SECRET="ventasfix-jwt-secret-minimo-32-caracteres"
EXPOSE 3001
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
