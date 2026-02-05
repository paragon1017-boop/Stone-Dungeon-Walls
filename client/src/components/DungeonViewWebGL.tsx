import { useEffect, useRef, useCallback } from "react";
import { GameData, NORTH, EAST, SOUTH, WEST } from "@/lib/game-engine";

interface DungeonViewWebGLProps {
  gameData: GameData;
  className?: string;
  renderWidth?: number;
  renderHeight?: number;
  visualX?: number;
  visualY?: number;
}

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_position;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_position = (a_position + 1.0) * 0.5;
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  
  uniform sampler2D u_wallTexture;
  uniform sampler2D u_floorTexture;
  uniform sampler2D u_doorTexture;
  
  uniform vec2 u_resolution;
  uniform vec2 u_playerPos;
  uniform vec2 u_dir;
  uniform vec2 u_plane;
  uniform float u_time;
  uniform float u_ambientLight;
  
  uniform int u_mapWidth;
  uniform int u_mapHeight;
  uniform sampler2D u_mapTexture;
  
  varying vec2 v_position;
  
  float getMapTile(int x, int y) {
    if (x < 0 || x >= u_mapWidth || y < 0 || y >= u_mapHeight) {
      return 1.0;
    }
    vec2 uv = vec2((float(x) + 0.5) / float(u_mapWidth), (float(y) + 0.5) / float(u_mapHeight));
    return texture2D(u_mapTexture, uv).r * 255.0;
  }
  
  void main() {
    vec2 fragCoord = v_position * u_resolution;
    float x = fragCoord.x;
    float y = u_resolution.y - fragCoord.y;
    
    float w = u_resolution.x;
    float h = u_resolution.y;
    
    float cameraX = (2.0 * x / w) - 1.0;
    vec2 rayDir = u_dir + u_plane * cameraX;
    
    int mapX = int(floor(u_playerPos.x));
    int mapY = int(floor(u_playerPos.y));
    
    vec2 deltaDist = abs(vec2(1.0) / rayDir);
    
    int stepX = rayDir.x < 0.0 ? -1 : 1;
    int stepY = rayDir.y < 0.0 ? -1 : 1;
    
    float sideDistX = rayDir.x < 0.0 
      ? (u_playerPos.x - float(mapX)) * deltaDist.x 
      : (float(mapX) + 1.0 - u_playerPos.x) * deltaDist.x;
    float sideDistY = rayDir.y < 0.0 
      ? (u_playerPos.y - float(mapY)) * deltaDist.y 
      : (float(mapY) + 1.0 - u_playerPos.y) * deltaDist.y;
    
    bool hit = false;
    int side = 0;
    float wallType = 0.0;
    
    for (int i = 0; i < 64; i++) {
      if (hit) break;
      
      if (sideDistX < sideDistY) {
        sideDistX += deltaDist.x;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDist.y;
        mapY += stepY;
        side = 1;
      }
      
      float tile = getMapTile(mapX, mapY);
      if (tile >= 1.0) {
        hit = true;
        wallType = tile;
      }
    }
    
    float perpWallDist;
    if (side == 0) {
      perpWallDist = (float(mapX) - u_playerPos.x + (1.0 - float(stepX)) / 2.0) / rayDir.x;
    } else {
      perpWallDist = (float(mapY) - u_playerPos.y + (1.0 - float(stepY)) / 2.0) / rayDir.y;
    }
    
    perpWallDist = max(perpWallDist, 0.1);
    
    float lineHeight = h / perpWallDist;
    float drawStart = max(0.0, -lineHeight / 2.0 + h / 2.0);
    float drawEnd = min(h, lineHeight / 2.0 + h / 2.0);
    
    vec4 color = vec4(0.02, 0.02, 0.05, 1.0);
    
    if (y >= drawStart && y <= drawEnd && hit) {
      float wallX;
      if (side == 0) {
        wallX = u_playerPos.y + perpWallDist * rayDir.y;
      } else {
        wallX = u_playerPos.x + perpWallDist * rayDir.x;
      }
      wallX = fract(wallX);
      
      float texY = (y - drawStart) / (drawEnd - drawStart);
      vec2 texCoord = vec2(wallX, texY);
      
      if (wallType >= 2.0 && wallType < 3.0) {
        color = texture2D(u_doorTexture, texCoord);
      } else {
        color = texture2D(u_wallTexture, texCoord);
      }
      
      float shade = (side == 1) ? 0.7 : 1.0;
      
      float torchFlicker = 0.95 + sin(u_time * 3.7) * 0.03 + sin(u_time * 7.3) * 0.02;
      float light = u_ambientLight * torchFlicker * (1.0 - perpWallDist * 0.04);
      light = clamp(light, 0.15, 1.0);
      
      float fog = exp(-0.012 * perpWallDist * perpWallDist);
      fog = clamp(fog, 0.0, 1.0);
      
      color.rgb *= shade * light;
      color.rgb = mix(vec3(0.02, 0.02, 0.05), color.rgb, fog);
    }
    else if (y < h / 2.0) {
      float p = (h / 2.0) - y;
      if (p < 1.0) p = 1.0;
      float rowDistance = (h * 0.5) / p;
      
      vec2 floorPos = u_playerPos + rowDistance * (u_dir + u_plane * cameraX);
      vec2 texCoord = fract(floorPos);
      
      color = texture2D(u_floorTexture, texCoord);
      color.rgb *= 0.4;
      
      float torchFlicker = 0.95 + sin(u_time * 3.7) * 0.02;
      float light = u_ambientLight * torchFlicker * 0.6 * (1.0 - rowDistance * 0.015);
      light = clamp(light, 0.1, 0.8);
      
      float fog = exp(-0.008 * rowDistance * rowDistance);
      fog = clamp(fog, 0.0, 1.0);
      
      color.rgb *= light;
      color.rgb = mix(vec3(0.02, 0.02, 0.05), color.rgb, fog);
    }
    else {
      float p = y - (h / 2.0);
      if (p < 1.0) p = 1.0;
      float rowDistance = (h * 0.5) / p;
      
      vec2 floorPos = u_playerPos + rowDistance * (u_dir + u_plane * cameraX);
      vec2 texCoord = fract(floorPos);
      
      color = texture2D(u_floorTexture, texCoord);
      
      float torchFlicker = 0.95 + sin(u_time * 3.7) * 0.02;
      float light = u_ambientLight * torchFlicker * (1.0 - rowDistance * 0.02);
      light = clamp(light, 0.12, 1.0);
      
      float fog = exp(-0.01 * rowDistance * rowDistance);
      fog = clamp(fog, 0.0, 1.0);
      
      color.rgb *= light;
      color.rgb = mix(vec3(0.02, 0.02, 0.05), color.rgb, fog);
    }
    
    gl_FragColor = color;
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
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

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}

