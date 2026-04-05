# Ипотека Мурабаха — веб-приложение

Публичный сайт (лендинг и продуктовая страница с калькулятором и заявкой), глобальный чат с пре-формой «имя + телефон», бэк-офис для операторов банка: CRM по заявкам и онлайн-чат.

## Стек

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **PostgreSQL** + **Prisma**
- **Auth.js (NextAuth v5)** — вход операторов по email/паролю (JWT-сессии)
- **Vitest** — unit-тесты расчёта графика

## Требования

- Node.js 20+
- База **PostgreSQL** в облаке (рекомендуется **[Prisma Postgres](https://www.prisma.io/docs/postgres)**): основная переменная **`isfin_db_DATABASE_URL`**, дополнительно **`isfin_db_PRISMA_DATABASE_URL`** / **`isfin_db_POSTGRES_URL`** (см. `.env.example`).

## Быстрый старт

1. Скопируйте переменные окружения:

   ```bash
   cp .env.example .env
   ```

   Заполните **`isfin_db_DATABASE_URL`** (и при необходимости **`isfin_db_PRISMA_DATABASE_URL`** / **`isfin_db_POSTGRES_URL`** из Prisma Console), сгенерируйте **`AUTH_SECRET`**, задайте **`AUTH_URL`** и **`NEXT_PUBLIC_APP_URL`** (локально обычно `http://localhost:3000`).

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

Подходит **Vercel**, **Netlify** (с адаптером Next), **Railway**. Секреты храните только в настройках окружения платформы, не коммитьте `.env`.

### Vercel (обязательно)

1. **Project → Settings → Environment Variables** — для **Production** (и при необходимости Preview):
   - **`isfin_db_DATABASE_URL`** — основная строка Prisma Postgres (`sslmode=require`).
   - **`isfin_db_PRISMA_DATABASE_URL`** и **`isfin_db_POSTGRES_URL`** — при необходимости; приложение может подставить их в **`isfin_db_DATABASE_URL`**.
   - **`AUTH_SECRET`**, **`AUTH_URL`**, **`NEXT_PUBLIC_APP_URL`** (публичный URL сайта на Vercel).
2. Миграции к облачной БД (один раз):  
   `isfin_db_DATABASE_URL="…та же строка…" npx prisma migrate deploy`
3. **Redeploy** проекта.

Без строк подключения к БД на Vercel API с данными не работают.

## Безопасность

- Валидация входных данных (Zod), параметризованные запросы через Prisma.
- Ограничение частоты запросов на публичные API (in-memory; для production при нескольких инстансах лучше Redis / Upstash).
- Заголовки в `next.config.ts`, отключён `X-Powered-By`.
- Локально и в CI: `npm audit`, ESLint с `eslint-plugin-security`, `npm run test`, `npm run build`.

## Лицензия

Учебный/демонстрационный проект.
