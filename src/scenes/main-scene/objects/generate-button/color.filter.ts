import {Filter} from "pixi.js"
import {tween} from "../../../../shared"
import * as PIXI from 'pixi.js'
import {Easings} from "../../../../shared/tweening"

export class ColorFilter extends Filter {
    constructor() {
        super(`
        attribute vec2 aVertexPosition;    
        attribute vec2 aTextureCoord;    

        uniform mat3 projectionMatrix;
        
        varying vec2 vTextureCoord;
    
        uniform float offset;
    
        void main(void) {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, offset);
            vTextureCoord = aTextureCoord;
        } 
    `, `
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float highlight;
        uniform vec4 highlightColor;
        
        void main(void) {
           vec4 color = texture2D(uSampler, vTextureCoord);
           
           float t = clamp(abs(vTextureCoord.x - (highlight * 1.5 - 1.0)), 0.0, 1.0);
           gl_FragColor = color * t + (1.0 - t) * highlightColor * color.a;
        }
    `, {
            highlight: 0, highlightColor: [.5, .1, 1.0, 1.0], offset: 1,
        })
    }

    set highlightColor(value: number[]) { this.uniforms.highlightColor = value }
    get highlightColor(): number[] { return this.uniforms.highlightColor }

    focus() {
        const startHighlight = 0
        const endHighlight = 1

        const startOffset = this.uniforms.offset
        const endOffset = .95

        tween(p => {
            this.uniforms.highlight = p * endHighlight + (1 - p) * startHighlight
            this.uniforms.offset = p * endOffset + (1 - p) * startOffset
        }, 50, Easings.easeOutQuad)
    }

    focusOut() {
        const startHighlight = this.uniforms.highlight
        const endHighlight = 2

        const startOffset = this.uniforms.offset
        const endOffset = 1

        tween(p => {
            this.uniforms.highlight = p * endHighlight + (1 - p) * startHighlight
            this.uniforms.offset = p * endOffset + (1 - p) * startOffset
        }, 50, Easings.easeOutQuad)
    }
}
