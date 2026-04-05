/** Склейка ФИО оператора банка для отображения и сессии */
export function operatorFullName(o: {
  lastName: string;
  firstName: string;
  patronymic: string | null;
}): string {
  return [o.lastName, o.firstName, o.patronymic].filter(Boolean).join(" ");
}
