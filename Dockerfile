FROM node:20-alpine3.19

# Устанавливаем bash и активируем Corepack
RUN apk add --no-cache bash && corepack enable

WORKDIR /app
COPY package.json yarn.lock ./

# Подготавливаем нужную версию Yarn и фиксируем зависимости
RUN corepack prepare yarn@4.4.1 --activate && yarn install --immutable

COPY . .

CMD ["yarn", "worker"]
