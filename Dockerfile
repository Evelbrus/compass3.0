# Используем легковесный образ Node.js
FROM node:20-alpine3.19

# Устанавливаем bash, corepack и curl для тестов
RUN apk add --no-cache bash curl && corepack enable && corepack prepare yarn@stable --activate

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и yarn.lock перед установкой зависимостей
COPY package.json yarn.lock ./

# Устанавливаем зависимости с кешированием
RUN yarn install

# Копируем весь код проекта (исключая файлы, указанные в .dockerignore)
COPY . .

# Открываем порты
EXPOSE 3001 4000 6379