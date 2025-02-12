FROM node:16

# Копируем проект в контейнер
WORKDIR /app
COPY . /app

# Запускаем команду worker
CMD ["yarn", "worker"]
