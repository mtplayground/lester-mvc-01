# Frontend image
FROM node:20-alpine AS client-build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

RUN npm ci

COPY client ./client

RUN npm run build -w client

FROM node:20-alpine AS client-runtime
WORKDIR /app

RUN npm install -g serve

COPY --from=client-build /app/client/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "/app/dist", "-l", "8080"]
