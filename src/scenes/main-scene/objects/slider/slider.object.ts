import * as PIXI from "pixi.js"
import {Container, Graphics, Text} from "pixi.js"
import {clamp, clamp01} from "../../../../utility"
import log2 = PIXI.utils.log2
import {textStyle} from "../../../../shared"

export class SliderObject extends Container {
    private readonly background: Graphics
    private readonly tick: Graphics
    private readonly optionsCount: number
    private readonly label: Text
    currentValue: number

    constructor(private options: {
        label: (value: number) => string, min: number, max: number, defaultValue: number, width?: number, height?: number, backgroundColor?: number, tickColor?: number, onValueChanged: (newValue: number) => void
    }) {
        super()
        this.optionsCount = options.max - options.min + 1

        if (this.options.tickColor === undefined ) this.options.tickColor = 0xe23718
        if (this.options.backgroundColor === undefined ) this.options.backgroundColor = 0x2d5656
        if (this.options.width === undefined ) this.options.width = 200
        if (this.options.height === undefined ) this.options.height = 25

        this.background = new Graphics()
        this.background.beginFill(options.backgroundColor)
        this.background.drawRect(0, 0, options.width, options.height)
        this.background.endFill()


        this.tick = new Graphics()
        this.tick.beginFill(options.tickColor)
        this.tick.drawRect(0, 0, options.width / this.optionsCount, options.height)
        this.tick.endFill()

        const backgroundFilter = new PIXI.filters.ColorMatrixFilter()
        this.background.filters = [backgroundFilter]

        this.background.interactive = true
        this.background.on('mouseover', () => { if (!dragging) backgroundFilter.brightness(1.25, false) })
        this.background.on('mouseout', () => { backgroundFilter.brightness(1, false) })
        this.background.on('mousedown', (e: any) => {
            dragging = true
            offset = this.tick.width / 2
            let x = e.data.getLocalPosition(this.background).x
            x = clamp(x, 0, options.width - this.tick.width)
            let value = Math.round(x / options.width * this.optionsCount)
            this.value = value + options.min
        })
        this.background.on('mouseup', () => dragging = false)
        this.background.on('mouseupoutside', () => dragging = false)

        const tickFilter = new PIXI.filters.ColorMatrixFilter()
        this.tick.filters = [tickFilter]

        this.tick.interactive = true
        this.tick.on('mouseover', () => { tickFilter.brightness(1.25, false) })
        this.tick.on('mouseout', () => { tickFilter.brightness(1, false) })

        let dragging = false
        let offset: number
        const onDragMove = (e: any) => {
            if (!dragging) return

            const newPosition = e.data.getLocalPosition(this)
            let x = newPosition.x - offset
            x = clamp(x, 0, options.width - this.tick.width)
            let value = Math.round(x / options.width * this.optionsCount)
            this.value = value + options.min
        }

        this.tick.on('mousedown', (e: any) => {
            dragging = true
            offset = e.data.getLocalPosition(this.tick).x
        })

        this.tick.on('mouseup', () => dragging = false)
        this.tick.on('mouseupoutside', () => dragging = false)
        this.tick.on('mousemove', onDragMove)

        this.label = this.createLabel()
        this.addChild(this.background, this.tick, this.label)

        this.value = this.options.defaultValue
    }

    set value(v: number) {
        if (this.currentValue === v) return

        v = clamp(v, this.options.min, this.options.max)
        this.currentValue = v

        this.options.onValueChanged(v)
        this.label.text = this.options.label(this.currentValue)
        this.label.x = this.options.width / 2 - this.label.width / 2
        this.tick.position.x = (v - this.options.min) / this.optionsCount * this.options.width
    }

    private createLabel(): Text {
        const s = {...textStyle}
        s.fill = 'black'
        const text = new Text(this.options.label(this.currentValue), s)
        text.x = this.options.width / 2 - text.width / 2
        text.y = this.options.height / 2 - text.height / 2 + 3
        return text
    }
}
