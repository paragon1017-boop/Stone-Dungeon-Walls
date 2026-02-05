// WebGL Core Renderer
// Handles context creation, shader compilation, and rendering

export interface WebGLContext {
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
}

export interface ShaderProgram {
    program: WebGLProgram;
    uniforms: Map<string, WebGLUniformLocation>;
    attributes: Map<string, number>;
}

export interface TextureInfo {
    texture: WebGLTexture;
    width: number;
    height: number;
}

// Create WebGL2 context
export function createWebGLContext(canvas: HTMLCanvasElement): WebGLContext | null {
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance'
    });
    
    if (!gl) {
        console.error('WebGL2 not supported');
        return null;
    }
    
    return { gl, canvas };
}

// Compile shader
export function compileShader(
    gl: WebGL2RenderingContext,
    source: string,
    type: number
): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

// Create shader program
export function createShaderProgram(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string
): ShaderProgram | null {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    
    // Clean up shaders
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    // Get uniforms and attributes
    const uniforms = new Map<string, WebGLUniformLocation>();
    const attributes = new Map<string, number>();
    
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) {
            const location = gl.getUniformLocation(program, info.name);
            if (location) uniforms.set(info.name, location);
        }
    }
    
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttributes; i++) {
        const info = gl.getActiveAttrib(program, i);
        if (info) {
            const location = gl.getAttribLocation(program, info.name);
            attributes.set(info.name, location);
        }
    }
    
    return { program, uniforms, attributes };
}

// Load texture from URL
export async function loadTexture(
    gl: WebGL2RenderingContext,
    url: string
): Promise<TextureInfo | null> {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        image.onload = () => {
            const texture = gl.createTexture();
            if (!texture) {
                resolve(null);
                return;
            }
            
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            
            resolve({
                texture,
                width: image.width,
                height: image.height
            });
        };
        
        image.onerror = () => {
            console.error('Failed to load texture:', url);
            resolve(null);
        };
        
        image.src = url;
    });
}

// Create buffer
export function createBuffer(
    gl: WebGL2RenderingContext,
    data: Float32Array,
    usage: number = WebGLRenderingContext.STATIC_DRAW
): WebGLBuffer {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    
    return buffer;
}

// Create index buffer
export function createIndexBuffer(
    gl: WebGL2RenderingContext,
    data: Uint16Array,
    usage: number = WebGLRenderingContext.STATIC_DRAW
): WebGLBuffer {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create index buffer');
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage);
    
    return buffer;
}

// Matrix utilities (simplified)
export function createPerspectiveMatrix(
    fov: number,
    aspect: number,
    near: number,
    far: number
): Float32Array {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ]);
}

export function createLookAtMatrix(
    eye: [number, number, number],
    center: [number, number, number],
    up: [number, number, number]
): Float32Array {
    const zAxis = normalize(subtract(eye, center));
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);
    
    return new Float32Array([
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
    ]);
}

export function createIdentityMatrix(): Float32Array {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

export function multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[i * 4 + k] * b[k * 4 + j];
            }
            result[i * 4 + j] = sum;
        }
    }
    return result;
}

export function createTranslationMatrix(x: number, y: number, z: number): Float32Array {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ]);
}

export function createScaleMatrix(x: number, y: number, z: number): Float32Array {
    return new Float32Array([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ]);
}

export function createRotationYMatrix(angle: number): Float32Array {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return new Float32Array([
        c, 0, s, 0,
        0, 1, 0, 0,
        -s, 0, c, 0,
        0, 0, 0, 1
    ]);
}

// Vector utilities
function normalize(v: [number, number, number]): [number, number, number] {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

function subtract(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function dot(a: [number, number, number], b: [number, number, number]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
