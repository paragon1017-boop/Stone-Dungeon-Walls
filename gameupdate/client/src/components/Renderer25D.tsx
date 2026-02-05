import React, { useEffect, useRef, useCallback } from 'react'
import { GameData, TILE_WALL, TILE_FLOOR, TILE_DOOR, TILE_LADDER_DOWN, TILE_LADDER_UP, NORTH, SOUTH, EAST, WEST } from '@/lib/game-engine'

type Props = {
  gameData: GameData | null
  map: number[][]
  width?: number
  height?: number
}

// Wall texture patterns (procedural)
const WALL_PATTERNS = [
  { primary: '#4a4a4a', secondary: '#3a3a3a', detail: '#5a5a5a' },
  { primary: '#5c4033', secondary: '#4a332a', detail: '#6b4d3d' },
  { primary: '#4a5568', secondary: '#2d3748', detail: '#718096' },
  { primary: '#553c2d', secondary: '#3d2b20', detail: '#6b4e3d' },
]

const Renderer25D: React.FC<Props> = ({ gameData, map, width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const texturesRef = useRef<HTMLCanvasElement[] | null>(null)

  // Generate procedural wall textures
  const generateTextures = useCallback(() => {
    const textureSize = 64
    
    return WALL_PATTERNS.map(pattern => {
      const canvas = document.createElement('canvas')
      canvas.width = textureSize
      canvas.height = textureSize
      const ctx = canvas.getContext('2d')!
      
      // Base brick pattern
      ctx.fillStyle = pattern.primary
      ctx.fillRect(0, 0, textureSize, textureSize)
      
      // Bricks
      ctx.fillStyle = pattern.secondary
      const brickHeight = 16
      const brickWidth = 32
      for (let y = 0; y < textureSize; y += brickHeight) {
        const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2
        for (let x = -brickWidth / 2; x < textureSize; x += brickWidth) {
          ctx.fillRect(x + offset + 2, y + 2, brickWidth - 4, brickHeight - 4)
        }
      }
      
      // Add noise/detail
      ctx.fillStyle = pattern.detail
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * textureSize
        const y = Math.random() * textureSize
        const w = Math.random() * 8 + 2
        const h = Math.random() * 4 + 1
        ctx.globalAlpha = 0.3
        ctx.fillRect(x, y, w, h)
      }
      ctx.globalAlpha = 1
      
      return canvas
    })
  }, [])

  useEffect(() => {
    if (!texturesRef.current) {
      texturesRef.current = generateTextures()
    }
  }, [generateTextures])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameData) return

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx || !texturesRef.current) return

    const textures = texturesRef.current

    // Get player position - add 0.5 to center in the tile
    const playerX = gameData.x + 0.5
    const playerY = gameData.y + 0.5
    const playerDir = gameData.dir ?? SOUTH

    // Convert direction to radians
    let dirRad = 0
    switch (playerDir) {
      case NORTH: dirRad = -Math.PI / 2; break
      case SOUTH: dirRad = Math.PI / 2; break
      case EAST: dirRad = 0; break
      case WEST: dirRad = Math.PI; break
    }

    const fov = Math.PI / 3 // 60 degree field of view
    const numRays = Math.floor(width / 2)
    const maxDepth = 20
    const zBuffer = new Array(numRays).fill(maxDepth)

    // 1. Draw ceiling (solid color with gradient)
    const ceilingGrad = ctx.createLinearGradient(0, 0, 0, height / 2)
    ceilingGrad.addColorStop(0, '#0d0d15')
    ceilingGrad.addColorStop(1, '#1a1a2a')
    ctx.fillStyle = ceilingGrad
    ctx.fillRect(0, 0, width, height / 2)

    // 2. Draw floor (solid color with gradient)
    const floorGrad = ctx.createLinearGradient(0, height / 2, 0, height)
    floorGrad.addColorStop(0, '#1a1a1a')
    floorGrad.addColorStop(1, '#0d0d0d')
    ctx.fillStyle = floorGrad
    ctx.fillRect(0, height / 2, width, height / 2)

    // 3. Raycasting for walls
    ctx.imageSmoothingEnabled = false
    
    for (let i = 0; i < numRays; i++) {
      const rayAngle = dirRad - fov / 2 + (fov * i) / numRays
      
      const rayDirX = Math.cos(rayAngle)
      const rayDirY = Math.sin(rayAngle)
      
      // DDA Algorithm for raycasting
      let mapX = Math.floor(playerX)
      let mapY = Math.floor(playerY)
      
      const deltaDistX = Math.abs(1 / rayDirX)
      const deltaDistY = Math.abs(1 / rayDirY)
      
      let stepX, stepY
      let sideDistX, sideDistY
      
      if (rayDirX < 0) {
        stepX = -1
        sideDistX = (playerX - mapX) * deltaDistX
      } else {
        stepX = 1
        sideDistX = (mapX + 1 - playerX) * deltaDistX
      }
      
      if (rayDirY < 0) {
        stepY = -1
        sideDistY = (playerY - mapY) * deltaDistY
      } else {
        stepY = 1
        sideDistY = (mapY + 1 - playerY) * deltaDistY
      }
      
      let hit = false
      let side = 0 // 0 = x-side, 1 = y-side
      let wallType = TILE_FLOOR
      
      // Perform DDA
      while (!hit) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX
          mapX += stepX
          side = 0
        } else {
          sideDistY += deltaDistY
          mapY += stepY
          side = 1
        }
        
        // Check if ray is out of bounds or hit a wall
        if (mapY < 0 || mapY >= map.length || mapX < 0 || mapX >= map[0].length) {
          hit = true
        } else if (map[mapY][mapX] === TILE_WALL || map[mapY][mapX] === TILE_DOOR) {
          hit = true
          wallType = map[mapY][mapX]
        }
      }
      
      // Calculate distance
      let perpWallDist
      if (side === 0) {
        perpWallDist = (mapX - playerX + (1 - stepX) / 2) / rayDirX
      } else {
        perpWallDist = (mapY - playerY + (1 - stepY) / 2) / rayDirY
      }
      
      zBuffer[i] = perpWallDist
      
      // Calculate wall height
      const lineHeight = Math.min(height, Math.floor(height / perpWallDist))
      const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + height / 2))
      const drawEnd = Math.min(height - 1, Math.floor(lineHeight / 2 + height / 2))
      
      // Calculate texture coordinate
      let wallX
      if (side === 0) {
        wallX = playerY + perpWallDist * rayDirY
      } else {
        wallX = playerX + perpWallDist * rayDirX
      }
      wallX -= Math.floor(wallX)
      
      let texX = Math.floor(wallX * 64)
      if (side === 0 && rayDirX > 0) texX = 63 - texX
      if (side === 1 && rayDirY < 0) texX = 63 - texX
      
      // Select texture based on position
      const texIndex = (Math.abs(mapX) + Math.abs(mapY)) % textures.length
      const wallTexture = textures[texIndex]
      
      // Draw wall strip
      const stripWidth = Math.ceil(width / numRays)
      const stripX = i * stripWidth
      
      ctx.drawImage(
        wallTexture,
        texX, 0, 1, 64,
        stripX, drawStart, stripWidth, drawEnd - drawStart
      )
      
      // Add distance shading (darker further away)
      const shade = Math.min(0.8, perpWallDist / 15)
      ctx.fillStyle = `rgba(0, 0, 0, ${shade})`
      ctx.fillRect(stripX, drawStart, stripWidth, drawEnd - drawStart)
      
      // Darken side walls slightly for 3D effect
      if (side === 1) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillRect(stripX, drawStart, stripWidth, drawEnd - drawStart)
      }
      
      // Special tint for doors
      if (wallType === TILE_DOOR) {
        ctx.fillStyle = 'rgba(139, 69, 19, 0.3)'
        ctx.fillRect(stripX, drawStart, stripWidth, drawEnd - drawStart)
      }
    }

    // 4. Draw objects (ladders) on top
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === TILE_LADDER_DOWN || map[y][x] === TILE_LADDER_UP) {
          const spriteX = x + 0.5 - playerX
          const spriteY = y + 0.5 - playerY
          
          // Transform sprite with the inverse camera matrix
          const invDet = 1.0 / (Math.cos(dirRad - Math.PI/2) * Math.sin(dirRad) - Math.sin(dirRad - Math.PI/2) * Math.cos(dirRad))
          const transformX = invDet * (Math.sin(dirRad) * spriteX - Math.cos(dirRad) * spriteY)
          const transformY = invDet * (-Math.sin(dirRad - Math.PI/2) * spriteX + Math.cos(dirRad - Math.PI/2) * spriteY)
          
          if (transformY > 0) {
            const spriteScreenX = Math.floor((width / 2) * (1 + transformX / transformY))
            const spriteHeight = Math.abs(Math.floor(height / transformY))
            const spriteWidth = spriteHeight
            
            // Check if visible and not behind a wall
            const rayIndex = Math.floor((spriteScreenX / width) * numRays)
            if (rayIndex >= 0 && rayIndex < numRays && transformY < zBuffer[rayIndex]) {
              ctx.fillStyle = '#fbbf24'
              ctx.globalAlpha = Math.max(0.4, Math.min(1, 1 - transformY / 10))
              ctx.fillText('▼', spriteScreenX, height / 2 + spriteHeight / 2)
              ctx.globalAlpha = 1
            }
          }
        }
      }
    }

  }, [gameData, map, width, height])

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        imageRendering: 'pixelated'
      }} 
    />
  )
}

export default Renderer25D
