# Backend image
FROM node:20-alpine AS server-build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

RUN npm ci

COPY server ./server

RUN npm run build -w server

FROM node:20-alpine AS server-runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY server/prisma ./server/prisma

RUN npm ci --omit=dev --workspace server --include-workspace-root

COPY --from=server-build /app/server/dist ./server/dist

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "server"]
