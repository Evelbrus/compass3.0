# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем только папку worker-dist
COPY apps/next-app/worker-dist ./worker-dist

# Открываем порты
EXPOSE 3001 4000 6379
