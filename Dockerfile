FROM node:20-alpine3.19

# Устанавливаем bash и активируем Corepack
RUN apk add --no-cache bash && corepack enable

WORKDIR /app
COPY package.json yarn.lock ./

# Подготавливаем нужную версию Yarn и фиксируем зависимости
RUN yarn install

COPY . .

CMD ["yarn", "worker"]
