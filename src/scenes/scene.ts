import {application} from "../application";
import {Container} from "pixi.js";

export abstract class Scene {
    protected get stage(): PIXI.Container { return application.app.stage }
    protected stageElements: Container[] = []

    destroy(): void {
        for (const stageElement of this.stageElements) this.stage.removeChild(stageElement)
        this.stageElements = []
    }

    initialize(): void {}
    update(delta: number): void {}


    protected addStageElement(element: Container) {
        this.stageElements.push(element)
        this.stage.addChild(element)
    }
    protected removeStageElement(element: Container) {
        this.stageElements.splice(this.stageElements.indexOf(element), 1)
        this.stage.removeChild(element)
    }
}
