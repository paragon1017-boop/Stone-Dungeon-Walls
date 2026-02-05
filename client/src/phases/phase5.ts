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

import Phase6 from './phase6';

export function startPhase5(game: any) {
  const level = (game?.level ?? 1)
  const monsters: Monster[] = [
    { id: 'p5_m1', name: 'Goblin', hp: 20, maxHp: 20, attack: 6, defense: 2, speed: 5, xpValue: 20 },
    { id: 'p5_m2', name: 'Skeleton', hp: 28, maxHp: 28, attack: 7, defense: 3, speed: 4, xpValue: 25 },
    { id: 'p5_m3', name: 'Orc', hp: 40, maxHp: 40, attack: 9, defense: 4, speed: 3, xpValue: 35 }
  ];

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
  }));

  const newGame = {
    ...game,
    combatState: {
      active: true,
      monsters: combatMonsters,
      targetIndex: 0,
      turn: 0,
      currentCharIndex: 0,
      turnOrder: [],
      turnOrderPosition: 0,
      defending: false
    }
  };
  return newGame
}

export function doPlayerAttack(game: any) {
  if (!game?.combatState?.active) return { ok: false, game }
  const g = { ...game }
  const state = g.combatState
  const players = g.party ?? []
  const target = state.monsters.find((m: any) => m.hp > 0)
  if (!target || players.length === 0) return { ok: false, game: g }

  const attacker = players[0]
  const damage = Math.max(1, attacker.attack - target.defense)
  target.hp = Math.max(0, target.hp - damage)
  g.logs = [`You hit ${target.name} for ${damage} damage`].concat(g.logs || [])

  // If target dies, we let the monsters turn happen and then resolve
  return { ok: true, game: g }
}

export function monstersTurn(game: any) {
  if (!game?.combatState?.active) return { ok: false, game }
  const g = { ...game }
  const state = g.combatState
  const players = g.party ?? []
  const alivePlayers = players.filter((p: any) => p.hp > 0)
  if (alivePlayers.length === 0) {
    g.logs = ['You have fallen.'];
    g.combatState.active = false
    return { ok: true, game: g }
  }
  for (const m of state.monsters) {
    if (m.hp <= 0) continue
    const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
    const dmg = Math.max(1, m.attack - (target.defense ?? 0))
    target.hp = Math.max(0, target.hp - dmg)
    g.logs = [`${m.name} hits ${target.name} for ${dmg} dmg`].concat(g.logs || [])
    if (target.hp <= 0) {
      g.logs = [`${target.name} is defeated!`].concat(g.logs || [])
    }
  }
  return { ok: true, game: g }
}

export function resolvePhase5End(game: any) {
  const state = game?.combatState
  if (!state || !state.active) return { ok: false, game }
  const allDead = state.monsters.every((m: any) => m.hp <= 0)
  if (!allDead) return { ok: false, game }
  const totalXp = state.monsters.reduce((acc: number, m: any) => acc + (m.xpValue ?? 0), 0)
  const baseGame = {
    ...game,
    combatState: { active: false, monsters: [], targetIndex: 0, turn: 0, currentCharIndex: 0, turnOrder: [], turnOrderPosition: 0, defending: false },
    logs: [`Battle won! +${totalXp} XP`].concat(game.logs || [])
  }
  // Chain into Phase 6: increase level and generate new level map + monsters
  const next = Phase6.startPhase6(baseGame)
  return { ok: true, game: next }
}

export default { startPhase5, doPlayerAttack, monstersTurn, resolvePhase5End }