function loadTexture(gl: WebGLRenderingContext, url: string, callback: () => void): WebGLTexture | null {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
    new Uint8Array([128, 128, 128, 255]));
  
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    callback();
  };
  image.src = url;
  
  return texture;
}

export function DungeonViewWebGL({ 
  gameData, 
  className, 
  renderWidth = 800, 
  renderHeight = 600, 
  visualX, 
  visualY 
}: DungeonViewWebGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texturesRef = useRef<{
    wall: WebGLTexture | null;
    floor: WebGLTexture | null;
    door: WebGLTexture | null;
    map: WebGLTexture | null;
  }>({ wall: null, floor: null, door: null, map: null });
  const currentLevelRef = useRef<number>(-1);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    
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
    
    glRef.current = gl;
    
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    
    if (!vertexShader || !fragmentShader) {
      console.error("Failed to create shaders");
      return false;
    }
    
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error("Failed to create program");
      return false;
    }
    
    programRef.current = program;
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
    ]), gl.STATIC_DRAW);
    
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    
    return true;
  }, []);

  const updateMapTexture = useCallback((map: number[][]) => {
    const gl = glRef.current;
    if (!gl) return;
    
    const height = map.length;
    const width = map[0]?.length || 0;
    
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const tile = map[y][x];
        data[idx] = tile;
        data[idx + 1] = tile;
        data[idx + 2] = tile;
        data[idx + 3] = 255;
      }
    }
    
    if (!texturesRef.current.map) {
      texturesRef.current.map = gl.createTexture();
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texturesRef.current.map);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }, []);

  const loadLevelTextures = useCallback((level: number) => {
    const gl = glRef.current;
    if (!gl || currentLevelRef.current === level) return;
    
    currentLevelRef.current = level;
    const lvl = Math.max(1, Math.min(10, level));
    
    const onLoad = () => {};
    
    texturesRef.current.wall = loadTexture(gl, `/assets/textures/wall_${lvl}.png`, onLoad);
    texturesRef.current.floor = loadTexture(gl, `/assets/textures/floor_${lvl}.png`, onLoad);
    texturesRef.current.door = loadTexture(gl, "/assets/textures/door_metal.png", onLoad);
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    
    if (!gl || !program || !canvas) return;
    
    const currentX = (visualX !== undefined ? visualX : gameData.x) + 0.5;
    const currentY = (visualY !== undefined ? visualY : gameData.y) + 0.5;
    
    let dirX = 0, dirY = 0, planeX = 0, planeY = 0;
    switch (gameData.dir) {
      case NORTH: dirY = -1; planeX = 0.66; break;
      case SOUTH: dirY = 1; planeX = -0.66; break;
      case EAST: dirX = 1; planeY = 0.66; break;
      case WEST: dirX = -1; planeY = -0.66; break;
    }
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.02, 0.02, 0.05, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);
    
    const time = (performance.now() - startTimeRef.current) / 1000;
    
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);
    gl.uniform2f(gl.getUniformLocation(program, "u_playerPos"), currentX, currentY);
    gl.uniform2f(gl.getUniformLocation(program, "u_dir"), dirX, dirY);
    gl.uniform2f(gl.getUniformLocation(program, "u_plane"), planeX, planeY);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), time);
    gl.uniform1f(gl.getUniformLocation(program, "u_ambientLight"), 0.85);
    gl.uniform1i(gl.getUniformLocation(program, "u_mapWidth"), gameData.map[0]?.length || 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_mapHeight"), gameData.map.length);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texturesRef.current.wall);
    gl.uniform1i(gl.getUniformLocation(program, "u_wallTexture"), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texturesRef.current.floor);
    gl.uniform1i(gl.getUniformLocation(program, "u_floorTexture"), 1);
    
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texturesRef.current.door);
    gl.uniform1i(gl.getUniformLocation(program, "u_doorTexture"), 2);
    
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texturesRef.current.map);
    gl.uniform1i(gl.getUniformLocation(program, "u_mapTexture"), 3);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [gameData, visualX, visualY]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const initialized = initWebGL();
    if (!initialized) {
      console.error("Failed to initialize WebGL");
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initWebGL]);

  useEffect(() => {
    loadLevelTextures(gameData.level);
  }, [gameData.level, loadLevelTextures]);

  useEffect(() => {
    updateMapTexture(gameData.map);
  }, [gameData.map, updateMapTexture]);

  useEffect(() => {
    render();
  }, [render, gameData, visualX, visualY]);

  return (
    <canvas
      ref={canvasRef}
      width={renderWidth}
      height={renderHeight}
      className={className}
      style={{ imageRendering: "pixelated" }}
      data-testid="dungeon-view-webgl"
    />
  );
}
