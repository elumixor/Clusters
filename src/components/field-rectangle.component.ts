import {Container, Rectangle, Sprite, Texture} from "pixi.js"
import {HighlightFilter} from "../filters/highlight.filter"
import {tween, Easings} from "../common/tweening"
import {lerp} from "../utility"

// Using Sprites instead of graphics due to performance
// https://github.com/pixijs/pixi.js/wiki/v4-Performance-Tips#graphics
export class FieldRectangleComponent extends Sprite {
    private readonly filter: HighlightFilter

    private _clusterRectangles?: FieldRectangleComponent[]
    private isBigCluster: boolean

    // All the rectangles that belong to the same cluster
    get clusterRectangles() { return this._clusterRectangles }
    set clusterRectangles(value: FieldRectangleComponent[]) {
        this._clusterRectangles = value
        this.isBigCluster = value.length > 2
    }


    constructor(public readonly type: number, texture: Texture) {
        super(texture)

        this.filter = new HighlightFilter()
        this.filters = [this.filter]
        this.zIndex = 0
    }

    /**
     * When mouse is over the object, highlight the current cluster
     */
    public toHighlightedState(duration: number = 10) {
        if (this.isBigCluster) {
            const start = this.filter.z
            const end = .85

            for (const r of this.clusterRectangles) r.zIndex = 11

            tween(t => {
                for (const r of this.clusterRectangles) r.filter.z = lerp(start, end, t)
            }, duration)
        } else {
            const start = this.filter.z
            const startA = this.alpha
            const end = 1
            const endA = 1

            for (const r of this.clusterRectangles) r.zIndex = 1

            tween(t => {
                for (const r of this.clusterRectangles) {
                    r.filter.z = lerp(start, end, t)
                    r.alpha = lerp(startA, endA, t)
                }
            }, duration)
        }
    }

    /**
     * When mouse is not over the object, move all the rectangles of the cluster to default state
     */
    public toDefaultState(duration: number = 10) {
        if (this.isBigCluster) {
            const start = this.filter.z
            const end = .95

            for (const r of this.clusterRectangles) r.zIndex = 10

            tween(t => {
                for (const r of this.clusterRectangles) r.filter.z = lerp(start, end, t)
            }, duration)
        } else {
            const start = this.filter.z
            const startA = this.alpha
            const end = 1.1
            const endA = .3

            for (const r of this.clusterRectangles) r.zIndex = 0

            tween(t => {
                for (const r of this.clusterRectangles) {
                    r.filter.z = lerp(start, end, t)
                    r.alpha = lerp(startA, endA, t)
                }
            }, duration)
        }
    }
}
