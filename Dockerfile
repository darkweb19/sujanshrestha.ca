FROM node:24.19.0-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@11.25.0
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN printf 'allowBuilds:\n  esbuild: true\n  sharp: true\n  unrs-resolver: true\n' > pnpm-workspace.yaml \
    && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app /app
# Mount a Railway volume here and ensure uid 1000 can write it before starting.
RUN mkdir -p /app/data && chown node:node /app/data
USER node
ENV SQLITE_PATH=/app/data/portfolio.sqlite
ENV SKILLS_SOURCE_DIR=/app/data/skills-source
ENV SKILLS_SYNC_REPORT=/app/data/skills-sync-report.json
EXPOSE 3000
CMD ["pnpm", "exec", "tsx", "scripts/db-start.ts"]
