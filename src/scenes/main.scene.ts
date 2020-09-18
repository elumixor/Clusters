import {Scene} from "./scene"
import {Container, DisplayObject, Graphics, Text, TextStyle} from "pixi.js"
import {application} from "../application"
import * as PIXI from "pixi.js"

class RectFilter extends PIXI.Filter {
    private static readonly vertexShader = `
        attribute vec2 aVertexPosition;    
        attribute vec2 aTextureCoord;    

        uniform mat3 projectionMatrix;
        
        varying vec2 vTextureCoord;
    
        uniform float z;
    
        void main(void) {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, z);
            vTextureCoord = aTextureCoord;
        } 
    `

    private static readonly fragmentShader = `
        uniform vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float a;
        
        void main(void) {
            vec4 color = texture2D(uSampler, vTextureCoord) * a;
            gl_FragColor = color;
        }
    `

    // uniforms: {z: number}

    constructor() {
        // const uniforms = {z: 1}
        super(RectFilter.vertexShader, RectFilter.fragmentShader, {z: 1, a: 1})
    }

    set z(value: number) {
        this.uniforms.z = value
    }

    set a(value: number) {
        this.uniforms.a = value
    }
}

class Chunk {
    private _references?: Chunk = null
    set references(value: Chunk) {
        this._references = value
        value.referencedBy = this
    }
    get references(): Chunk { return this._references }

    referencedBy?: Chunk = null
    rects: Rect[] = []

    push(rect: Rect) { this.rects.push(rect) }

    get rectsCount(): number {
        return this.rects.length + (this.referencedBy?.rectsCount || 0)
    }
    get allRects(): Rect[] { return [...this.rects, ...(this.referencedBy?.allRects || [])]}
}

class Rect extends Graphics {
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

        // this.on('mouseover', () => this.focus())
        // this.on('mouseout', () => this.focusOut())
    }

    private focus() {
        this.filter.z = .9
        this.zIndex = 10
    }

    private focusOut() {
        this.filter.z = 1.1
        this.zIndex = -1
    }

    public hide() {
        this.filter.a = .2
        this.focusOut()
    }
}

export class MainScene extends Scene {
    private field: Container

    private static readonly textStyle = new TextStyle({
        fill: "white",
    })

    initialize() {
        super.initialize()

        const generateButton = this.createGenerateButton()
        generateButton.on('mousedown', () => this.doClusters())

        this.doClusters()
    }

    private doClusters() {
        const columns = 5
        const rows = 5
        const types = 3

        const rectangles = this.generateField(rows, columns, types)

        const clusters = this.findClusters(rectangles, columns)
        const clusterRects = clusters.map(c => c.allRects).reduce((a, b) => [...a, ...b], [])

        for (let rectangle of rectangles) {
            if (clusterRects.includes(rectangle)) continue
            rectangle.hide()
        }
    }

    private createGenerateButton() {
        const generateButton = new Text("Generate!", MainScene.textStyle)
        generateButton.interactive = true
        generateButton.position.set(application.center.x - generateButton.width / 2, application.center.y + 200)
        this.addStageElement(generateButton)
        return generateButton
    }

    private generateField(width: number, height: number, typesCount: number): Rect[] {
        if (this.field) this.removeStageElement(this.field)

        this.field = new Container()
        const rects: Rect[] = []

        const rectSize = 25
        const padding = 1

        this.field.sortableChildren = true

        const colors = this.generateColors(typesCount)
        const createRect = (x: number, y: number) => {
            const rect = new Rect(x * (rectSize + padding), y * (rectSize + padding), rectSize, rectSize, colors[Math.floor(Math.random() * typesCount)])
            this.field.addChild(rect)
            rects.push(rect)
        }

        for (let i = 0; i < height; i++) for (let j = 0; j < width; j++) createRect(j, i)

        application.centerElement(this.field)
        this.addStageElement(this.field)

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
    private findClusters(rects: Rect[], columns: number): Chunk[] {
        let previousColor: number = null
        function getTopRect(i: number): Rect {
            if (i < columns) return null
            return rects[i - columns]
        }

        const chunks: Chunk[] = []

        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i]

            const previousSame = i % columns !== 0 && previousColor !== null && previousColor === rect.color
            if (previousSame) {
                rect.chunk = rects[i - 1].chunk
                rect.chunk.push(rect)
            }

            const topRect = getTopRect(i)
            if (topRect !== null && topRect.color === rect.color) {
                if (previousSame) {
                    if (rect.chunk !== topRect.chunk) rect.chunk.references = topRect.chunk
                } else {
                    rect.chunk = topRect.chunk
                    rect.chunk.push(rect)
                }
            }

            previousColor = rect.color
            if (rect.chunk === null) {
                rect.chunk = new Chunk()
                rect.chunk.push(rect)
                chunks.push(rect.chunk)
            }
        }

        return chunks.filter(c => c.references === null && c.rectsCount > 2)
    }
}
