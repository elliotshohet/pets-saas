FROM node:24-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci && mkdir -p .next && chown -R node:node /app
ENV NEXT_TELEMETRY_DISABLED=1
USER node
EXPOSE 3017
CMD ["sh", "-c", "npm run db:setup && exec node node_modules/next/dist/bin/next dev --hostname 0.0.0.0 --port 3017"]
