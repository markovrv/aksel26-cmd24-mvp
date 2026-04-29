# ---- Этап сборки клиента ----
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm i
COPY client/ ./
RUN npm run build   # результат в /app/client/dist

# ---- Этап сборки сервера и финальный образ ----
FROM node:20-alpine
WORKDIR /app/server

# Зависимости сервера
COPY server/package*.json ./
RUN npm i

# Копируем исходники сервера
COPY server/src ./src

# Копируем собранный клиент в папку public (сервер должен раздавать статику)
COPY --from=client-builder /app/client/dist ./public

# Скрипт запуска
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001
USER node

ENTRYPOINT ["/entrypoint.sh"]