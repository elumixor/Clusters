import * as PIXI from "pixi.js"
import {randomRange} from "./math";

interface HSLColor {
    h: number,
    s: number,
    l: number
}

interface GenerationOptions {
    saturationRange?: number[]
    lightnessRange?: number[]
    hueNoise?: number
}

const defaultOptions: GenerationOptions = {
    saturationRange: [80, 100],
    lightnessRange: [30, 60],
    hueNoise: 0
}

export function distantColors(count: number,
                              {saturationRange, lightnessRange, hueNoise}: GenerationOptions = defaultOptions): number[] {
    if (saturationRange === undefined) saturationRange = defaultOptions.saturationRange
    if (lightnessRange === undefined) lightnessRange = defaultOptions.lightnessRange
    if (hueNoise === undefined) hueNoise = defaultOptions.hueNoise

    const shift = Math.random() * 360
    return rangomHSL(saturationRange, lightnessRange, count)
        .map(({h, s, l}) =>
            HSLToHex({h: (h + shift + Math.random() * 360 * hueNoise) % 360, s, l}))
}

// Modified example from https://css-tricks.com/converting-color-spaces-in-javascript/
function HSLToHex({h, s, l}: HSLColor) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    r += m
    g += m
    b += m

    return PIXI.utils.rgb2hex([r, g, b])
}

function rangomHSL([saturationMin, saturationMax]: number[],
                   [lightnessMin, lightnessMax]: number[], count: number): HSLColor[] {
    return Array.from({length: count}, (_, i) => {
        return {
            h: 360 * i / count,
            s: randomRange(saturationMin, saturationMax),
            l: randomRange(lightnessMin, lightnessMax)
        }
    })
}
