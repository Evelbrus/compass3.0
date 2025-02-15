# Название проекта

## Запуск и миграция Prisma

1. yarn add cross-env
2. windows: cross-env DATABASE_URL="postgresql://psql_user_compass:1@localhost:5432/compass_1" yarn prisma generate
3. windows: cross-env DATABASE_URL="postgresql://psql_user_compass:1@localhost:5432/compass_1" yarn prisma migrate dev
4. windows: cross-env DATABASE_URL="postgresql://psql_user_compass:1@localhost:5432/compass_1" yarn prisma db push
5. windows: cross-env DATABASE_URL="postgresql://psql_user_compass:1@localhost:5432/compass_1" yarn prisma db seed

## Запуск и управление сервисами

Этот проект использует `make` для управления различными сервисами, каждый из которых запускается в отдельном Docker-контейнере.  Для оркестровки используется `docker-compose`.

### Доступные команды

| Команда           | Описание                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `make all`        | Запускает все сервисы: PostgreSQL, Redis, BullMQ, Worker, Next.js (prod и serve) и WebSocket сервер.                       |
| `make psql`       | Запускает контейнер PostgreSQL.                                                                                                |
| `make redis`      | Запускает контейнер Redis.                                                                                                   |
| `make bull`       | Запускает контейнер BullMQ (очередь задач).                                                                                    |
| `make worker`     | Запускает контейнер Worker (обработчик задач из очереди BullMQ).                                                              |
| `make next-prod`  | Запускает контейнер Next.js в режиме production.                                                                               |
| `make next-serve` | Запускает контейнер Next.js, обслуживающий production сборку.                                                                 |
| `make websocket` | Запускает контейнер WebSocket сервера.                                                                                        |
| `make both`       | Запускает оба сервиса Next.js (production build и локальный сервер) последовательно.                                          |
| `make stop-all`   | Останавливает *все* запущенные контейнеры, связанные с проектом.                                                               |
| `make stop-psql`  | Останавливает контейнер PostgreSQL.                                                                                             |
| `make stop-redis` | Останавливает контейнер Redis.                                                                                                |
| `make stop-bull`  | Останавливает контейнер BullMQ.                                                                                               |
| `make stop-worker`| Останавливает контейнер Worker.                                                                                              |
| `make stop-next-prod` | Останавливает контейнер Next.js (prod).                                                                                    |
| `make stop-next-serve`| Останавливает контейнер Next.js (serve).                                                                                  |
| `make stop-websocket`| Останавливает контейнер WebSocket сервера.                                                                                   |
### Подробное описание команд

*   **`make all`**:  Запускает все сервисы, необходимые для полноценной работы приложения. Эквивалентно последовательному запуску `make psql`, `make redis`, `make bull`, `make worker`, `make next-prod`, `make next-serve` и `make websocket`.

*   **`make psql`**: Запускает контейнер с базой данных PostgreSQL.  Использует файл `docker-compose.psql.yml`.

*   **`make redis`**:  Запускает контейнер с Redis. Redis используется для [опишите для чего используется Redis, например: кэширования, управления сессиями, обмена сообщениями]. Использует файл `docker-compose.redis.yml`.

*   **`make bull`**: Запускает контейнер с BullMQ. BullMQ — это библиотека для управления очередями задач в Node.js. Использует файл `docker-compose.bull.yml`.

*   **`make worker`**: Запускает контейнер с Worker'ом. Worker обрабатывает задачи, поставленные в очередь BullMQ.  Использует файл `docker-compose.worker.yml`.

*   **`make next-prod`**:  Запускает контейнер с Next.js приложением, собранным для production (`next build`).  Использует файл `docker-compose.prod.yml`.

*   **`make next-serve`**: Запускает контейнер с сервером Next.js, который обслуживает production сборку (`next start`). Использует файл `docker-compose.serve.yml`.

*   **`make websocket`**:  Запускает контейнер с WebSocket сервером.  Этот сервер [опишите назначение WebSocket сервера, например: обеспечивает двустороннюю связь между клиентом и сервером для чата, уведомлений в реальном времени]. Использует файл `docker-compose.websocket.yml`.

*   **`make both`**: Запускает *оба* контейнера Next.js: `next-prod` и `next-serve`.

* **`make stop-all`**: Останавливает и удаляет *все* контейнеры, определенные во всех `docker-compose.*.yml` файлах проекта. Используйте эту команду для полной остановки приложения.

* **`make stop-psql`**, **`make stop-redis`**, **`make stop-bull`**, **`make stop-worker`**, **`make stop-next-prod`**, **`make stop-next-serve`**, **`make stop-websocket`**: Останавливают и удаляют соответствующие контейнеры.

### Примечания

*   Перед выполнением команд убедитесь, что у вас установлены Docker и Docker Compose.
*   Все команды используют файлы `docker-compose`, расположенные в поддиректории `docker-compose` (относительно расположения `Makefile`).
*   Убедитесь, что порты, указанные в файлах `docker-compose.*.yml`, не заняты другими приложениями.
*   Если вы вносите изменения в код, возможно, потребуется пересобрать и перезапустить соответствующие контейнеры. Для сервисов Next.js может потребоваться пересборка образа (если вы меняете зависимости или сам код приложения).

### Зависимости

*   Docker
*   Docker Compose
*   Node.js (для сборки Next.js, если это не делается внутри контейнера)
*   npm или yarn (для установки зависимостей Node.js, если это не делается внутри контейнера)
---