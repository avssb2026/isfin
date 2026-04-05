import Link from "next/link";
import { MurabahaCalculator } from "@/components/MurabahaCalculator";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
            Исламское финансирование
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text)] md:text-4xl">
            Мурабаха: жильё по шариату
          </h1>
        </div>
        <Link
          href="/product"
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
        >
          Условия продукта
        </Link>
      </header>

      <section className="mt-12 grid gap-10 md:grid-cols-2 md:items-start">
        <div>
          <h2 className="text-xl font-semibold">Почему Мурабаха</h2>
          <ul className="mt-4 space-y-4 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--text)]">Реальный актив.</strong> Банк приобретает
              объект и передаёт его вам в рассрочку по согласованной отсроченной цене — без
              спекулятивного «деньги в долг под проценты» в классическом смысле.
            </li>
            <li>
              <strong className="text-[var(--text)]">Прозрачная структура.</strong> Известны
              цена банка, срок и график взносов; надбавка банка заложена заранее как маржа.
            </li>
            <li>
              <strong className="text-[var(--text)]">Сопоставимо с рынком.</strong> Расчётный
              параметр графика согласуется с ключевой ставкой, чтобы условия были сопоставимы с
              классической ипотекой — при шариатском оформлении сделки.
            </li>
            <li>
              <strong className="text-[var(--text)]">Сопровождение.</strong> Онлайн-чат и заявка
              на странице продукта — оператор банка поможет пройти путь оформления.
            </li>
          </ul>
        </div>
        <MurabahaCalculator compact />
      </section>

      <section className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Как это устроено</h2>
        <p className="mt-3 text-[var(--muted)]">
          Модель Мурабаха предполагает покупку банком жилья у продавца и перепродажу вам с
          отсрочкой платежа. Вы выплачиваете согласованную отсроченную цену частями. Формулировки
          и документы соответствуют внутренним шариатским стандартам банка; интерфейс не
          использует слова «проценты» и «пени» — вместо этого — цена, взносы и маржа банка.
        </p>
        <div className="mt-6">
          <Link
            href="/product"
            className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Подробные условия и заявка →
          </Link>
        </div>
      </section>
    </main>
  );
}
