import {Scene} from "./scene";
import {Container, Graphics, Text, TextStyle} from "pixi.js"
import {application} from "../application";

export class MainScene extends Scene {
    private field: Container

    private readonly textStyle = new TextStyle({
        fill: "white",
    })

    initialize() {
        super.initialize()

        const generateButton = new Text("Generate!", this.textStyle)
        generateButton.interactive = true
        generateButton.position.set(application.center.x - generateButton.width / 2, application.center.y + 200)
        generateButton.on('mousedown', () => this.generateField(10, 10, 5))
        this.addStageElement(generateButton)
    }

    generateField(width: number, height: number, typesCount: number) {
        if (this.field) this.removeStageElement(this.field)

        this.field = new Container()
        const rectSize = 25
        const padding = 1

        const colors = Array.from({length: typesCount}, () => Math.floor(Math.random() * 0xFFFFFF))

        const createRect = (x: number, y: number) => {
            const rect = new Graphics()
            rect.beginFill(colors[Math.floor(Math.random() * typesCount)])
            rect.drawRect(x * (rectSize + padding), y * (rectSize + padding), rectSize,
                rectSize)
            rect.endFill()
            this.field.addChild(rect)
        }

        for (let i = 0; i < height; i++)
            for (let j = 0; j < width; j++)
                createRect(i, j)

        application.centerElement(this.field)
        this.addStageElement(this.field)
    }
}
