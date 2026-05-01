export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

export const round = (value: number, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
