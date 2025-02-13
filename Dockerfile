# Используем легковесный образ Node.js
FROM node:20-alpine3.19

# Устанавливаем bash, corepack и curl для тестов
RUN apk add --no-cache bash curl && corepack enable && corepack prepare yarn@stable --activate

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем только папку worker-dist
COPY apps/next-app/worker-dist ./worker-dist

# Переходим в рабочую директорию для установки зависимостей (если нужно)
# RUN yarn install

# Открываем порты
EXPOSE 3001 4000 6379
