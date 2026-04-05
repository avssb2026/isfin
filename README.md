# Ипотека Мурабаха — веб-приложение

Публичный сайт (лендинг и продуктовая страница с калькулятором и заявкой), глобальный чат с пре-формой «имя + телефон», бэк-офис для операторов банка: CRM по заявкам и онлайн-чат.

## Стек

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **PostgreSQL** + **Prisma**
- **Auth.js (NextAuth v5)** — вход операторов по email/паролю (JWT-сессии)
- **Vitest** — unit-тесты расчёта графика

## Требования

- Node.js 20+
- PostgreSQL 14+

## Быстрый старт

1. Скопируйте переменные окружения:

   ```bash
   cp .env.example .env
   ```

   Задайте `DATABASE_URL`, сгенерируйте `AUTH_SECRET` (например `openssl rand -base64 32`), укажите `AUTH_URL` и `NEXT_PUBLIC_APP_URL` (в разработке обычно `http://localhost:3000`).

2. Установите зависимости и примените миграции:

   ```bash
   npm install
   npx prisma migrate deploy
   ```

3. Создайте первого оператора (см. переменные `SEED_*` в `.env`):

   ```bash
   npm run db:seed
   ```

4. Запуск в режиме разработки:

   ```bash
   npm run dev
   ```

- Сайт: [http://localhost:3000](http://localhost:3000)  
- Бэк-офис: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Git и GitHub

Инициализация репозитория (если ещё не сделано):

```bash
git init
git add .
git commit -m "Initial commit: Murabaha site, CRM, chat"
```

Создайте репозиторий на GitHub и привяжите remote:

```bash
git remote add origin https://github.com/<user>/<repo>.git
git branch -M main
git push -u origin main
```

## Деплой

Подходит **Vercel**, **Netlify** (с адаптером Next), **Railway**. Задайте на хостинге те же переменные, что в `.env.example`, в том числе `DATABASE_URL` к управляемому PostgreSQL (Neon, Supabase, Railway Postgres и т.д.).

Секреты храните только в настройках окружения платформы, не коммитьте `.env`.

## Безопасность

- Валидация входных данных (Zod), параметризованные запросы через Prisma.
- Ограничение частоты запросов на публичные API (in-memory; для production при нескольких инстансах лучше Redis / Upstash).
- Заголовки в `next.config.ts`, отключён `X-Powered-By`.
- Локально и в CI: `npm audit`, ESLint с `eslint-plugin-security`, `npm run test`, `npm run build`.

## Лицензия

Учебный/демонстрационный проект.
