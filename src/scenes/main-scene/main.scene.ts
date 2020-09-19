import {Scene} from "../scene"
import {Container} from "pixi.js"
import {application} from "../../application"
import {findClusters} from "./clustering"
import {RectObject, GenerateButtonObject, SliderObject} from "./objects"


export class MainScene extends Scene {
    private field: Container
    generateButton: GenerateButtonObject

    initialize() {
        super.initialize()

        this.generateButton = new GenerateButtonObject()
        this.generateButton.position.set(application.center.x, application.center.y + 200)
        this.addStageElement(this.generateButton)

        let rows = 5
        let columns = 5
        let colors = 3

        this.createSliders((newRows, newColumns, newColors) => {
            rows = newRows
            columns = newColumns
            colors = newColors
            this.doClusters(rows, columns, colors)

        }, columns, rows, colors)

        this.generateButton.on('mousedown', () => this.doClusters(rows, columns, colors))

        this.doClusters(rows, columns, colors)
    }

    private doClusters(rows: number, columns: number, colors: number) {

        const rectangles = this.generateField(rows, columns, colors)

        const clusters = findClusters(rectangles, columns)
        const clusterRects = clusters.map(c => c.allRects).reduce((a, b) => [...a, ...b], [])

        for (let rectangle of rectangles) {
            if (clusterRects.includes(rectangle)) continue
            rectangle.hide()
        }
    }

    private generateField(rows: number, columns: number, colorTypes: number): RectObject[] {
        if (this.field) this.removeStageElement(this.field)

        this.field = new Container()
        const rects: RectObject[] = []

        const rectSize = 25
        const padding = 3

        this.field.sortableChildren = true

        const colors = this.generateColors(colorTypes)
        const createRect = (x: number, y: number) => {
            const rect = new RectObject(x * (rectSize + padding), y * (rectSize + padding), rectSize, rectSize, colors[Math.floor(Math.random() * colorTypes)])
            this.field.addChild(rect)
            rects.push(rect)
        }

        for (let i = 0; i < rows; i++) for (let j = 0; j < columns; j++) createRect(j, i)

        application.centerElement(this.field)
        this.addStageElement(this.field)

        this.generateButton.position.y = this.field.position.y + this.field.height + 50

        return rects
    }

    private generateColors(typesCount: number) {
        const minColorComponent = 0x10
        const maxColorComponent = 0xFF

        function random(min: number, max: number) { return Math.floor(Math.random() * (max - min) + min) }
        function randomColorComponent() { return random(minColorComponent, maxColorComponent) }
        function randomColor() { return randomColorComponent() + (randomColorComponent() << 8) + (randomColorComponent() << 16) }

        return Array.from({length: typesCount}, randomColor)
    }

    private createSliders(changedCallback: (rows: number, columns: number, colorTypes: number) => void, rows: number, columns: number, colors: number) {
        const padding = 15

        const rowSlider = new SliderObject({
            label: value => "Rows: " + value,
            min: 3,
            max: 20,
            defaultValue: rows,
            onValueChanged: newValue => changedCallback(rows = newValue, columns, colors),
        })

        const x = application.app.renderer.width - rowSlider.width - padding
        rowSlider.x = x
        rowSlider.y = padding

        const columnSlider = new SliderObject({
            label: value => "Columns: " + value,
            min: 3,
            max: 20,
            defaultValue: columns,
            onValueChanged: newValue => changedCallback(rows, columns = newValue, colors),
        })

        columnSlider.x = x
        columnSlider.y = padding + padding + rowSlider.height

        const colorTypesSlider = new SliderObject({
            label: value => "Colors: " + value,
            min: 1,
            max: 10,
            defaultValue: colors,
            onValueChanged: newValue => changedCallback(rows, columns, colors = newValue),
        })

        colorTypesSlider.x = x
        colorTypesSlider.y = padding + padding + padding + rowSlider.height + columnSlider.height

        this.addStageElement(rowSlider)
        this.addStageElement(columnSlider)
        this.addStageElement(colorTypesSlider)
    }
}
