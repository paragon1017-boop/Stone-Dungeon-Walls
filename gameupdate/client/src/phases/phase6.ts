type Monster = {
  id: string
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  xpValue: number
  animationState?: string
  hitFlash?: number
}

// Very simple dungeon generator: rectangular rooms connected by corridors
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateDungeon(width: number = 25, height: number = 21, roomCount: number = 6): number[][] {
  // 0 = floor, 1 = wall
  const grid = Array.from({ length: height }, () => Array(width).fill(1))

  // Random rooms
  const rooms: { x: number; y: number; w: number; h: number }[] = []
  for (let i = 0; i < roomCount; i++) {
    const w = randInt(4, 8)
    const h = randInt(4, 6)
    const x = randInt(1, Math.max(1, width - w - 1))
    const y = randInt(1, Math.max(1, height - h - 1))
    // carve room
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        grid[yy][xx] = 0
      }
    }
    rooms.push({ x, y, w, h })
  }

  // Connect centers with corridors (simple L-shaped)
  const centers = rooms.map(r => ({ x: r.x + Math.floor(r.w / 2), y: r.y + Math.floor(r.h / 2) }))
  for (let i = 0; i < centers.length - 1; i++) {
    const a = centers[i]
    const b = centers[i + 1]
    // horizontal corridor
    const fromX = Math.min(a.x, b.x)
    const toX = Math.max(a.x, b.x)
    for (let x = fromX; x <= toX; x++) grid[a.y][x] = 0
    // vertical corridor
    const minY = Math.min(a.y, b.y)
    const maxY = Math.max(a.y, b.y)
    for (let y = minY; y <= maxY; y++) grid[y][b.x] = 0
  }

  return grid
}

export function startPhase6(game: any) {
  const nextLevel = (game?.level ?? 1) + 1
  const map = generateDungeon(25, 21, 6)
  const monsters: Monster[] = [
    { id: 'p6_m1', name: 'Dark Knight', hp: 60, maxHp: 60, attack: 12, defense: 4, speed: 4, xpValue: 60 },
    { id: 'p6_m2', name: 'Gloom Wraith', hp: 40, maxHp: 40, attack: 10, defense: 3, speed: 5, xpValue: 50 },
    { id: 'p6_m3', name: 'Lich', hp: 50, maxHp: 50, attack: 11, defense: 5, speed: 3, xpValue: 70 }
  ]
  const combatMonsters = monsters.map(m => ({
    id: m.id,
    name: m.name,
    hp: m.hp,
    maxHp: m.maxHp,
    xpValue: m.xpValue,
    attack: m.attack,
    defense: m.defense,
    speed: m.speed,
    animationState: 'idle',
    hitFlash: 0
  }))
  const newGame = {
    ...game,
    level: nextLevel,
    map,
    combatState: { active: true, monsters: combatMonsters, targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false }
  }
  return newGame
}

export default { startPhase6, generateDungeon }
