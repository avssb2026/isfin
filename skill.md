---
name: isfin-murabaha
description: >-
  Разработка и сопровождение веб-приложения «Ипотека Мурабаха»: Next.js, Prisma CRM,
  чат посетителей, бэк-офис операторов. Применять при работе с репозиторием isfin,
  заявками лидов, чатом, калькулятором Мурабаха, Auth.js или деплоем этого проекта.
---

# Навык: проект isfin (Мурабаха + CRM + чат)

## Назначение

Помогает агенту действовать в контексте уже принятой архитектуры: где лежат API, как устроены заявки и чат, какие проверки не снимать.

## Быстрая карта

| Область | Где смотреть |
|--------|----------------|
| Публичные страницы | `src/app/page.tsx`, `src/app/product/page.tsx` |
| Калькулятор | `src/lib/murabahaCalculator.ts`, `src/components/MurabahaCalculator.tsx` |
| Чат посетителя | `src/components/ChatWidget.tsx`, `ConditionalChatWidget.tsx`, `src/app/api/chat/` |
| Вход операторов | `src/auth.ts`, `src/app/admin/login/`, `middleware.ts` |
| CRM (лиды) | `src/app/admin/leads/`, `src/app/api/admin/leads/`, `src/app/api/admin/operators/` |
| Чат оператора | `src/app/admin/chat/`, `src/app/api/admin/chat/` |
| БД | `prisma/schema.prisma`, миграции в `prisma/migrations/` |

## Локальный TDD

- Запуск в цикле: `npm run test:watch` (или `test:tdd`). Один прогон перед коммитом: `npm run test`.
- Новая бизнес-логика: сначала кейс в `*.test.ts` (таблица вход/ожидаемый выход), затем реализация. Подробности — раздел «Локальная проверка по TDD» в `rule.md`.

## Типовые задачи

### Новая сущность в CRM

1. Обновить `prisma/schema.prisma`, создать миграцию.
2. Экспортировать операции через Route Handlers в `src/app/api/...` с проверкой `auth()` для `/admin`.
3. На клиенте бэк-офиса — `fetch` с `credentials: "include"`, учитывать загрузку сессии (`useSession`).

### Изменение списка заявок

- Фильтр «только мои» зашит в `GET /api/admin/leads` через `assignedOperatorId`. Если нужен «все заявки» — обсудить отдельный query-параметр и права (роль), не ломая текущее поведение без явного запроса.

### Деплой / окружение

- Нужны как минимум: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` / публичный URL приложения, переменные `NEXT_PUBLIC_*` для калькулятора.
- После деплоя: `prisma migrate deploy`, при необходимости `prisma db seed`.

### Терминология в UI

- Сохранять шариат-совместимые формулировки и запрет на «проценты»/«пени» в тексте интерфейса согласно `rule.md`.

## Чеклист качества

- [ ] Серверная валидация (Zod) для новых полей API.
- [ ] Не отключать rate limit на публичных формах без замены.
- [ ] Чат на страницах админки остаётся скрытым (`ConditionalChatWidget`).
- [ ] Секреты не попадают в git.
