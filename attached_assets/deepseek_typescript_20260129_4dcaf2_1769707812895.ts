export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private spriteSheet: HTMLImageElement;
  
  // Buffer locations
  private positionBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;
  
  // Shader uniform locations
  private uMatrixLocation: WebGLUniformLocation;
  private uTextureLocation: WebGLUniformLocation;
  private uColorLocation: WebGLUniformLocation;
  
  // Game state
  private cameraX: number = 0;
  private cameraY: number = 0;
  private zoom: number = 1.0;
  
  // Tile and sprite information
  private tileSize: number = 32;
  private sprites: Map<string, { x: number, y: number, width: number, height: number }> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('webgl2');
    if (!context) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = context;
    
    this.initWebGL();
    this.loadShader();
    this.setupBuffers();
    this.setupSpriteSheet();
  }

  private initWebGL(): void {
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0.05, 0.05, 0.1, 1.0);
  }

  private loadShader(): void {
    // Vertex shader
    const vsSource = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      uniform mat3 uMatrix;
      varying vec2 vTexCoord;
      
      void main() {
        vec3 position = uMatrix * vec3(aPosition, 1.0);
        gl_Position = vec4(position.xy, 0.0, 1.0);
        vTexCoord = aTexCoord;
      }
    `;
    
    // Fragment shader
    const fsSource = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      uniform vec4 uColor;
      
      void main() {
        vec4 texColor = texture2D(uTexture, vTexCoord);
        if (texColor.a < 0.1) {
          discard;
        }
        gl_FragColor = texColor * uColor;
      }
    `;
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    
    // Get attribute and uniform locations
    this.uMatrixLocation = this.gl.getUniformLocation(this.program, 'uMatrix')!;
    this.uTextureLocation = this.gl.getUniformLocation(this.program, 'uTexture')!;
    this.uColorLocation = this.gl.getUniformLocation(this.program, 'uColor')!;
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    
    return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      throw new Error('Program linking failed');
    }
    
    return program;
  }

  private setupBuffers(): void {
    // Create position buffer (for quad vertices)
    this.positionBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    
    const positions = [
      0.0, 0.0,  // bottom-left
      1.0, 0.0,  // bottom-right
      0.0, 1.0,  // top-left
      1.0, 1.0   // top-right
    ];
    
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    
    // Create texture coordinate buffer
    this.texCoordBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    
    const texCoords = [
      0.0, 1.0,  // bottom-left
      1.0, 1.0,  // bottom-right
      0.0, 0.0,  // top-left
      1.0, 0.0   // top-right
    ];
    
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
    
    // Create index buffer
    this.indexBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    const indices = [0, 1, 2, 2, 1, 3];
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
  }

  private setupSpriteSheet(): void {
    // Create a simple sprite sheet in memory
    this.spriteSheet = new Image();
    this.spriteSheet.onload = () => {
      this.createTexture();
    };
    
    // Create a canvas to generate our sprite sheet
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 256;
    spriteCanvas.height = 256;
    const spriteCtx = spriteCanvas.getContext('2d')!;
    
    // Fill background with transparency
    spriteCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    spriteCtx.fillRect(0, 0, 256, 256);
    
    // Define sprite regions (32x32 tiles in a 8x8 grid)
    this.sprites.set('floor', { x: 0, y: 0, width: 32, height: 32 });
    this.sprites.set('wall', { x: 32, y: 0, width: 32, height: 32 });
    this.sprites.set('player_fighter', { x: 64, y: 0, width: 32, height: 32 });
    this.sprites.set('player_mage', { x: 96, y: 0, width: 32, height: 32 });
    this.sprites.set('player_monk', { x: 128, y: 0, width: 32, height: 32 });
    this.sprites.set('monster', { x: 160, y: 0, width: 32, height: 32 });
    this.sprites.set('ladder_down', { x: 192, y: 0, width: 32, height: 32 });
    this.sprites.set('ladder_up', { x: 224, y: 0, width: 32, height: 32 });
    this.sprites.set('door', { x: 0, y: 32, width: 32, height: 32 });
    this.sprites.set('treasure', { x: 32, y: 32, width: 32, height: 32 });
    
    // Draw simple colored tiles for sprites
    // Floor (light brown)
    spriteCtx.fillStyle = '#8B7355';
    spriteCtx.fillRect(0, 0, 32, 32);
    spriteCtx.strokeStyle = '#6B5B45';
    spriteCtx.strokeRect(0, 0, 32, 32);
    
    // Wall (dark gray)
    spriteCtx.fillStyle = '#555555';
    spriteCtx.fillRect(32, 0, 32, 32);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        spriteCtx.fillStyle = '#666666';
        spriteCtx.fillRect(32 + i * 8, j * 8, 6, 6);
      }
    }
    
    // Fighter (red)
    spriteCtx.fillStyle = '#e74c3c';
    spriteCtx.fillRect(64, 0, 32, 32);
    spriteCtx.fillStyle = '#ffffff';
    spriteCtx.font = 'bold 20px Arial';
    spriteCtx.textAlign = 'center';
    spriteCtx.textBaseline = 'middle';
    spriteCtx.fillText('F', 80, 16);
    
    // Mage (purple)
    spriteCtx.fillStyle = '#9b59b6';
    spriteCtx.fillRect(96, 0, 32, 32);
    spriteCtx.fillStyle = '#ffffff';
    spriteCtx.fillText('M', 112, 16);
    
    // Monk (yellow)
    spriteCtx.fillStyle = '#f1c40f';
    spriteCtx.fillRect(128, 0, 32, 32);
    spriteCtx.fillStyle = '#ffffff';
    spriteCtx.fillText('K', 144, 16);
    
    // Monster (green)
    spriteCtx.fillStyle = '#27ae60';
    spriteCtx.fillRect(160, 0, 32, 32);
    spriteCtx.fillStyle = '#ffffff';
    spriteCtx.fillText('X', 176, 16);
    
    // Ladder down (blue)
    spriteCtx.fillStyle = '#3498db';
    spriteCtx.fillRect(192, 0, 32, 32);
    spriteCtx.fillStyle = '#ffffff';
    spriteCtx.fillText('↓', 208, 16);
    
    // Ladder up (orange)
    spriteCtx.fillStyle = '#e67e22';
    spriteCtx.fillRect(224, 0, 32, 32);
    spriteCtx.fillStyle = '#ffffff';
    spriteCtx.fillText('↑', 240, 16);
    
    // Door (brown)
    spriteCtx.fillStyle = '#8B4513';
    spriteCtx.fillRect(0, 32, 32, 32);
    spriteCtx.fillStyle = '#D2691E';
    spriteCtx.fillRect(12, 8, 8, 24);
    spriteCtx.fillRect(12, 8, 16, 4);
    
    // Treasure (gold)
    spriteCtx.fillStyle = '#FFD700';
    spriteCtx.fillRect(32, 32, 32, 32);
    spriteCtx.fillStyle = '#B8860B';
    spriteCtx.beginPath();
    spriteCtx.arc(48, 48, 12, 0, Math.PI * 2);
    spriteCtx.fill();
    
    // Convert canvas to image
    this.spriteSheet.src = spriteCanvas.toDataURL();
  }

  private createTexture(): void {
    this.texture = this.gl.createTexture()!;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.spriteSheet);
    
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    
    // Don't generate mipmaps for pixel art
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
  }

  public setCamera(x: number, y: number, zoom: number = 1.0): void {
    this.cameraX = x;
    this.cameraY = y;
    this.zoom = zoom;
  }

  public clear(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  public renderMap(map: number[][], playerX: number, playerY: number): void {
    if (!this.texture) return;
    
    this.gl.useProgram(this.program);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.uTextureLocation, 0);
    
    // Set up vertex attributes
    const aPosition = this.gl.getAttribLocation(this.program, 'aPosition');
    const aTexCoord = this.gl.getAttribLocation(this.program, 'aTexCoord');
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(aPosition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aPosition);
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aTexCoord);
    
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    // Calculate visible area
    const screenWidth = this.canvas.width;
    const screenHeight = this.canvas.height;
    const tilesX = Math.ceil(screenWidth / (this.tileSize * this.zoom));
    const tilesY = Math.ceil(screenHeight / (this.tileSize * this.zoom));
    
    const startX = Math.max(0, Math.floor(this.cameraX));
    const startY = Math.max(0, Math.floor(this.cameraY));
    const endX = Math.min(map[0].length, startX + tilesX + 1);
    const endY = Math.min(map.length, startY + tilesY + 1);
    
    // Render tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map[y][x];
        let spriteName = 'floor';
        
        switch (tile) {
          case 0: spriteName = 'floor'; break;
          case 1: spriteName = 'wall'; break;
          case 2: spriteName = 'door'; break;
          case 3: spriteName = 'ladder_down'; break;
          case 4: spriteName = 'ladder_up'; break;
        }
        
        this.renderSprite(spriteName, x, y, 1.0);
      }
    }
    
    // Render player
    this.renderSprite('player_fighter', playerX, playerY, 1.0);
  }

  private renderSprite(spriteName: string, worldX: number, worldY: number, alpha: number = 1.0): void {
    const sprite = this.sprites.get(spriteName);
    if (!sprite) {
      console.warn(`Sprite not found: ${spriteName}`);
      return;
    }
    
    // Calculate screen position
    const screenX = (worldX - this.cameraX) * this.tileSize * this.zoom;
    const screenY = (worldY - this.cameraY) * this.tileSize * this.zoom;
    const size = this.tileSize * this.zoom;
    
    // Convert sprite sheet coordinates to texture coordinates
    const texX = sprite.x / 256;
    const texY = sprite.y / 256;
    const texWidth = sprite.width / 256;
    const texHeight = sprite.height / 256;
    
    // Update texture coordinates for this specific sprite
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    const texCoords = new Float32Array([
      texX, texY + texHeight,          // bottom-left
      texX + texWidth, texY + texHeight, // bottom-right
      texX, texY,                      // top-left
      texX + texWidth, texY            // top-right
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.DYNAMIC_DRAW);
    
    // Create transformation matrix
    const scale = size / this.tileSize;
    const matrix = new Float32Array([
      scale, 0, 0,
      0, scale, 0,
      screenX / this.tileSize, screenY / this.tileSize, 1
    ]);
    
    // Set color (white by default, with alpha)
    this.gl.uniform4f(this.uColorLocation, 1.0, 1.0, 1.0, alpha);
    this.gl.uniformMatrix3fv(this.uMatrixLocation, false, matrix);
    
    // Draw the quad
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
    
    // Update projection matrix for pixel-perfect rendering
    const projectionMatrix = new Float32Array([
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ]);
    
    this.gl.useProgram(this.program);
    const uProjection = this.gl.getUniformLocation(this.program, 'uProjection');
    if (uProjection) {
      this.gl.uniformMatrix3fv(uProjection, false, projectionMatrix);
    }
  }

  public isReady(): boolean {
    return !!this.texture;
  }
}