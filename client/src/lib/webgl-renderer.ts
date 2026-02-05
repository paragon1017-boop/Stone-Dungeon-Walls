import { GameData, NORTH, EAST, SOUTH, WEST } from "./game-engine";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  varying vec2 v_texCoord;
  varying vec2 v_position;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_position = a_position;
  }
`;

const WALL_FRAGMENT_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_wallTexture;
  uniform sampler2D u_doorTexture;
  uniform float u_fogDensity;
  uniform vec3 u_fogColor;
  uniform float u_ambientLight;
  uniform float u_torchFlicker;
  
  varying vec2 v_texCoord;
  varying vec2 v_position;
  
  uniform float u_distances[256];
  uniform float u_texOffsets[256];
  uniform int u_wallTypes[256];
  uniform int u_screenWidth;
  uniform float u_lineHeight;
  
  void main() {
    int x = int(gl_FragCoord.x);
    if (x >= u_screenWidth) {
      discard;
    }
    
    float dist = u_distances[x];
    float texOffset = u_texOffsets[x];
    int wallType = u_wallTypes[x];
    
    float lineHeight = u_lineHeight / dist;
    float screenY = gl_FragCoord.y;
    float halfHeight = lineHeight / 2.0;
    float screenCenter = float(u_screenWidth) * 0.375;
    
    float wallTop = screenCenter - halfHeight;
    float wallBottom = screenCenter + halfHeight;
    
    if (screenY < wallTop || screenY > wallBottom) {
      discard;
    }
    
    float texY = (screenY - wallTop) / lineHeight;
    vec2 texCoord = vec2(texOffset, texY);
    
    vec4 color;
    if (wallType == 2) {
      color = texture2D(u_doorTexture, texCoord);
    } else {
      color = texture2D(u_wallTexture, texCoord);
    }
    
    float fog = exp(-u_fogDensity * dist * dist);
    fog = clamp(fog, 0.0, 1.0);
    
    float light = u_ambientLight + u_torchFlicker * 0.1;
    light *= (1.0 - dist * 0.05);
    light = clamp(light, 0.2, 1.0);
    
    color.rgb *= light;
    color.rgb = mix(u_fogColor, color.rgb, fog);
    
    gl_FragColor = color;
  }
`;

const FLOOR_CEILING_FRAGMENT_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_floorTexture;
  uniform vec2 u_playerPos;
  uniform vec2 u_dir;
  uniform vec2 u_plane;
  uniform float u_screenWidth;
  uniform float u_screenHeight;
  uniform float u_fogDensity;
  uniform vec3 u_fogColor;
  uniform float u_ambientLight;
  uniform float u_torchFlicker;
  uniform float u_isCeiling;
  
  varying vec2 v_position;
  
  void main() {
    float screenX = (v_position.x + 1.0) * 0.5 * u_screenWidth;
    float screenY = (v_position.y + 1.0) * 0.5 * u_screenHeight;
    
    float halfHeight = u_screenHeight / 2.0;
    float p;
    
    if (u_isCeiling > 0.5) {
      if (screenY > halfHeight) discard;
      p = halfHeight - screenY;
    } else {
      if (screenY < halfHeight) discard;
      p = screenY - halfHeight;
    }
    
    if (p < 1.0) p = 1.0;
    
    float rowDistance = halfHeight / p;
    
    float cameraX = (screenX / u_screenWidth) * 2.0 - 1.0;
    float floorX = u_playerPos.x + rowDistance * (u_dir.x + u_plane.x * cameraX);
    float floorY = u_playerPos.y + rowDistance * (u_dir.y + u_plane.y * cameraX);
    
    vec2 texCoord = fract(vec2(floorX, floorY));
    vec4 color = texture2D(u_floorTexture, texCoord);
    
    if (u_isCeiling > 0.5) {
      color.rgb *= 0.5;
    }
    
    float fog = exp(-u_fogDensity * rowDistance * rowDistance * 0.01);
    fog = clamp(fog, 0.0, 1.0);
    
    float light = u_ambientLight + u_torchFlicker * 0.05;
    light *= (1.0 - rowDistance * 0.02);
    light = clamp(light, 0.15, 1.0);
    
    color.rgb *= light;
    color.rgb = mix(u_fogColor, color.rgb, fog);
    
    gl_FragColor = color;
  }
`;

const FULLSCREEN_VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_position;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_position = a_position;
  }
`;

