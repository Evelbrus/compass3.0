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

# Открываем порт
EXPOSE 3001
EXPOSE 4000
EXPOSE 6379

