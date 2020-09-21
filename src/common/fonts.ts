import * as WebFont from "webfontloader"
import {TextStyle} from "pixi.js"

export function load(families: string[]) {
    return new Promise(resolve => WebFont.load({
        google: {
            families,
        }, active: () => resolve(),
    }))
}

export const textStyle = new TextStyle({
    fill: "white", fontFamily: "Indie Flower",
})
