export const toIsoDate = (value: Date = new Date()): string => {
  return value.toISOString().slice(0, 10);
};

export const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const daysUntil = (date: string): number => {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${date}T00:00:00Z`);
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());

  return Math.ceil((targetUtc - todayUtc) / (1000 * 60 * 60 * 24));
};
