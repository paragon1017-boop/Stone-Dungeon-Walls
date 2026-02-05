// 2.5D Raycaster - Classic Wolfenstein/Doom style raycasting
// Generates wall strip data for WebGL rendering

export interface RayHit {
  distance: number;      // Perpendicular distance (corrected for fisheye)
  textureX: number;      // 0.0 to 1.0 texture column coordinate
  side: 0 | 1;          // 0=x-side hit, 1=y-side hit (for lighting)
  isDoor: boolean;
  wallX: number;        // Grid X position of wall
  wallY: number;        // Grid Y position of wall
}

// Direction vectors for cardinal directions (0=N, 1=E, 2=S, 3=W)
const DIR_VECTORS = [
  { x: 0, y: -1 },   // North
  { x: 1, y: 0 },    // East
  { x: 0, y: 1 },    // South
  { x: -1, y: 0 }    // West
];

// Camera plane vectors (perpendicular to direction)
const PLANE_VECTORS = [
  { x: 0.66, y: 0 },     // North
  { x: 0, y: 0.66 },     // East
  { x: -0.66, y: 0 },    // South
  { x: 0, y: -0.66 }     // West
];

export function castRays(
  map: number[][],
  posX: number,
  posY: number,
  dir: number,
  screenWidth: number,
  columnWidth: number = 2
): RayHit[] {
  const hits: RayHit[] = [];
  const numColumns = Math.ceil(screenWidth / columnWidth);
  
  const dirVec = DIR_VECTORS[dir];
  const planeVec = PLANE_VECTORS[dir];
  
  for (let x = 0; x < numColumns; x++) {
    // Calculate ray position and direction
    const cameraX = 2 * x / numColumns - 1; // x-coordinate in camera space
    const rayDirX = dirVec.x + planeVec.x * cameraX;
    const rayDirY = dirVec.y + planeVec.y * cameraX;
    
    // Which box of the map we're in
    let mapX = Math.floor(posX);
    let mapY = Math.floor(posY);
    
    // Length of ray from current position to next x or y-side
    let sideDistX: number;
    let sideDistY: number;
    
    // Length of ray from one x or y-side to next x or y-side
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);
    
    // What direction to step in x or y direction (either +1 or -1)
    const stepX = rayDirX < 0 ? -1 : 1;
    const stepY = rayDirY < 0 ? -1 : 1;
    
    // Calculate step and initial sideDist
    if (rayDirX < 0) {
      sideDistX = (posX - mapX) * deltaDistX;
    } else {
      sideDistX = (mapX + 1.0 - posX) * deltaDistX;
    }
    
    if (rayDirY < 0) {
      sideDistY = (posY - mapY) * deltaDistY;
    } else {
      sideDistY = (mapY + 1.0 - posY) * deltaDistY;
    }
    
    // Perform DDA
    let hit = 0;
    let side: 0 | 1 = 0;
    let maxDistance = 20; // Maximum ray distance
    
    while (hit === 0) {
      // Jump to next map square, either in x-direction, or in y-direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      
      // Check if ray has hit a wall or is out of bounds
      if (mapY < 0 || mapY >= map.length || mapX < 0 || mapX >= map[0].length) {
        hit = 1;
        mapX = Math.max(0, Math.min(mapX, map[0].length - 1));
        mapY = Math.max(0, Math.min(mapY, map.length - 1));
      } else if (map[mapY][mapX] > 0) {
        hit = map[mapY][mapX];
      }
      
      // Prevent infinite loops
      const dist = side === 0 ? (mapX - posX + (1 - stepX) / 2) / rayDirX : (mapY - posY + (1 - stepY) / 2) / rayDirY;
      if (dist > maxDistance) {
        hit = 1;
      }
    }
    
    // Calculate distance projected on camera direction (perpendicular)
    // This avoids fisheye effect
    let perpWallDist: number;
    if (side === 0) {
      perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
    } else {
      perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;
    }
    
    // Calculate value of wallX (exact position on wall texture)
    let wallX: number;
    if (side === 0) {
      wallX = posY + perpWallDist * rayDirY;
    } else {
      wallX = posX + perpWallDist * rayDirX;
    }
    wallX -= Math.floor(wallX);
    
    // Store hit information for this column
    hits.push({
      distance: Math.abs(perpWallDist),
      textureX: wallX,
      side,
      isDoor: hit === 2,
      wallX: mapX,
      wallY: mapY
    });
  }
  
  return hits;
}

// Generate vertex data for wall strips from ray hits
export interface WallStrip {
  x: number;            // Screen X position
  width: number;        // Strip width
  height: number;       // Strip height
  y: number;            // Screen Y position (top)
  textureX: number;     // Texture coordinate
  textureY: number;     // Starting texture Y (0 to 1)
  textureHeight: number;// How much of texture to show (0 to 1)
  distance: number;     // For fog
  side: 0 | 1;
}

export function generateWallStrips(
  hits: RayHit[],
  screenWidth: number,
  screenHeight: number,
  columnWidth: number
): WallStrip[] {
  const strips: WallStrip[] = [];
  
  hits.forEach((hit, index) => {
    // Calculate height of wall strip
    const stripHeight = Math.floor(screenHeight / hit.distance);
    
    // Calculate lowest and highest pixel to fill in current stripe
    const drawStart = Math.max(0, Math.floor(-stripHeight / 2 + screenHeight / 2));
    const drawEnd = Math.min(screenHeight - 1, Math.floor(stripHeight / 2 + screenHeight / 2));
    
    strips.push({
      x: index * columnWidth,
      width: columnWidth,
      height: drawEnd - drawStart,
      y: drawStart,
      textureX: hit.textureX,
      textureY: 0,  // Full texture height
      textureHeight: 1,
      distance: hit.distance,
      side: hit.side
    });
  });
  
  return strips;
}

export default { castRays, generateWallStrips };
