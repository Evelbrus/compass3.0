FROM node:20-alpine3.19

# Устанавливаем необходимые пакеты
RUN apk add --no-cache bash

# Копируем проект в контейнер
WORKDIR /app
COPY . /app

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile

# Запускаем команду worker
CMD ["yarn", "worker"]
