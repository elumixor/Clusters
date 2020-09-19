import {Graphics} from "pixi.js"
import {RectFilter} from "./rect.filter"
import {tween, Easings} from "../../../../shared"
import {Chunk} from "../../clustering"

export class RectObject extends Graphics {
    private readonly filter: RectFilter

    chunk: Chunk = null

    constructor(x: number, y: number, width: number, height: number, public readonly color: number) {
        super()

        this.beginFill(color)
        this.drawRect(x, y, width, height)
        this.endFill()

        this.filter = new RectFilter()
        this.filters = [this.filter]
        this.interactive = true
        this.zIndex = 0

        this.on('mouseover', () => this.chunk?.rects.forEach(c => c.focus(c.chunk.isComplete ? .9 : 1)))
        this.on('mouseout', () => this.chunk?.rects.forEach(c => c.focusOut(c.chunk.isComplete ? 1 : 1.1)))
    }

    focus(to: number, duration: number = 10) {
        const start = this.filter.z

        tween((t: number) => this.filter.z = to * t + start * (1 - t), duration, Easings.easeOutQuad)

        if (!this.chunk.isComplete) {
            const startA = this.filter.a
            const endA = .8
            tween((t: number) => this.filter.a = endA * t + startA * (1 - t), duration, Easings.easeOutQuad)
            this.zIndex = -2
        } else this.zIndex = 10
    }

    private focusOut(to: number, duration: number = 10) {
        const start = this.filter.z

        tween((t: number) => this.filter.z = to * t + start * (1 - t), duration, Easings.easeOutQuad)

        if (!this.chunk.isComplete) {
            const startA = this.filter.a
            const endA = .2
            tween((t: number) => this.filter.a = endA * t + startA * (1 - t), duration, Easings.easeOutQuad)
            this.zIndex = -3
        } else this.zIndex = -1
    }

    public hide() {
        this.focusOut(1.1, 50)
    }
}
