# Advanced Rendering Optimizations for TypeScript Dungeon Games

## Table of Contents
1. [Dirty Rectangle Rendering](#dirty-rectangle-rendering)
2. [OffscreenCanvas & Web Workers](#offscreencanvas--web-workers)
3. [Level of Detail (LOD) System](#level-of-detail-lod-system)
4. [Batch Rendering](#batch-rendering)
5. [Tile-Based Rendering Cache](#tile-based-rendering-cache)
6. [Shadow & Lighting Optimization](#shadow--lighting-optimization)
7. [Particle System Optimization](#particle-system-optimization)
8. [WebGL Renderer (Advanced)](#webgl-renderer-advanced)
9. [Render Queuing & Depth Sorting](#render-queuing--depth-sorting)
10. [Occlusion Culling](#occlusion-culling)

---

## 1. Dirty Rectangle Rendering

Only redraw portions of the canvas that actually changed. This is extremely effective for dungeon games where most of the screen is static.

```typescript
class DirtyRectManager {
  private dirtyRects: Set<string> = new Set();
  private tileSize = 32;
  
  markDirty(x: number, y: number, width: number, height: number) {
    // Convert world coordinates to tile coordinates
    const startX = Math.floor(x / this.tileSize);
    const startY = Math.floor(y / this.tileSize);
    const endX = Math.ceil((x + width) / this.tileSize);
    const endY = Math.ceil((y + height) / this.tileSize);
    
    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        this.dirtyRects.add(`${tx},${ty}`);
      }
    }
  }
  
  getDirtyRects(): { x: number; y: number; width: number; height: number }[] {
    const rects: { x: number; y: number; width: number; height: number }[] = [];
    
    for (const key of this.dirtyRects) {
      const [x, y] = key.split(',').map(Number);
      rects.push({
        x: x * this.tileSize,
        y: y * this.tileSize,
        width: this.tileSize,
        height: this.tileSize
      });
    }
    
    return rects;
  }
  
  clear() {
    this.dirtyRects.clear();
  }
}

// Usage in game loop
const dirtyRectManager = new DirtyRectManager();

function update() {
  // Mark areas where entities moved
  for (const entity of entities) {
    if (entity.moved) {
      dirtyRectManager.markDirty(
        entity.previousX, 
        entity.previousY, 
        entity.width, 
        entity.height
      );
      dirtyRectManager.markDirty(
        entity.x, 
        entity.y, 
        entity.width, 
        entity.height
      );
    }
  }
}

function render(ctx: CanvasRenderingContext2D) {
  const dirtyRects = dirtyRectManager.getDirtyRects();
  
  for (const rect of dirtyRects) {
    // Clear only dirty area
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    
    // Redraw only entities in dirty area
    for (const entity of entities) {
      if (intersects(entity, rect)) {
        entity.draw(ctx);
      }
    }
  }
  
  dirtyRectManager.clear();
}
```

---

## 2. OffscreenCanvas & Web Workers

Move rendering to a background thread to keep the main thread responsive for game logic.

```typescript
// main.ts (Main Thread)
class GameRenderer {
  private worker: Worker;
  private offscreen: OffscreenCanvas;
  
  constructor(canvas: HTMLCanvasElement) {
    this.offscreen = canvas.transferControlToOffscreen();
    this.worker = new Worker('renderer-worker.js');
    
    // Transfer canvas to worker
    this.worker.postMessage({ 
      type: 'init', 
      canvas: this.offscreen 
    }, [this.offscreen]);
  }
  
  render(entities: any[], camera: any) {
    // Send render data to worker
    this.worker.postMessage({
      type: 'render',
      entities: entities,
      camera: camera
    });
  }
}

// renderer-worker.ts (Worker Thread)
let ctx: OffscreenCanvasRenderingContext2D;

self.onmessage = (e) => {
  if (e.data.type === 'init') {
    ctx = e.data.canvas.getContext('2d')!;
  } else if (e.data.type === 'render') {
    const { entities, camera } = e.data;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    for (const entity of entities) {
      // Render entity
      ctx.fillStyle = entity.color;
      ctx.fillRect(
        entity.x - camera.x,
        entity.y - camera.y,
        entity.width,
        entity.height
      );
    }
  }
};
```

---

## 3. Level of Detail (LOD) System

Render entities with different detail levels based on distance from camera.

```typescript
enum LODLevel {
  HIGH = 0,    // Full detail
  MEDIUM = 1,  // Simplified
  LOW = 2,     // Very simplified
  CULLED = 3   // Don't render
}

class LODSystem {
  private thresholds = {
    medium: 300,  // pixels from camera center
    low: 600,
    cull: 1000
  };
  
  getLODLevel(entity: Entity, camera: Camera): LODLevel {
    const centerX = camera.x + camera.width / 2;
    const centerY = camera.y + camera.height / 2;
    const entityCenterX = entity.x + entity.width / 2;
    const entityCenterY = entity.y + entity.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(entityCenterX - centerX, 2) + 
      Math.pow(entityCenterY - centerY, 2)
    );
    
    if (distance > this.thresholds.cull) return LODLevel.CULLED;
    if (distance > this.thresholds.low) return LODLevel.LOW;
    if (distance > this.thresholds.medium) return LODLevel.MEDIUM;
    return LODLevel.HIGH;
  }
}

class Enemy {
  draw(ctx: CanvasRenderingContext2D, lod: LODLevel) {
    switch (lod) {
      case LODLevel.HIGH:
        // Full detail - animations, shadows, details
        this.drawAnimated(ctx);
        this.drawShadow(ctx);
        this.drawHealthBar(ctx);
        break;
        
      case LODLevel.MEDIUM:
        // Medium - static sprite, no shadow
        this.drawStatic(ctx);
        this.drawHealthBar(ctx);
        break;
        
      case LODLevel.LOW:
        // Low - just a colored rectangle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        break;
        
      case LODLevel.CULLED:
        // Don't render
        break;
    }
  }
}

// Usage
const lodSystem = new LODSystem();

function render() {
  for (const entity of entities) {
    const lod = lodSystem.getLODLevel(entity, camera);
    entity.draw(ctx, lod);
  }
}
```

---

## 4. Batch Rendering

Group similar draw calls together to minimize context switches.

```typescript
class BatchRenderer {
  private batches = new Map<string, any[]>();
  
  add(type: string, data: any) {
    if (!this.batches.has(type)) {
      this.batches.set(type, []);
    }
    this.batches.get(type)!.push(data);
  }
  
  flush(ctx: CanvasRenderingContext2D) {
    // Render all tiles in one batch
    const tiles = this.batches.get('tile');
    if (tiles) {
      ctx.save();
      // Set common properties once
      ctx.imageSmoothingEnabled = false;
      
      for (const tile of tiles) {
        ctx.drawImage(
          tile.atlas,
          tile.sx, tile.sy, tile.sw, tile.sh,
          tile.x, tile.y, tile.w, tile.h
        );
      }
      ctx.restore();
    }
    
    // Render all enemies in one batch
    const enemies = this.batches.get('enemy');
    if (enemies) {
      ctx.save();
      
      for (const enemy of enemies) {
        ctx.drawImage(
          enemy.sprite,
          enemy.sx, enemy.sy, enemy.sw, enemy.sh,
          enemy.x, enemy.y, enemy.w, enemy.h
        );
      }
      ctx.restore();
    }
    
    // Clear batches
    this.batches.clear();
  }
}

// Usage
const batchRenderer = new BatchRenderer();

function render() {
  // Collect all render operations
  for (const tile of visibleTiles) {
    batchRenderer.add('tile', {
      atlas: tileAtlas,
      sx: tile.sourceX,
      sy: tile.sourceY,
      sw: 32,
      sh: 32,
      x: tile.x,
      y: tile.y,
      w: 32,
      h: 32
    });
  }
  
  for (const enemy of visibleEnemies) {
    batchRenderer.add('enemy', {
      sprite: enemySprite,
      sx: enemy.frameX,
      sy: enemy.frameY,
      sw: 32,
      sh: 32,
      x: enemy.x,
      y: enemy.y,
      w: 32,
      h: 32
    });
  }
  
  // Execute all batched operations
  batchRenderer.flush(ctx);
}
```

---

## 5. Tile-Based Rendering Cache

Pre-render static tile chunks and reuse them.

```typescript
class TileChunkCache {
  private chunkSize = 256; // pixels
  private cache = new Map<string, HTMLCanvasElement>();
  
  getChunkKey(x: number, y: number): string {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkY = Math.floor(y / this.chunkSize);
    return `${chunkX},${chunkY}`;
  }
  
  renderChunk(chunkX: number, chunkY: number, tiles: Tile[]): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.chunkSize;
    canvas.height = this.chunkSize;
    const ctx = canvas.getContext('2d')!;
    
    const startX = chunkX * this.chunkSize;
    const startY = chunkY * this.chunkSize;
    
    for (const tile of tiles) {
      if (tile.x >= startX && tile.x < startX + this.chunkSize &&
          tile.y >= startY && tile.y < startY + this.chunkSize) {
        ctx.drawImage(
          tile.image,
          tile.x - startX,
          tile.y - startY
        );
      }
    }
    
    return canvas;
  }
  
  getOrCreateChunk(x: number, y: number, tiles: Tile[]): HTMLCanvasElement {
    const key = this.getChunkKey(x, y);
    
    if (!this.cache.has(key)) {
      const chunkX = Math.floor(x / this.chunkSize);
      const chunkY = Math.floor(y / this.chunkSize);
      const chunk = this.renderChunk(chunkX, chunkY, tiles);
      this.cache.set(key, chunk);
    }
    
    return this.cache.get(key)!;
  }
  
  invalidateChunk(x: number, y: number) {
    const key = this.getChunkKey(x, y);
    this.cache.delete(key);
  }
}

// Usage
const chunkCache = new TileChunkCache();

function renderBackground(ctx: CanvasRenderingContext2D, camera: Camera) {
  const startChunkX = Math.floor(camera.x / 256);
  const startChunkY = Math.floor(camera.y / 256);
  const endChunkX = Math.ceil((camera.x + camera.width) / 256);
  const endChunkY = Math.ceil((camera.y + camera.height) / 256);
  
  for (let cy = startChunkY; cy <= endChunkY; cy++) {
    for (let cx = startChunkX; cx <= endChunkX; cx++) {
      const chunk = chunkCache.getOrCreateChunk(cx * 256, cy * 256, allTiles);
      ctx.drawImage(
        chunk,
        cx * 256 - camera.x,
        cy * 256 - camera.y
      );
    }
  }
}
```

---

## 6. Shadow & Lighting Optimization

Use pre-rendered shadow maps and efficient lighting calculations.

```typescript
class ShadowSystem {
  private shadowCanvas: HTMLCanvasElement;
  private shadowCtx: CanvasRenderingContext2D;
  
  constructor(width: number, height: number) {
    this.shadowCanvas = document.createElement('canvas');
    this.shadowCanvas.width = width;
    this.shadowCanvas.height = height;
    this.shadowCtx = this.shadowCanvas.getContext('2d')!;
  }
  
  // Pre-render shadows for static objects
  bakeStaticShadows(walls: Wall[]) {
    this.shadowCtx.clearRect(0, 0, this.shadowCanvas.width, this.shadowCanvas.height);
    this.shadowCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    
    for (const wall of walls) {
      // Simple offset shadow
      this.shadowCtx.fillRect(
        wall.x + 2,
        wall.y + 2,
        wall.width,
        wall.height
      );
    }
  }
  
  // Render dynamic shadows efficiently
  renderDynamicShadow(
    ctx: CanvasRenderingContext2D,
    entity: Entity,
    lightSource: { x: number; y: number }
  ) {
    const dx = entity.x - lightSource.x;
    const dy = entity.y - lightSource.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 500) return; // Too far for shadow
    
    const angle = Math.atan2(dy, dx);
    const shadowLength = Math.min(50, distance / 4);
    
    ctx.save();
    ctx.globalAlpha = 0.3 * (1 - distance / 500);
    ctx.fillStyle = '#000';
    
    // Simple blob shadow
    ctx.beginPath();
    ctx.ellipse(
      entity.x + Math.cos(angle) * shadowLength,
      entity.y + Math.sin(angle) * shadowLength,
      entity.width / 2,
      entity.height / 4,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
  
  getShadowCanvas(): HTMLCanvasElement {
    return this.shadowCanvas;
  }
}

// Simplified lighting using overlays
class LightingSystem {
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;
  
  constructor(width: number, height: number) {
    this.lightCanvas = document.createElement('canvas');
    this.lightCanvas.width = width;
    this.lightCanvas.height = height;
    this.lightCtx = this.lightCanvas.getContext('2d')!;
  }
  
  render(lights: Light[]) {
    // Fill with darkness
    this.lightCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
    
    // Use 'lighter' blend mode to add light
    this.lightCtx.globalCompositeOperation = 'lighter';
    
    for (const light of lights) {
      const gradient = this.lightCtx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, light.radius
      );
      
      gradient.addColorStop(0, `rgba(${light.r}, ${light.g}, ${light.b}, ${light.intensity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      this.lightCtx.fillStyle = gradient;
      this.lightCtx.fillRect(
        light.x - light.radius,
        light.y - light.radius,
        light.radius * 2,
        light.radius * 2
      );
    }
    
    this.lightCtx.globalCompositeOperation = 'source-over';
  }
  
  getLightCanvas(): HTMLCanvasElement {
    return this.lightCanvas;
  }
}

// Usage
const shadowSystem = new ShadowSystem(canvasWidth, canvasHeight);
const lightingSystem = new LightingSystem(canvasWidth, canvasHeight);

function render() {
  // 1. Draw background
  renderBackground(ctx);
  
  // 2. Draw static shadows (baked)
  ctx.drawImage(shadowSystem.getShadowCanvas(), 0, 0);
  
  // 3. Draw entities
  for (const entity of entities) {
    entity.draw(ctx);
    // Draw dynamic shadows for moving entities
    shadowSystem.renderDynamicShadow(ctx, entity, playerLight);
  }
  
  // 4. Apply lighting overlay
  lightingSystem.render(allLights);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(lightingSystem.getLightCanvas(), 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}
```

---

## 7. Particle System Optimization

Efficient particle rendering with pooling and instancing.

```typescript
class Particle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  life = 0;
  maxLife = 1;
  size = 2;
  color = '#fff';
  active = false;
  
  reset(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.color = color;
    this.active = true;
  }
  
  update(dt: number) {
    if (!this.active) return;
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    
    if (this.life <= 0) {
      this.active = false;
    }
  }
}

class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 500;
  private particleCanvas?: HTMLCanvasElement;
  private particleCtx?: CanvasRenderingContext2D;
  
  constructor() {
    // Pre-allocate particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(new Particle());
    }
    
    // Create offscreen canvas for particle rendering
    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.width = 800;
    this.particleCanvas.height = 600;
    this.particleCtx = this.particleCanvas.getContext('2d')!;
  }
  
  emit(x: number, y: number, count: number, config: any) {
    let emitted = 0;
    
    for (const particle of this.particles) {
      if (emitted >= count) break;
      if (!particle.active) {
        const angle = Math.random() * Math.PI * 2;
        const speed = config.speed + Math.random() * config.speedVariance;
        
        particle.reset(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          config.life + Math.random() * config.lifeVariance,
          config.size + Math.random() * config.sizeVariance,
          config.color
        );
        emitted++;
      }
    }
  }
  
  update(dt: number) {
    for (const particle of this.particles) {
      if (particle.active) {
        particle.update(dt);
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D) {
    // Batch render all particles
    ctx.save();
    
    // Group particles by color for batching
    const colorGroups = new Map<string, Particle[]>();
    
    for (const particle of this.particles) {
      if (!particle.active) continue;
      
      if (!colorGroups.has(particle.color)) {
        colorGroups.set(particle.color, []);
      }
      colorGroups.get(particle.color)!.push(particle);
    }
    
    // Render each color group in one batch
    for (const [color, group] of colorGroups) {
      ctx.fillStyle = color;
      
      for (const particle of group) {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        
        ctx.fillRect(
          Math.floor(particle.x),
          Math.floor(particle.y),
          particle.size,
          particle.size
        );
      }
    }
    
    ctx.restore();
  }
  
  getActiveCount(): number {
    return this.particles.filter(p => p.active).length;
  }
}
```

---

## 8. WebGL Renderer (Advanced)

Use WebGL for hardware-accelerated rendering (massive performance boost).

```typescript
class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private positionBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;
  
  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl')!;
    
    // Vertex shader
    const vsSource = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      
      uniform vec2 uResolution;
      uniform vec2 uCamera;
      
      varying vec2 vTexCoord;
      
      void main() {
        // Convert from pixels to clip space
        vec2 position = (aPosition - uCamera) / uResolution * 2.0 - 1.0;
        position.y *= -1.0;
        
        gl_Position = vec4(position, 0.0, 1.0);
        vTexCoord = aTexCoord;
      }
    `;
    
    // Fragment shader
    const fsSource = `
      precision mediump float;
      
      uniform sampler2D uTexture;
      varying vec2 vTexCoord;
      
      void main() {
        gl_FragColor = texture2D(uTexture, vTexCoord);
      }
    `;
    
    const vertexShader = this.compileShader(vsSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fsSource, this.gl.FRAGMENT_SHADER);
    
    this.program = this.gl.createProgram()!;
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    
    this.positionBuffer = this.gl.createBuffer()!;
    this.texCoordBuffer = this.gl.createBuffer()!;
  }
  
  private compileShader(source: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }
  
  drawSprite(
    texture: WebGLTexture,
    sx: number, sy: number, sw: number, sh: number,
    dx: number, dy: number, dw: number, dh: number
  ) {
    // Position vertices (screen space)
    const positions = new Float32Array([
      dx,      dy,
      dx + dw, dy,
      dx,      dy + dh,
      dx + dw, dy + dh
    ]);
    
    // Texture coordinates (normalized 0-1)
    const texCoords = new Float32Array([
      sx / 256, sy / 256,
      (sx + sw) / 256, sy / 256,
      sx / 256, (sy + sh) / 256,
      (sx + sw) / 256, (sy + sh) / 256
    ]);
    
    // Upload position data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.DYNAMIC_DRAW);
    
    const positionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
    this.gl.enableVertexAttribArray(positionLoc);
    this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);
    
    // Upload texcoord data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.DYNAMIC_DRAW);
    
    const texCoordLoc = this.gl.getAttribLocation(this.program, 'aTexCoord');
    this.gl.enableVertexAttribArray(texCoordLoc);
    this.gl.vertexAttribPointer(texCoordLoc, 2, this.gl.FLOAT, false, 0, 0);
    
    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
  
  clear(r: number, g: number, b: number) {
    this.gl.clearColor(r, g, b, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}
```

---

## 9. Render Queuing & Depth Sorting

Organize rendering by depth layers for proper z-ordering.

```typescript
enum RenderLayer {
  BACKGROUND = 0,
  FLOOR = 1,
  FLOOR_DECALS = 2,
  SHADOWS = 3,
  ENTITIES = 4,
  PARTICLES = 5,
  UI = 6
}

interface RenderCommand {
  layer: RenderLayer;
  z: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

class RenderQueue {
  private commands: RenderCommand[] = [];
  
  add(layer: RenderLayer, z: number, draw: (ctx: CanvasRenderingContext2D) => void) {
    this.commands.push({ layer, z, draw });
  }
  
  flush(ctx: CanvasRenderingContext2D) {
    // Sort by layer first, then by z within each layer
    this.commands.sort((a, b) => {
      if (a.layer !== b.layer) {
        return a.layer - b.layer;
      }
      return a.z - b.z;
    });
    
    // Execute all draw commands in order
    for (const cmd of this.commands) {
      cmd.draw(ctx);
    }
    
    this.commands.length = 0;
  }
}

// Usage
const renderQueue = new RenderQueue();

function render() {
  // Queue all render operations
  renderQueue.add(RenderLayer.BACKGROUND, 0, (ctx) => {
    drawBackground(ctx);
  });
  
  renderQueue.add(RenderLayer.FLOOR, 0, (ctx) => {
    drawFloor(ctx);
  });
  
  for (const entity of entities) {
    renderQueue.add(RenderLayer.ENTITIES, entity.y, (ctx) => {
      entity.draw(ctx);
    });
  }
  
  renderQueue.add(RenderLayer.UI, 0, (ctx) => {
    drawUI(ctx);
  });
  
  // Execute in sorted order
  renderQueue.flush(ctx);
}
```

---

## 10. Occlusion Culling

Don't render entities behind walls that block the view.

```typescript
class OcclusionSystem {
  private walls: Wall[] = [];
  
  setWalls(walls: Wall[]) {
    this.walls = walls;
  }
  
  isOccluded(entity: Entity, camera: Camera): boolean {
    const cameraCenter = {
      x: camera.x + camera.width / 2,
      y: camera.y + camera.height / 2
    };
    
    const entityCenter = {
      x: entity.x + entity.width / 2,
      y: entity.y + entity.height / 2
    };
    
    // Check if any wall blocks line of sight from camera to entity
    for (const wall of this.walls) {
      if (this.lineIntersectsRect(cameraCenter, entityCenter, wall)) {
        return true;
      }
    }
    
    return false;
  }
  
  private lineIntersectsRect(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    // Check intersection with all four edges of rectangle
    const edges = [
      { x1: rect.x, y1: rect.y, x2: rect.x + rect.width, y2: rect.y },
      { x1: rect.x + rect.width, y1: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height },
      { x1: rect.x + rect.width, y1: rect.y + rect.height, x2: rect.x, y2: rect.y + rect.height },
      { x1: rect.x, y1: rect.y + rect.height, x2: rect.x, y2: rect.y }
    ];
    
    for (const edge of edges) {
      if (this.lineIntersectsLine(p1, p2, { x: edge.x1, y: edge.y1 }, { x: edge.x2, y: edge.y2 })) {
        return true;
      }
    }
    
    return false;
  }
  
  private lineIntersectsLine(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    p4: { x: number; y: number }
  ): boolean {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0) return false;
    
    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
    
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }
}

// Usage
const occlusionSystem = new OcclusionSystem();
occlusionSystem.setWalls(dungeonWalls);

function render() {
  for (const entity of entities) {
    if (!occlusionSystem.isOccluded(entity, camera)) {
      entity.draw(ctx);
    }
  }
}
```

---

## Performance Impact Summary

| Technique | Performance Gain | Difficulty | Best For |
|-----------|-----------------|------------|----------|
| Dirty Rectangle | 2-5x | Medium | Static backgrounds |
| OffscreenCanvas | 1.5-3x | Hard | Heavy rendering |
| LOD System | 2-4x | Medium | Many entities |
| Batch Rendering | 2-6x | Easy | Sprite-based games |
| Tile Cache | 5-10x | Easy | Tile-based dungeons |
| Shadow Optimization | 3-5x | Medium | Lighting effects |
| Particle Optimization | 3-7x | Medium | Particle systems |
| WebGL Renderer | 5-20x | Very Hard | All rendering |
| Render Queue | 1.5-2x | Easy | Complex scenes |
| Occlusion Culling | 1.5-3x | Medium | Dense environments |

## Implementation Priority

**Start with these (biggest impact, easiest to implement):**
1. Tile-Based Rendering Cache
2. Batch Rendering
3. Viewport Culling (from previous guide)
4. LOD System

**Next tier:**
5. Dirty Rectangle Rendering
6. Shadow & Lighting Optimization
7. Particle System Optimization
8. Render Queue

**Advanced (when you need more):**
9. OffscreenCanvas & Web Workers
10. Occlusion Culling
11. WebGL Renderer (complete rewrite, but massive gains)
