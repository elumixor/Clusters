import '../styles/main.scss'
import * as Fonts from "./common/fonts";
import {MainScene} from "./scenes";

Fonts.load(['Indie Flower']).then(() => {
    new MainScene()
})
