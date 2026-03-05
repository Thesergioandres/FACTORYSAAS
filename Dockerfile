FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY frontend ./frontend
RUN npm run build --prefix frontend

FROM node:20-alpine AS app

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

RUN npm prune --omit=dev

COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/index.js"]