export interface WebGLRendererState {
  x: number;
  y: number;
  dir: number;
  level: number;
}

export class DungeonWebGLRenderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  
  private wallProgram: WebGLProgram | null = null;
  private floorProgram: WebGLProgram | null = null;
  
  private wallTexture: WebGLTexture | null = null;
  private floorTexture: WebGLTexture | null = null;
  private doorTexture: WebGLTexture | null = null;
  
  private quadBuffer: WebGLBuffer | null = null;
  
  private lastState: WebGLRendererState | null = null;
  private currentLevel: number = 0;
  
  private torchFlicker: number = 1.0;
  private flickerTime: number = 0;
  
  private texturesLoaded: boolean = false;
  private pendingTextures: number = 0;

  constructor() {}

  init(canvas: HTMLCanvasElement): boolean {
    this.canvas = canvas;
    
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    });
    
    if (!gl) {
      console.error("WebGL not supported");
      return false;
    }
    
    this.gl = gl;
    
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    this.wallProgram = this.createProgram(VERTEX_SHADER, WALL_FRAGMENT_SHADER);
    this.floorProgram = this.createProgram(FULLSCREEN_VERTEX_SHADER, FLOOR_CEILING_FRAGMENT_SHADER);
    
    if (!this.wallProgram || !this.floorProgram) {
      console.error("Failed to create shader programs");
      return false;
    }
    
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const quadVerts = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
    
    return true;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl!;
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram | null {
    const gl = this.gl!;
    
    const vertShader = this.createShader(gl.VERTEX_SHADER, vertSrc);
    const fragShader = this.createShader(gl.FRAGMENT_SHADER, fragSrc);
    
    if (!vertShader || !fragShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }

  loadTextures(level: number): void {
    if (this.currentLevel === level && this.texturesLoaded) return;
    
    this.currentLevel = level;
    this.texturesLoaded = false;
    this.pendingTextures = 3;
    
    const lvl = Math.max(1, Math.min(10, level));
    
    this.loadTexture(`/assets/textures/wall_${lvl}.png`, (tex) => {
      this.wallTexture = tex;
      this.checkTexturesLoaded();
    });
    
    this.loadTexture(`/assets/textures/floor_${lvl}.png`, (tex) => {
      this.floorTexture = tex;
      this.checkTexturesLoaded();
    });
    
    this.loadTexture("/assets/textures/door_metal.png", (tex) => {
      this.doorTexture = tex;
      this.checkTexturesLoaded();
    });
  }

  private loadTexture(url: string, callback: (tex: WebGLTexture | null) => void): void {
    const gl = this.gl!;
    const texture = gl.createTexture();
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      callback(texture);
    };
    img.onerror = () => {
      callback(null);
    };
    img.src = url;
  }

  private checkTexturesLoaded(): void {
    this.pendingTextures--;
    if (this.pendingTextures <= 0) {
      this.texturesLoaded = true;
    }
  }

  render(gameData: GameData, visualX?: number, visualY?: number): void {
    const gl = this.gl;
    const canvas = this.canvas;
    if (!gl || !canvas) return;
    
    const currentX = visualX !== undefined ? visualX : gameData.x;
    const currentY = visualY !== undefined ? visualY : gameData.y;
    
    if (gameData.level !== this.currentLevel) {
      this.loadTextures(gameData.level);
    }
    
    this.flickerTime += 0.05;
    this.torchFlicker = 0.95 + Math.sin(this.flickerTime * 3.7) * 0.03 + 
                        Math.sin(this.flickerTime * 7.3) * 0.02;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    const posX = currentX + 0.5;
    const posY = currentY + 0.5;
    
    let dirX = 0, dirY = 0, planeX = 0, planeY = 0;
    switch (gameData.dir) {
      case NORTH: dirY = -1; planeX = 0.66; break;
      case SOUTH: dirY = 1; planeX = -0.66; break;
      case EAST: dirX = 1; planeY = 0.66; break;
      case WEST: dirX = -1; planeY = -0.66; break;
    }
    
    this.renderFloorCeiling(posX, posY, dirX, dirY, planeX, planeY, true);
    this.renderFloorCeiling(posX, posY, dirX, dirY, planeX, planeY, false);
    
    this.renderWalls(gameData.map, posX, posY, dirX, dirY, planeX, planeY);
    
    this.lastState = {
      x: currentX,
      y: currentY,
      dir: gameData.dir,
      level: gameData.level
    };
  }

  private renderFloorCeiling(
    posX: number, posY: number,
    dirX: number, dirY: number,
    planeX: number, planeY: number,
    isCeiling: boolean
  ): void {
    const gl = this.gl!;
    const program = this.floorProgram!;
    const canvas = this.canvas!;
    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.floorTexture);
    gl.uniform1i(gl.getUniformLocation(program, "u_floorTexture"), 0);
    
    gl.uniform2f(gl.getUniformLocation(program, "u_playerPos"), posX, posY);
    gl.uniform2f(gl.getUniformLocation(program, "u_dir"), dirX, dirY);
    gl.uniform2f(gl.getUniformLocation(program, "u_plane"), planeX, planeY);
    gl.uniform1f(gl.getUniformLocation(program, "u_screenWidth"), canvas.width);
    gl.uniform1f(gl.getUniformLocation(program, "u_screenHeight"), canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, "u_fogDensity"), 0.015);
    gl.uniform3f(gl.getUniformLocation(program, "u_fogColor"), 0.02, 0.02, 0.05);
    gl.uniform1f(gl.getUniformLocation(program, "u_ambientLight"), 0.7);
    gl.uniform1f(gl.getUniformLocation(program, "u_torchFlicker"), this.torchFlicker);
    gl.uniform1f(gl.getUniformLocation(program, "u_isCeiling"), isCeiling ? 1.0 : 0.0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private renderWalls(
    map: number[][],
    posX: number, posY: number,
    dirX: number, dirY: number,
    planeX: number, planeY: number
  ): void {
    const gl = this.gl!;
    const canvas = this.canvas!;
    const w = canvas.width;
    const h = canvas.height;
    
    const ctx2d = canvas.getContext("2d", { alpha: false });
    if (!ctx2d) return;
    
    for (let x = 0; x < w; x++) {
      const cameraX = (2 * x) / w - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;
      
      let mapX = Math.floor(posX);
      let mapY = Math.floor(posY);
      
      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);
      
      let stepX: number, stepY: number;
      let sideDistX: number, sideDistY: number;
      
      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (posX - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1 - posX) * deltaDistX;
      }
      
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (posY - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1 - posY) * deltaDistY;
      }
      
      let hit = 0;
      let side = 0;
      let wallType = 1;
      
      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        
        if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
          const tile = map[mapY][mapX];
          if (tile === 1 || tile === 2) {
            hit = 1;
            wallType = tile;
          }
        } else {
          hit = 1;
        }
      }
      
      let perpWallDist: number;
      if (side === 0) {
        perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
      } else {
        perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;
      }
      
      const lineHeight = Math.floor(h / perpWallDist);
      let drawStart = Math.floor(-lineHeight / 2 + h / 2);
      if (drawStart < 0) drawStart = 0;
      let drawEnd = Math.floor(lineHeight / 2 + h / 2);
      if (drawEnd >= h) drawEnd = h - 1;
      
      let wallX: number;
      if (side === 0) {
        wallX = posY + perpWallDist * rayDirY;
      } else {
        wallX = posX + perpWallDist * rayDirX;
      }
      wallX -= Math.floor(wallX);
      
      let shade = 1.0;
      if (side === 1) shade = 0.7;
      
      const fog = Math.exp(-0.015 * perpWallDist * perpWallDist);
      const light = Math.max(0.2, Math.min(1.0, 0.7 * this.torchFlicker * (1 - perpWallDist * 0.05)));
      
      const finalShade = shade * light * fog;
      
      const r = Math.floor(100 * finalShade);
      const g = Math.floor(90 * finalShade);
      const b = Math.floor(80 * finalShade);
      
      ctx2d.fillStyle = `rgb(${r},${g},${b})`;
      ctx2d.fillRect(x, drawStart, 1, drawEnd - drawStart);
    }
  }

  dispose(): void {
    const gl = this.gl;
    if (!gl) return;
    
    if (this.wallProgram) gl.deleteProgram(this.wallProgram);
    if (this.floorProgram) gl.deleteProgram(this.floorProgram);
    if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
    if (this.wallTexture) gl.deleteTexture(this.wallTexture);
    if (this.floorTexture) gl.deleteTexture(this.floorTexture);
    if (this.doorTexture) gl.deleteTexture(this.doorTexture);
    
    this.gl = null;
    this.canvas = null;
  }
}
