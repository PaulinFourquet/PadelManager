export type Rng = {
  seed: number;
  next: () => number;
  nextInt: (min: number, max: number) => number;
  pickWeighted: <T>(items: Array<{ item: T; weight: number }>) => T;
};

export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;

  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  return {
    get seed() {
      return state;
    },
    next,
    nextInt: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pickWeighted: <T>(items: Array<{ item: T; weight: number }>) => {
      const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
      if (total <= 0) {
        return items[0].item;
      }
      let roll = next() * total;
      for (const entry of items) {
        roll -= Math.max(0, entry.weight);
        if (roll <= 0) {
          return entry.item;
        }
      }
      return items[items.length - 1].item;
    },
  };
};
