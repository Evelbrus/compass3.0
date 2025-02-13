# Указываем, что эти цели не являются файлами
.PHONY: all psql redis bull worker next-prod next-serve websocket both

# Переменная для удобного указания пути к файлам docker-compose
DCOMPOSE_PATH = docker-compose

all: psql redis bull worker next-prod next-serve websocket

psql:
	@echo "Запуск PostgreSQL..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.psql.yml up -d

redis:
	@echo "Запуск Redis..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.redis.yml up -d

bull:
	@echo "Запуск BullMQ..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.bull.yml up -d

worker:
	@echo "Запуск Worker..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.worker.yml up -d

next-prod:
	@echo "Запуск Next.js (prod)..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.prod.yml up -d

next-serve:
	@echo "Запуск Next.js (serve)..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.serve.yml up -d

websocket:
	@echo "Запуск WebSocket сервера..."
	docker-compose -f $(DCOMPOSE_PATH)/docker-compose.websocket.yml up -d

both: next-prod next-serve
	@echo "Оба сервиса Next.js запущены."
