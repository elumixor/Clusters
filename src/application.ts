import * as PIXI from "pixi.js"
import {Container} from "pixi.js";

function createApplication(): PIXI.Application {
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: true,
        resolution: 1,
        autoDensity: true,
    })

    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";

    const onResize = () => app.renderer.resize(window.innerWidth, window.innerHeight)

    window.addEventListener('resize', () => onResize())
    window.addEventListener('load', () => onResize())

    document.body.appendChild(app.view)

    return app
}

export const application = createApplication()
export const stage = application.stage
export const appScreen = application.screen

export function getCenterPoint() { return {x: appScreen.width / 2, y: appScreen.height / 2} }
export function centerElement(element: Container) {
    const c = getCenterPoint()
    element.position.set(c.x - element.width / 2, c.y - element.height / 2)
}
