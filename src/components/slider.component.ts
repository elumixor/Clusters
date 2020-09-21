import * as PIXI from "pixi.js"
import {Container, Graphics, InteractionEvent, Text} from "pixi.js"
import {clamp} from "../utility"
import * as Fonts from "../common/fonts"
import ColorMatrixFilter = PIXI.filters.ColorMatrixFilter;

export class SliderComponent extends Container {
    currentValue: number

    set value(value: number) {
        if (this.currentValue === value) return
        value = clamp(value, this.options.min, this.options.max)
        this.updateValue(value)
        this.options.onValueChanged(value)
    }

    private readonly background: Graphics
    private readonly handle: Graphics
    private readonly optionsCount: number
    private readonly label: Text
    private readonly handleFilter: ColorMatrixFilter
    private readonly backgroundFilter: ColorMatrixFilter

    private dragging: boolean = false
    private offset: number

    constructor(private options: {
        label: (value: number) => string, min: number, max: number, defaultValue: number, width?: number, height?: number, backgroundColor?: number, tickColor?: number, onValueChanged: (newValue: number) => void
    }) {
        super()
        if (this.options.tickColor === undefined) this.options.tickColor = 0xe23718
        if (this.options.backgroundColor === undefined) this.options.backgroundColor = 0x2d5656
        if (this.options.width === undefined) this.options.width = 200
        if (this.options.height === undefined) this.options.height = 25

        this.optionsCount = options.max - options.min + 1

        // Slider background
        this.background = new Graphics()
        this.background.beginFill(options.backgroundColor)
        this.background.drawRect(0, 0, options.width, options.height)
        this.background.endFill()

        this.backgroundFilter = new PIXI.filters.ColorMatrixFilter()
        this.background.filters = [this.backgroundFilter]

        // Slider handle
        this.handle = new Graphics()
        this.handle.beginFill(options.tickColor)
        this.handle.drawRect(0, 0, options.width / this.optionsCount, options.height)
        this.handle.endFill()

        this.handleFilter = new PIXI.filters.ColorMatrixFilter()
        this.handle.filters = [this.handleFilter]

        // Make slider interactive, setup listeners for dragging
        this.configureInteractions()

        // Label
        this.label = this.createLabel()
        this.addChild(this.background, this.handle, this.label)

        // Set handle to reflect the current value
        this.updateValue(clamp(options.defaultValue, options.min, options.max))
    }

    /**
     * Adds listeners for dragging
     */
    private configureInteractions() {
        const onDragEnd = () => { this.dragging = false }
        const onDragMove = (e: InteractionEvent) => {
            if (!this.dragging) return

            const newPosition = e.data.getLocalPosition(this)
            let x = newPosition.x - this.offset
            x = clamp(x, 0, this.options.width - this.handle.width)
            let value = Math.round(x / this.options.width * this.optionsCount)
            this.value = value + this.options.min
        }
        const onDragStart = (e: InteractionEvent) => {
            this.dragging = true
            this.offset = e.data.getLocalPosition(this.handle).x
        }
        const onBackgroundDown = (e: InteractionEvent) => {
            this.dragging = true
            this.offset = this.handle.width / 2
            let x = e.data.getLocalPosition(this.background).x
            x = clamp(x, 0, this.options.width - this.handle.width)
            const value = Math.round(x / this.options.width * this.optionsCount)
            this.value = value + this.options.min
        };


        this.background.interactive = true
        this.handle.interactive = true

        // Highlight items on mouseover, dim on mouseout
        this.background.on('mouseover', () => {
            if (!this.dragging) this.backgroundFilter.brightness(1.25, false)
        })
        this.background.on('mouseout', () => { this.backgroundFilter.brightness(1, false) })

        this.handle.on('mouseover', () => { this.handleFilter.brightness(1.25, false) })
        this.handle.on('mouseout', () => { this.handleFilter.brightness(1, false) })

        // Set dragging events
        this.background.on('mousedown', onBackgroundDown)
        this.background.on('mouseup', onDragEnd)
        this.background.on('mouseupoutside', onDragEnd)
        this.handle.on('mousedown', onDragStart)
        this.handle.on('mouseup', onDragEnd)
        this.handle.on('mouseupoutside', onDragEnd)
        this.handle.on('mousemove', onDragMove)
    }

    private updateValue(value: number) {
        this.currentValue = value
        this.label.text = this.options.label(this.currentValue)
        this.label.x = this.options.width / 2 - this.label.width / 2
        this.handle.position.x = (value - this.options.min) / this.optionsCount * this.options.width
    }

    private createLabel(): Text {
        const s = {...Fonts.textStyle}
        s.fill = 'black'
        const text = new Text(this.options.label(this.currentValue), s)
        text.x = this.options.width / 2 - text.width / 2
        text.y = this.options.height / 2 - text.height / 2 + 3
        return text
    }
}
