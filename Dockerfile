FROM node:20-alpine3.19

# Устанавливаем bash и Corepack (управляет версиями Yarn)
RUN apk add --no-cache bash && corepack enable

WORKDIR /app
COPY package.json yarn.lock ./

# Убеждаемся, что используется нужная версия Yarn
RUN corepack prepare yarn@4.4.1 --activate && yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "worker"]
