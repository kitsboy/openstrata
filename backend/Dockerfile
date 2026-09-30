# Phase 3 API container — Fastify + Node 22, runs the ledger/rosa/ziggy services.
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first for layer caching.
COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/src ./src
COPY --from=build /app/scripts ./scripts

EXPOSE 8080
# `tsx` daemon is a scaffold convenience; replace with a compiled entry in topo.
CMD ["npm", "run", "start"]