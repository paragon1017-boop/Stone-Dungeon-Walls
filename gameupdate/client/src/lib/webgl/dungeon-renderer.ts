// Main WebGL Dungeon Renderer - 2.5D Raycasting Style
import { 
    WebGLContext, ShaderProgram, createShaderProgram, 
    createBuffer
} from './renderer';
import { TextureManager } from './textures';
import { MonsterMesh, createMonsterBoxMesh, getMonsterSize } from './models';
import { castRays, RayHit, generateWallStrips, WallStrip } from './raycaster';

// Import shader source
import wallVertShader from './shaders/wall.vert?raw';
import wallFragShader from './shaders/wall.frag?raw';
import skyVertShader from './shaders/wall.vert?raw';
import skyFragShader from './shaders/sky.frag?raw';
import monsterVertShader from './shaders/monster.vert?raw';
import monsterFragShader from './shaders/monster.frag?raw';

interface RenderMonster {
    id: string;
    name: string;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    textureUrl: string;
    mesh?: MonsterMesh;
    texture?: WebGLTexture;
    animationState: 'idle' | 'attack' | 'hit' | 'death' | 'entrance';
    hitFlash: number;
}

export class DungeonRenderer {
    private gl: WebGL2RenderingContext;
    private canvas: HTMLCanvasElement;
    private textureManager: TextureManager;
    
    // Shaders
    private wallProgram: ShaderProgram | null = null;
    private skyProgram: ShaderProgram | null = null;
    private monsterProgram: ShaderProgram | null = null;
    
    // Buffers
    private wallVertexBuffer: WebGLBuffer | null = null;
    private wallTexCoordBuffer: WebGLBuffer | null = null;
    private skyVertexBuffer: WebGLBuffer | null = null;
    
    // State
    private loaded = false;
    private currentLevel = 1;
    private monsters: Map<string, RenderMonster> = new Map();
    
    // Camera
    private cameraPos: [number, number] = [0.5, 0.5];
    private cameraDir: number = 0;
    
    // Rendering settings
    private columnWidth = 2;  // 2-4 pixels per ray
    private fogStart = 3.0;
    private fogEnd = 15.0;
    
    // Cache for raycast data
    private lastRaycast: { x: number; y: number; dir: number; hits: RayHit[] } | null = null;

    constructor(context: WebGLContext) {
        this.gl = context.gl;
        this.canvas = context.canvas;
        this.textureManager = new TextureManager(this.gl);
        
        this.init();
    }

    private init(): void {
        // Compile shaders
        this.wallProgram = createShaderProgram(this.gl, wallVertShader, wallFragShader);
        this.skyProgram = createShaderProgram(this.gl, skyVertShader, skyFragShader);
        this.monsterProgram = createShaderProgram(this.gl, monsterVertShader, monsterFragShader);
        
        if (!this.wallProgram || !this.skyProgram || !this.monsterProgram) {
            console.error('Failed to compile shaders');
            return;
        }

        // Create buffers
        this.createSkyBuffer();
        
        // Set up WebGL state
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        this.loaded = true;
    }

    private createSkyBuffer(): void {
        // Full screen quad for sky/background
        const vertices = new Float32Array([
            0, 0,
            this.canvas.width, 0,
            this.canvas.width, this.canvas.height,
            0, this.canvas.height
        ]);
        
        this.skyVertexBuffer = createBuffer(this.gl, vertices);
    }

    // Set camera position and direction
    setCamera(x: number, y: number, direction: number): void {
        this.cameraPos = [x + 0.5, y + 0.5];
        this.cameraDir = direction;
        // Clear raycast cache when camera moves
        this.lastRaycast = null;
    }

    // Load level textures
    async loadLevel(level: number): Promise<void> {
        this.currentLevel = level;
        await this.textureManager.preloadLevelTextures(level);
    }

