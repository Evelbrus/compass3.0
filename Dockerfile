FROM node:20-alpine3.19

# Устанавливаем bash, corepack и curl для тестов
RUN apk add --no-cache bash curl && corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

# Копируем файлы package.json и yarn.lock перед установкой зависимостей
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install

# Копируем остальные файлы проекта
COPY . .

# Открываем порт для Redis (если нужно)
EXPOSE 6379

# Определяем переменные окружения (можно удалить, если уже загружаются через env_file)
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

# Запуск воркера
CMD ["yarn", "worker"]
