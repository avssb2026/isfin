import Link from "next/link";
import { MurabahaCalculator } from "@/components/MurabahaCalculator";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader";

function IconHome() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function IconScale() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

const features = [
  {
    icon: IconHome,
    title: "Реальный актив",
    text: "Банк выкупает жильё и передаёт его вам в рассрочку по заранее согласованной отсроченной цене — без классической схемы «деньги в долг».",
  },
  {
    icon: IconDoc,
    title: "Понятная структура",
    text: "Видны цена банка, срок и график взносов; вознаграждение банка заложено как маржа — без скрытых условий.",
  },
  {
    icon: IconScale,
    title: "Сопоставимо с рынком",
    text: "Расчётный параметр графика согласуется с ключевой ставкой — так проще сравнить условия с обычной ипотекой.",
  },
  {
    icon: IconChat,
    title: "Поддержка онлайн",
    text: "Чат на сайте и заявка на странице продукта: оператор поможет с документами и шагами оформления.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="page-gradient min-h-screen">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)] sm:p-10 md:p-12">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl"
            aria-hidden
          />
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              Ипотека по шариату
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl md:text-[2.5rem] md:leading-[1.15]">
              Жильё в рассрочку с прозрачной отсроченной ценой
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Модель Мурабаха: банк приобретает объект и продаёт его вам с отсрочкой платежа. Вы
              заранее видите цену, взносы и срок — без формулировок «проценты» и «штрафы»,
              в договоре — в соответствии со стандартами банка.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/product#lead-form"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:bg-[var(--accent-hover)]"
              >
                Условия и заявка
              </Link>
              <a
                href="#calculator"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]"
              >
                К калькулятору
              </a>
            </div>
          </div>
        </section>

        <section
          id="calculator"
          className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12"
        >
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Почему выбирают Мурабаху</h2>
            <ul className="mt-8 space-y-5">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--text)]">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <MurabahaCalculator compact />
        </section>

        <section className="mt-16 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-md)] sm:p-10">
          <h2 className="text-xl font-bold text-[var(--text)] sm:text-2xl">Как это устроено</h2>
          <p className="mt-4 max-w-3xl text-[var(--text-secondary)] leading-relaxed">
            Банк покупает жильё у продавца и перепродаёт его вам; вы погашаете отсроченную цену по
            графику. Документы и формулировки соответствуют внутренним шариатским стандартам банка.
          </p>
          <div className="mt-8">
            <Link
              href="/product#lead-form"
              className="inline-flex items-center gap-2 font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
            >
              Подробные условия и форма заявки
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
