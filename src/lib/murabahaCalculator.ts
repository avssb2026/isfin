/**
 * Расчёт ежемесячного платежа по отсроченной цене (аннуитетная схема),
 * математически сопоставимая с классической ипотекой при той же ключевой ставке.
 */

export type MurabahaInput = {
  propertyPrice: number;
  downPayment: number;
  termMonths: number;
  /** Годовой расчётный параметр (в долях единицы, например 0.16 для 16%) */
  annualScheduleParameter: number;
};

export type MurabahaResult = {
  financedAmount: number;
  monthlyPayment: number;
  totalDeferredPrice: number;
  totalMarkup: number;
};

export function calculateMurabahaSchedule(input: MurabahaInput): MurabahaResult {
  const { propertyPrice, downPayment, termMonths, annualScheduleParameter } = input;

  if (propertyPrice <= 0 || downPayment < 0 || termMonths <= 0) {
    throw new Error("Некорректные входные данные");
  }
  if (downPayment >= propertyPrice) {
    throw new Error("Первоначальный взнос должен быть меньше стоимости объекта");
  }

  const financedAmount = propertyPrice - downPayment;
  const monthlyRate = annualScheduleParameter / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = financedAmount / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = (financedAmount * monthlyRate * factor) / (factor - 1);
  }

  const totalDeferredPrice = monthlyPayment * termMonths;
  const totalMarkup = totalDeferredPrice - financedAmount;

  return {
    financedAmount,
    monthlyPayment,
    totalDeferredPrice,
    totalMarkup,
  };
}

/** Перевод процентов ключевой ставки в долю (16 -> 0.16) */
export function percentToUnit(p: number): number {
  return p / 100;
}
