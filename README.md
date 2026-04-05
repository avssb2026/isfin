# Ипотека Мурабаха — веб-приложение

Публичный сайт (лендинг и продуктовая страница с калькулятором и заявкой), глобальный чат с пре-формой «имя + телефон», бэк-офис для операторов банка: CRM по заявкам и онлайн-чат.

## Стек

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **PostgreSQL** + **Prisma**
- **Auth.js (NextAuth v5)** — вход операторов по email/паролю (JWT-сессии)
- **Vitest** — unit-тесты расчёта графика

## Требования

- Node.js 20+
- База **PostgreSQL** в облаке (рекомендуется **[Prisma Postgres](https://www.prisma.io/docs/postgres)**): создайте инстанс и скопируйте строку подключения в `DATABASE_URL`.

## Быстрый старт

1. Скопируйте переменные окружения:

   ```bash
   cp .env.example .env
   ```

   Укажите **`DATABASE_URL`** на ваш Prisma Postgres (или другой управляемый PostgreSQL), сгенерируйте **`AUTH_SECRET`** (например `openssl rand -base64 32`), задайте **`AUTH_URL`** и **`NEXT_PUBLIC_APP_URL`** (локально обычно `http://localhost:3000`).

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

1. **Project → Settings → Environment Variables** — добавьте для **Production** (и при необходимости Preview):
   - **`DATABASE_URL`** — полная строка Prisma Postgres (как в `.env`), с `sslmode=require`.
   - **`AUTH_SECRET`**, **`AUTH_URL`** (URL сайта, например `https://ваш-проект.vercel.app`), **`NEXT_PUBLIC_APP_URL`** (тот же публичный URL).
2. После первого подключения БД выполните миграции к облачной базе (один раз):  
   `DATABASE_URL="…из Vercel…" npx prisma migrate deploy`
3. Сделайте **Redeploy** проекта, чтобы подтянулись переменные.

Без **`DATABASE_URL`** на Vercel API с БД (заявки, калькулятор из БД) не работают — формы вернут ошибку или запасные значения.

## Безопасность

- Валидация входных данных (Zod), параметризованные запросы через Prisma.
- Ограничение частоты запросов на публичные API (in-memory; для production при нескольких инстансах лучше Redis / Upstash).
- Заголовки в `next.config.ts`, отключён `X-Powered-By`.
- Локально и в CI: `npm audit`, ESLint с `eslint-plugin-security`, `npm run test`, `npm run build`.

## Лицензия

Учебный/демонстрационный проект.
