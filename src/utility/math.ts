export function clamp(v: number, min: number, max: number) { return Math.max(Math.min(v, max), min) }
export function clamp01(v: number) { return clamp(v, 0, 1) }
