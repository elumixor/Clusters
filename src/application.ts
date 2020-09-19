import * as PIXI from "pixi.js"
import {Scene} from "./scenes"
import {Container} from "pixi.js"
import {loadFonts} from "./shared"

class Application {
    private _app: PIXI.Application
    get app() { return this._app }

    private _scene: Scene
    set scene(value: Scene) {
        if (this._scene) this._scene.destroy()
        this._scene = value
        this._scene.initialize()

        if (this.currentUpdate) this.app.ticker.remove(this.currentUpdate)
        this.app.ticker.add(this.currentUpdate = this.scene.update)
    }
    get scene(): Scene { return this._scene }

    get center() {return {x: this.app.screen.width / 2, y: this.app.screen.height / 2}}

    centerElement(element: Container) {
        element.x = this.center.x - element.width / 2
        element.y = this.center.y - element.height / 2
    }

    private currentUpdate: (delta: number) => void

    async initialize() {
        await loadFonts(['Indie Flower'])

        this._app = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight, antialias: true, resolution: 1, autoDensity: true,
        })

        window.addEventListener('resize', () => this.onResize())
        window.addEventListener('load', () => this.onResize())

        document.body.appendChild(this.app.view)
    }

    private onResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight)
        this.scene?.resize()
    }
}

export const application = new Application()
