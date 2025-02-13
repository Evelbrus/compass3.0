# Указываем, что эти цели не являются файлами
.PHONY: all psql redis bull worker next-prod next-serve websocket both stop-all stop-psql stop-redis stop-bull stop-worker stop-next-prod stop-next-serve stop-websocket

# Переменная для удобного указания пути к файлам docker-compose
DCOMPOSE_PATH = docker-compose

# Цель по умолчанию — запуск всех контейнеров
all: psql redis bull worker next-prod next-serve websocket

# Запуск контейнера PostgreSQL
psql:
	@echo "Запуск PostgreSQL..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.psql.yml up -d

# Запуск контейнера Redis
redis:
	@echo "Запуск Redis..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.redis.yml up -d

# Запуск контейнера BullMQ
bull:
	@echo "Запуск BullMQ..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.bull.yml up -d

# Запуск контейнера Worker
worker:
	@echo "Запуск Worker..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.worker.yml up -d

# Запуск контейнера Next.js (prod)
next-prod:
	@echo "Запуск Next.js (prod)..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.prod.yml up

# Запуск контейнера Next.js (serve)
next-serve:
	@echo "Запуск Next.js (serve)..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.serve.yml up

# Запуск WebSocket сервера
websocket:
	@echo "Запуск WebSocket сервера..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.websocket.yml up -d

# Запуск обоих сервисов Next.js
both: next-prod next-serve
	@echo "Оба сервиса Next.js запущены."

# Остановка всех контейнеров
stop-all:
	@echo "Остановка всех контейнеров..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.psql.yml down
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.redis.yml down
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.bull.yml down
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.worker.yml down
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.prod.yml down
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.serve.yml down
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.websocket.yml down

# Остановка контейнера PostgreSQL
stop-psql:
	@echo "Остановка PostgreSQL..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.psql.yml down

# Остановка контейнера Redis
stop-redis:
	@echo "Остановка Redis..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.redis.yml down

# Остановка контейнера BullMQ
stop-bull:
	@echo "Остановка BullMQ..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.bull.yml down

# Остановка контейнера Worker
stop-worker:
	@echo "Остановка Worker..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.worker.yml down

# Остановка контейнера Next.js (prod)
stop-next-prod:
	@echo "Остановка Next.js (prod)..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.prod.yml down

# Остановка контейнера Next.js (serve)
stop-next-serve:
	@echo "Остановка Next.js (serve)..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.serve.yml down

# Остановка WebSocket сервера
stop-websocket:
	@echo "Остановка WebSocket сервера..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.websocket.yml down
