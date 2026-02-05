// Texture management for WebGL renderer
import { loadTexture, TextureInfo } from './renderer';

export class TextureManager {
    private gl: WebGL2RenderingContext;
    private textures: Map<string, TextureInfo> = new Map();
    private loadingPromises: Map<string, Promise<void>> = new Map();

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    // Load a texture and cache it
    async loadTexture(name: string, url: string): Promise<boolean> {
        if (this.textures.has(name)) return true;
        if (this.loadingPromises.has(name)) {
            await this.loadingPromises.get(name);
            return true;
        }

        const promise = (async () => {
            const texture = await loadTexture(this.gl, url);
            if (texture) {
                this.textures.set(name, texture);
            }
        })();

        this.loadingPromises.set(name, promise);
        await promise;
        return this.textures.has(name);
    }

    // Get a loaded texture
    getTexture(name: string): TextureInfo | undefined {
        return this.textures.get(name);
    }

    // Bind texture to a texture unit
    bindTexture(name: string, unit: number): boolean {
        const texture = this.textures.get(name);
        if (!texture) return false;

        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
        return true;
    }

    // Preload all dungeon textures for a level
    async preloadLevelTextures(level: number): Promise<void> {
        const lvl = Math.max(1, Math.min(10, level));
        
        const texturesToLoad = [
            { name: `wall_${lvl}`, url: `/assets/textures/wall_${lvl}.png` },
            { name: `floor_${lvl}`, url: `/assets/textures/floor_${lvl}.png` },
            { name: 'door', url: '/assets/textures/door_metal.png' }
        ];

        await Promise.all(
            texturesToLoad.map(t => this.loadTexture(t.name, t.url))
        );
    }

    // Clear all textures
    clear(): void {
        this.textures.forEach(tex => {
            this.gl.deleteTexture(tex.texture);
        });
        this.textures.clear();
        this.loadingPromises.clear();
    }
}
