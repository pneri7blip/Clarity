export type ProjectionInput = {
  initial: number;
  monthlyContribution: number;
  annualReturnPct: number;
  years: number;
};

export function projectFutureValue({ initial, monthlyContribution, annualReturnPct, years }: ProjectionInput) {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1;
  let balance = Math.max(0, initial);
  const points = [{ year: 0, value: Number(balance.toFixed(2)) }];
  for (let month = 1; month <= months; month += 1) {
    balance = balance * (1 + monthlyRate) + Math.max(0, monthlyContribution);
    if (month % 12 === 0 || month === months) points.push({ year: Number((month / 12).toFixed(1)), value: Number(balance.toFixed(2)) });
  }
  return points;
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
