import {Container, Graphics, InteractionEvent, Rectangle, SCALE_MODES, Text, Texture} from "pixi.js"
import {application, centerElement, getCenterPoint, stage} from "../application"
import * as Clustering from "../clustering"
import * as Fonts from "../common/fonts"
import {GenerateButtonColorFilter} from "../filters/generate-button-color.filter";
import {Easings, tween} from "../common/tweening";
import {SliderComponent} from "../components/slider.component";
import {FieldRectangleComponent} from "../components/field-rectangle.component";
import {distantColors} from "../utility";

/**
 * Creates elements, manage their positioning and events
 */
export class MainScene {
    private rowSlider: SliderComponent;
    private columnSlider: SliderComponent;
    private colorTypesSlider: SliderComponent;

    private generateButton: Text

    private rectanglesField: Container
    private rectangles: FieldRectangleComponent[];


    private static readonly defaultRows = 3
    private static readonly defaultColumns = 3
    private static readonly defaultColors = 3

    private currentRows: number = MainScene.defaultRows
    private currentColumns: number = MainScene.defaultColumns
    private currentColorsCount: number = MainScene.defaultColors

    private static readonly rectangleSize = 25
    private static readonly rectanglePadding = 3

    constructor() {
        this.addStageElements()

        // generates rectangle field with default parameters
        this.generateField()

        window.addEventListener('resize', () => this.onResize())
    }

    private addStageElements() {
        this.addGenerateButton()
        this.addSliders()
    }

    /**
     * Creates a styled button that generates new field on click
     */
    private addGenerateButton() {
        this.generateButton = new Text("Generate new!", Fonts.textStyle)

        const center = getCenterPoint()

        this.generateButton.cursor = 'pointer'

        this.generateButton.anchor.set(.5, .5)
        this.generateButton.interactive = true
        this.generateButton.x = center.x
        this.generateButton.y = center.y + 200

        const filter = new GenerateButtonColorFilter()
        this.generateButton.filters = [filter]

        this.generateButton.interactive = true
        this.generateButton.on('mouseover', () => filter.focus())
        this.generateButton.on('mouseout', () => filter.focusOut())
        this.generateButton.on('click', () => {
            const smallScale = .975
            this.generateButton.scale.set(smallScale, smallScale)

            tween(t => {
                const v = t + (1 - t) * smallScale
                this.generateButton.scale.set(v)
            }, 10, Easings.easeInOutQuart)

            // Generate new field and highlight clusters
            this.generateField()
        })

        stage.addChild(this.generateButton)
    }

    /**
     * Creates sliders to change field configuration (rows, columns and number of colors)
     */
    private addSliders() {
        // Create sliders
        this.rowSlider = new SliderComponent({
            label: value => "Rows: " + value,
            min: 3,
            max: 20,
            defaultValue: this.currentRows,
            onValueChanged: newValue => {
                this.currentRows = newValue
                this.generateField()
            },
        })
        this.columnSlider = new SliderComponent({
            label: value => "Columns: " + value,
            min: 3,
            max: 20,
            defaultValue: this.currentColumns,
            onValueChanged: newValue => {
                this.currentColumns = newValue
                this.generateField()
            },
        })
        this.colorTypesSlider = new SliderComponent({
            label: value => "Colors: " + value,
            min: 1,
            max: 10,
            defaultValue: this.currentColorsCount,
            onValueChanged: newValue => {
                this.currentColorsCount = newValue
                this.generateField()
            },
        })

        this.updateSlidersPosition()

        // Add sliders to the stage
        stage.addChild(this.rowSlider, this.columnSlider, this.colorTypesSlider)
    }

