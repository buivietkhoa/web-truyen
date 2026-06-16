const bangkokOffsetMilliseconds = 7 * 60 * 60 * 1000;

export function getBangkokDateKey(value = new Date()) {
  const bangkokDate = new Date(value.getTime() + bangkokOffsetMilliseconds);
  return new Date(Date.UTC(
    bangkokDate.getUTCFullYear(),
    bangkokDate.getUTCMonth(),
    bangkokDate.getUTCDate()
  ));
}

export function addUtcDays(value: Date, days: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
