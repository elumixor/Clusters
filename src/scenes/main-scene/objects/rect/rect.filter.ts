import * as PIXI from "pixi.js"

export class RectFilter extends PIXI.Filter {
    private static readonly vertexShader = `
        attribute vec2 aVertexPosition;    
        attribute vec2 aTextureCoord;    

        uniform mat3 projectionMatrix;
        
        varying vec2 vTextureCoord;
    
        uniform float z;
    
        void main(void) {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, z);
            vTextureCoord = aTextureCoord;
        } 
    `

    private static readonly fragmentShader = `
        uniform vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float a;
        
        void main(void) {
            vec4 color = texture2D(uSampler, vTextureCoord) * a;
            gl_FragColor = color;
        }
    `

    // uniforms: {z: number}

    constructor() {
        // const uniforms = {z: 1}
        super(RectFilter.vertexShader, RectFilter.fragmentShader, {z: 1, a: 1})
    }

    get z(): number { return this.uniforms.z }
    set z(value: number) { this.uniforms.z = value }

    get a(): number { return this.uniforms.a }
    set a(value: number) { this.uniforms.a = value }
}
