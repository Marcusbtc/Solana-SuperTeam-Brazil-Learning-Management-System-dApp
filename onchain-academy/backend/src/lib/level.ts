export function deriveLevel(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) {
    return 0;
  }

  return Math.floor(Math.sqrt(xp / 100));
}
