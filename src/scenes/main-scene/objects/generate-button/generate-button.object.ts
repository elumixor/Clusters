import {Text, TextStyle} from "pixi.js"
import {ColorFilter} from "./color.filter"
import {tween, Easings, textStyle} from "../../../../shared"

export class GenerateButtonObject extends Text {
    constructor() {
        super("Generate new!", textStyle)
        this.interactive = true
        this.cursor = 'pointer'
        const filter = new ColorFilter()
        this.filters = [filter]
        this.anchor.set(.5, .5)
        this.interactive = true

        this.on('mouseover', () => filter.focus())
        this.on('mouseout', () => filter.focusOut())
        this.on('click', () => {
            let smallScale = .975
            this.scale.set(smallScale, smallScale)

            tween(t => {
                const v = t + (1 - t) * smallScale
                this.scale.set(v)
            }, 10, Easings.easeInOutQuart)
        })
    }
}
