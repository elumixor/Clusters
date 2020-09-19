import '../styles/main.scss'
import {application} from "./application"
import * as scenes from "./scenes"

// Perform basic app initialization
application.initialize().then(() => {
    application.scene = scenes.main
})
