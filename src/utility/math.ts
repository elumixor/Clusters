export function clamp(v: number, min: number, max: number) {
    return Math.max(Math.min(v, max), min)
}

export function lerp(from: number, to: number, t: number) {
    return to * t + (1 - t) * from
}

export function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min
}
