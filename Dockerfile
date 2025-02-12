# Используем легковесный образ Node.js 20 на Alpine
FROM node:20-alpine3.19

# Устанавливаем необходимые пакеты
RUN apk add --no-cache bash

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только файлы зависимостей для кеширования слоев Docker
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile

# Копируем оставшиеся файлы проекта
COPY . .

# Открываем порт (если worker взаимодействует по сети, например, с WebSocket)
EXPOSE 4000

# Запускаем worker
CMD ["yarn", "worker"]