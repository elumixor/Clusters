import * as PIXI from "pixi.js"
import '../styles/main.scss'
import {Graphics, Rectangle, Text, TextStyle} from "pixi.js"
import sayHello = PIXI.utils.sayHello

const loader = PIXI.Loader.shared
const TextureCache = PIXI.utils.TextureCache

PIXI.utils.sayHello(PIXI.utils.isWebGLSupported() ? 'WebGL' : 'Canvas')

//Create a Pixi Application
let app = new PIXI.Application({
    width: 500,         // default: 800
    height: 500,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1,       // default: 1
})


//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view)

app.renderer.backgroundColor = 0x000000
app.renderer.autoDensity = true
app.renderer.resize(512, 512)

app.renderer.view.style.position = "absolute"
app.renderer.view.style.display = "block"

app.renderer.resize(window.innerWidth, window.innerHeight)


let cat: PIXI.Sprite
let images: PIXI.Container

// loader.onProgress.add(({progress}) => console.log(progress))
// loader.onStart.add(() => console.log('start'))
// loader.onLoad.add(() => console.log('load'))
// loader.onComplete.add(() => console.log('complete'))

loader
    .add("shark", "images/cat.png")
    .add("images/img2.png")
    .add("images/img3.png")
    .add("images/img4.png")
    .load(() => {
        cat = new PIXI.Sprite(TextureCache["shark"])

        images = new PIXI.Container()
        images.addChild(cat)

        cat.scale.x = 0.5
        cat.scale.y = 0.5

        cat.anchor.set(.5, .5)

        // images.pivot.set(app.screen.width / 2, app.screen.height / 2)

        images.x = app.screen.width / 2
        images.y = app.screen.height / 2

        app.ticker.add(delta => gameLoop(delta))


        const rectangle = new Graphics()
        // rectangle.beginFill(0xFFAA11)
        rectangle.lineStyle(1, 0xFFAA00)
        rectangle.drawRect(app.screen.width/2 - 100, app.screen.height/2 - 100, 200, 200)
        // rectangle.endFill()
        app.stage.addChild(rectangle)

        const message = new Text("Hello Pixi!", new TextStyle({
            fontFamily: "Arial",
            fontSize: 36,
            fill: "white",
            stroke: '#ff3300',
            strokeThickness: 4,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        }))

        message.x = app.screen.width / 2 - message.width / 2
        message.y = app.screen.height / 2 + 200
        app.stage.addChild(message);
        app.stage.addChild(images)
    })

function gameLoop(deltaTime: number) {
    images.rotation += 0.01 * deltaTime
}

window.addEventListener('click', () => {
    cat.visible = !cat.visible
})