    /**
     * Generates new field of rectangles with current parameters (rows, columns and colors).
     * Triggers clusters highlighting upon generation
     */
    private generateField() {
        // Remove old container, if present
        if (this.rectanglesField) stage.removeChild(this.rectanglesField)

        // Create new container for rectangles
        this.rectanglesField = new Container()
        this.rectanglesField.sortableChildren = true

        // Clear current collection of rectangles
        this.rectangles = []

        // Generate random textures for this field
        const textures = MainScene.generateColoredTextures(this.currentColorsCount)

        // Function to create a single rectangle at a given row and a column
        const createRectangle = (row: number, column: number) => {
            const type = Math.floor(Math.random() * this.currentColorsCount);
            const texture = textures[type];

            const rect = new FieldRectangleComponent(type, texture)

            rect.x = column * (MainScene.rectangleSize + MainScene.rectanglePadding)
            rect.y = row * (MainScene.rectangleSize + MainScene.rectanglePadding)

            this.rectanglesField.addChild(rect)
            this.rectangles.push(rect)
        }

        // Create rectangles in a field of given size
        for (let row = 0; row < this.currentRows; row++)
            for (let column = 0; column < this.currentColumns; column++)
                createRectangle(row, column)

        // Center the field and add it to a stage
        centerElement(this.rectanglesField)
        stage.addChild(this.rectanglesField)

        this.updateButtonPosition()
        this.highlightClusters()

        // Highlight the rectangles as the cursor moves
        this.rectanglesField.interactive = true
        this.rectanglesField.interactiveChildren = false
        this.rectanglesField.hitArea = new Rectangle(this.rectanglesField.x, this.rectanglesField.y,
            this.rectanglesField.width, this.rectanglesField.height)

        let currentlyHighlightedRectangle: FieldRectangleComponent = null

        const highlightCluster = (event: InteractionEvent) => {
            const {x, y} = event.data.getLocalPosition(this.rectanglesField)

            const s = MainScene.rectangleSize
            const p = MainScene.rectanglePadding

            const column = Math.floor((x - p / 2) / (s + p))
            const row = Math.floor((y - p / 2) / (s + p))

            if (column < 0 || column >= this.currentColumns || row < 0 || row >= this.currentRows) {
                currentlyHighlightedRectangle?.toDefaultState()
                currentlyHighlightedRectangle = null
                return
            }

            const index = row * this.currentColumns + column
            const rectangle = this.rectangles[index]

            if (currentlyHighlightedRectangle === null) {
                rectangle.toHighlightedState()
                currentlyHighlightedRectangle = rectangle
                return
            }

            if (rectangle === currentlyHighlightedRectangle || rectangle.clusterRectangles === currentlyHighlightedRectangle.clusterRectangles) {
                return
            } else {
                currentlyHighlightedRectangle.toDefaultState()
                rectangle.toHighlightedState()
                currentlyHighlightedRectangle = rectangle
            }
        }

        this.rectanglesField.on('mousemove', highlightCluster)
        this.rectanglesField.on('touch', highlightCluster)
    }

    /**
     * Searches for the clusters in the current field
     */
    private highlightClusters() {
        // Extract colors from rectangles to work with
        const rectanglesAsTypes = this.rectangles.map(rectangle => rectangle.type)

        // Run the algorithm to find clusters
        // Each cluster contains the indices of elements that form the cluster
        const clusters = Clustering.findClusters(rectanglesAsTypes, this.currentColumns)

        for (const c of clusters) {
            const clusterRectangles = c.map(i => this.rectangles[i])

            // Big cluster
            for (const clusterRectangle of clusterRectangles)
                clusterRectangle.clusterRectangles = clusterRectangles

            clusterRectangles[0].toDefaultState(50)
        }
    }

    /**
     * Generate textures for the rectangle sprites
     * Using Sprites instead of graphics due to performance
     * https://github.com/pixijs/pixi.js/wiki/v4-Performance-Tips#graphics
     */
    private static generateColoredTextures(count: number): Texture[] {
        // First, generate colors
        const colors = distantColors(count,
            {saturationRange: [30, 60], lightnessRange: [30, 70], hueNoise: 0})

        // Then create textures using graphics from colors
        function colorToTexture(color: number): Texture {
            const coloredRectangle = new Graphics()

            coloredRectangle.beginFill(color);
            coloredRectangle.drawRect(0, 0, MainScene.rectangleSize, MainScene.rectangleSize);
            coloredRectangle.endFill();

            return application.renderer.generateTexture(coloredRectangle, SCALE_MODES.LINEAR, 1);
        }

        return colors.map(colorToTexture)
    }

    /**
     * Move elements on window resize
     */
    private onResize() {
        this.updateSlidersPosition()
        centerElement(this.rectanglesField)
        this.updateButtonPosition()
    }

    // Position sliders in the top right corner of the screen
    private updateSlidersPosition() {
        const padding = 15
        const x = application.renderer.width - this.rowSlider.width - padding

        this.rowSlider.x = x
        this.rowSlider.y = padding

        this.columnSlider.x = x
        this.columnSlider.y = padding + padding + this.rowSlider.height

        this.colorTypesSlider.x = x
        this.colorTypesSlider.y = padding + padding + padding + this.rowSlider.height + this.columnSlider.height
    }

    // Update button to be centered and just below the field
    private updateButtonPosition() {
        // Update position of the generate button, because the vertically big field might overlap it
        this.generateButton.position.y = this.rectanglesField.y + this.rectanglesField.height + 50
        this.generateButton.position.x = getCenterPoint().x
    }
}
