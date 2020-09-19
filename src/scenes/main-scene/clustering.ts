import {RectObject} from "./objects/rect/rect.object"

export class Chunk {
    private _references?: Chunk = null
    set references(value: Chunk) {
        this._references = value
        value.referencedBy = this
    }
    get references(): Chunk { return this._references }

    referencedBy?: Chunk = null
    rects: RectObject[] = []

    push(rect: RectObject) { this.rects.push(rect) }

    get rectsCount(): number {
        return this.rects.length + (this.referencedBy?.rectsCount || 0)
    }
    get allRects(): RectObject[] { return [...this.rects, ...(this.referencedBy?.allRects || [])]}

    clearReferences() {
        this._references = null
        this.referencedBy = null
    }

    get isComplete(): boolean { return this.rectsCount > 2 }
}


export function findClusters(rects: RectObject[], columns: number): Chunk[] {
    let previousColor: number = null
    function getTopRect(i: number): RectObject {
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

    const baseChunks = chunks.filter(c => c.references === null)
    for (const baseChunk of baseChunks) {
        const rects = []
        for (const rect of baseChunk.allRects) {
            rect.chunk = baseChunk
            rects.push(rect)
        }

        baseChunk.rects = rects
        baseChunk.clearReferences()
    }

    return baseChunks.filter(c => c.rectsCount > 2)
}