    // Add/update monsters
    setMonsters(monsters: RenderMonster[]): void {
        for (const monster of monsters) {
            const existing = this.monsters.get(monster.id);
            if (existing) {
                existing.x = monster.x;
                existing.y = monster.y;
                existing.hp = monster.hp;
                existing.animationState = monster.animationState;
                existing.hitFlash = monster.hitFlash;
            } else {
                const size = getMonsterSize(monster.name);
                const mesh = createMonsterBoxMesh(this.gl, size.width, size.height, size.depth);
                monster.mesh = mesh;
                this.monsters.set(monster.id, monster);
                this.loadMonsterTexture(monster.id, monster.textureUrl);
            }
        }
        
        // Remove dead monsters
        const currentIds = new Set(monsters.map(m => m.id));
        Array.from(this.monsters.entries()).forEach(([id, monster]) => {
            if (!currentIds.has(id)) {
                if (monster.mesh) {
                    this.gl.deleteBuffer(monster.mesh.vertexBuffer);
                    this.gl.deleteBuffer(monster.mesh.texCoordBuffer);
                    this.gl.deleteBuffer(monster.mesh.indexBuffer);
                }
                this.monsters.delete(id);
            }
        });
    }

    private async loadMonsterTexture(id: string, url: string): Promise<void> {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const texture = this.gl.createTexture();
            if (!texture) return;
            
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            
            this.monsters.get(id)!.texture = texture;
        };
        image.src = url;
    }

    // Main render function
    render(map: number[][], visualX?: number, visualY?: number): void {
        if (!this.loaded) return;
        
        const gl = this.gl;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Clear screen
        gl.clearColor(0.02, 0.02, 0.03, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Use visual position for smooth movement
        const renderX = visualX !== undefined ? visualX + 0.5 : this.cameraPos[0];
        const renderY = visualY !== undefined ? visualY + 0.5 : this.cameraPos[1];
        
        // Render sky/background first
        this.renderSky(w, h);
        
        // Raycast and render walls
        this.renderWalls(map, renderX, renderY, w, h);
        
        // Render monsters
        this.renderMonsters(renderX, renderY, w, h);
    }

    private renderSky(width: number, height: number): void {
        if (!this.skyProgram || !this.skyVertexBuffer) return;
        
        const gl = this.gl;
        const program = this.skyProgram;
        
        gl.useProgram(program.program);
        gl.disable(gl.DEPTH_TEST);
        
        // Set uniforms
        const screenSizeLoc = program.uniforms.get('u_screenSize');
        if (screenSizeLoc) gl.uniform2f(screenSizeLoc, width, height);
        
        // Colors
        const ceilLoc = program.uniforms.get('u_ceilingColor');
        const floorLoc = program.uniforms.get('u_floorColor');
        const fogLoc = program.uniforms.get('u_fogColor');
        
        if (ceilLoc) gl.uniform3f(ceilLoc, 0.05, 0.05, 0.07);
        if (floorLoc) gl.uniform3f(floorLoc, 0.04, 0.04, 0.06);
        if (fogLoc) gl.uniform3f(fogLoc, 0.02, 0.02, 0.03);
        
        // Bind and draw full-screen quad
        const posLoc = program.attributes.get('a_position');
        if (posLoc !== undefined && posLoc >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.skyVertexBuffer);
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        }
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.enable(gl.DEPTH_TEST);
    }

    private renderWalls(map: number[][], posX: number, posY: number, width: number, height: number): void {
        if (!this.wallProgram) return;
        
        const gl = this.gl;
        const program = this.wallProgram;
        
        // Check if we can reuse cached raycast
        let hits: RayHit[];
        if (this.lastRaycast && 
            Math.abs(this.lastRaycast.x - posX) < 0.01 && 
            Math.abs(this.lastRaycast.y - posY) < 0.01 && 
            this.lastRaycast.dir === this.cameraDir) {
            hits = this.lastRaycast.hits;
        } else {
            hits = castRays(map, posX, posY, this.cameraDir, width, this.columnWidth);
            this.lastRaycast = { x: posX, y: posY, dir: this.cameraDir, hits };
        }
        
        // Generate wall strips from hits
        const strips = generateWallStrips(hits, width, height, this.columnWidth);
        
        gl.useProgram(program.program);
        
        // Set uniforms
        const screenSizeLoc = program.uniforms.get('u_screenSize');
        const fogStartLoc = program.uniforms.get('u_fogStart');
        const fogEndLoc = program.uniforms.get('u_fogEnd');
        
        if (screenSizeLoc) gl.uniform2f(screenSizeLoc, width, height);
        if (fogStartLoc) gl.uniform1f(fogStartLoc, this.fogStart);
        if (fogEndLoc) gl.uniform1f(fogEndLoc, this.fogEnd);
        
        // Bind wall texture
        const textureUnit = 0;
        if (this.textureManager.bindTexture(`wall_${this.currentLevel}`, textureUnit)) {
            const texLoc = program.uniforms.get('u_texture');
            if (texLoc) gl.uniform1i(texLoc, textureUnit);
        }
        
        // Render each wall strip
        // We'll batch them by creating a single buffer with all strips
        const vertices: number[] = [];
        const texCoords: number[] = [];
        
        strips.forEach(strip => {
            const x = strip.x;
            const y = strip.y;
            const w = strip.width;
            const h = strip.height;
            
            // Encode distance in texture Y for fog calculation
            // We'll use the full texture height but encode distance info
            const distFactor = Math.min(strip.distance / 20.0, 1.0);
            
            // Triangle 1
            vertices.push(x, y, x + w, y, x + w, y + h);
            texCoords.push(strip.textureX, distFactor, strip.textureX, distFactor, strip.textureX, distFactor);
            
            // Triangle 2
            vertices.push(x, y, x + w, y + h, x, y + h);
            texCoords.push(strip.textureX, distFactor, strip.textureX, distFactor, strip.textureX, distFactor);
        });
        
        if (vertices.length > 0) {
            const vertBuffer = createBuffer(gl, new Float32Array(vertices), gl.DYNAMIC_DRAW);
            const texBuffer = createBuffer(gl, new Float32Array(texCoords), gl.DYNAMIC_DRAW);
            
            const posLoc = program.attributes.get('a_position');
            const texLoc = program.attributes.get('a_texCoord');
            
            if (posLoc !== undefined && posLoc >= 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
                gl.enableVertexAttribArray(posLoc);
                gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
            }
            
            if (texLoc !== undefined && texLoc >= 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
                gl.enableVertexAttribArray(texLoc);
                gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
            }
            
            gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
            
            // Clean up temp buffers
            gl.deleteBuffer(vertBuffer);
            gl.deleteBuffer(texBuffer);
        }
    }

    private renderMonsters(posX: number, posY: number, width: number, height: number): void {
        if (!this.monsterProgram) return;
        
        const gl = this.gl;
        
        // Sort monsters by distance (far to near)
        const sortedMonsters = Array.from(this.monsters.values())
            .filter(m => m.texture && m.mesh)
            .map(m => {
                const dx = m.x + 0.5 - posX;
                const dy = m.y + 0.5 - posY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                return { monster: m, distance: dist };
            })
            .sort((a, b) => b.distance - a.distance);
        
        // Render each monster as billboard
        sortedMonsters.forEach(({ monster, distance }) => {
            this.renderMonsterBillboard(monster, distance, posX, posY, width, height);
        });
    }

    private renderMonsterBillboard(monster: RenderMonster, distance: number, posX: number, posY: number, width: number, height: number): void {
        const gl = this.gl;
        const program = this.monsterProgram!;
        
        if (!monster.texture || !monster.mesh) return;
        
        // Calculate monster position on screen
        const dx = monster.x + 0.5 - posX;
        const dy = monster.y + 0.5 - posY;
        
        // Transform to camera space
        let camX: number, camY: number;
        switch (this.cameraDir) {
            case 0: // North
                camX = dx;
                camY = -dy;
                break;
            case 1: // East
                camX = -dy;
                camY = -dx;
                break;
            case 2: // South
                camX = -dx;
                camY = dy;
                break;
            case 3: // West
                camX = dy;
                camY = dx;
                break;
            default:
                camX = dx;
                camY = dy;
        }
        
        // Check if monster is behind camera
        if (camY <= 0) return;
        
        // Project to screen coordinates
        const fov = 0.66; // Standard 66 degree FOV plane
        const screenX = width / 2 + (camX / camY) * (width / 2) / fov;
        const spriteHeight = Math.abs(height / camY);
        const spriteWidth = spriteHeight; // Assume square sprites
        
        const drawY = height / 2 - spriteHeight / 2;
        const drawX = screenX - spriteWidth / 2;
        
        // Skip if off screen
        if (drawX + spriteWidth < 0 || drawX > width) return;
        
        // Set uniforms
        gl.useProgram(program.program);
        
        const modelLoc = program.uniforms.get('u_modelMatrix');
        const viewLoc = program.uniforms.get('u_viewMatrix');
        const projLoc = program.uniforms.get('u_projectionMatrix');
        const hitFlashLoc = program.uniforms.get('u_hitFlash');
        
        // Create simple projection matrix for 2D screen space
        if (projLoc) {
            const proj = new Float32Array([
                2/width, 0, 0, 0,
                0, -2/height, 0, 0,
                0, 0, 1, 0,
                -1, 1, 0, 1
            ]);
            gl.uniformMatrix4fv(projLoc, false, proj);
        }
        
        // View matrix is identity for 2D
        if (viewLoc) {
            gl.uniformMatrix4fv(viewLoc, false, new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]));
        }
        
        // Model matrix positions the sprite
        if (modelLoc) {
            gl.uniformMatrix4fv(modelLoc, false, new Float32Array([
                spriteWidth, 0, 0, 0,
                0, spriteHeight, 0, 0,
                0, 0, 1, 0,
                drawX, drawY, 0, 1
            ]));
        }
        
        if (hitFlashLoc) gl.uniform1f(hitFlashLoc, monster.hitFlash);
        
        // Bind texture
        const textureUnit = 0;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, monster.texture);
        const texLoc = program.uniforms.get('u_texture');
        if (texLoc) gl.uniform1i(texLoc, textureUnit);
        
        // Bind buffers and draw
        const posLoc = program.attributes.get('a_position');
        const texLocAttr = program.attributes.get('a_texCoord');
        
        if (posLoc !== undefined && posLoc >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, monster.mesh.vertexBuffer);
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        }
        
        if (texLocAttr !== undefined && texLocAttr >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, monster.mesh.texCoordBuffer);
            gl.enableVertexAttribArray(texLocAttr);
            gl.vertexAttribPointer(texLocAttr, 2, gl.FLOAT, false, 0, 0);
        }
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, monster.mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, monster.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    // Resize handler
    resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
        
        // Recreate sky buffer with new size
        if (this.skyVertexBuffer) {
            this.gl.deleteBuffer(this.skyVertexBuffer);
        }
        this.createSkyBuffer();
        
        // Clear cache
        this.lastRaycast = null;
    }

    // Cleanup
    dispose(): void {
        Array.from(this.monsters.values()).forEach(monster => {
            if (monster.mesh) {
                this.gl.deleteBuffer(monster.mesh.vertexBuffer);
                this.gl.deleteBuffer(monster.mesh.texCoordBuffer);
                this.gl.deleteBuffer(monster.mesh.indexBuffer);
            }
            if (monster.texture) {
                this.gl.deleteTexture(monster.texture);
            }
        });
        
        if (this.wallProgram) this.gl.deleteProgram(this.wallProgram.program);
        if (this.skyProgram) this.gl.deleteProgram(this.skyProgram.program);
        if (this.monsterProgram) this.gl.deleteProgram(this.monsterProgram.program);
        if (this.skyVertexBuffer) this.gl.deleteBuffer(this.skyVertexBuffer);
        
        this.textureManager.clear();
    }
}

export default DungeonRenderer;
