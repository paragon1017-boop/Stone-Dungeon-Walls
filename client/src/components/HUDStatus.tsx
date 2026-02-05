import React from 'react'
import { xpForLevel, getEffectiveStats } from '@/lib/game-engine'

type Props = {
  game: any
}

const HUDStatus: React.FC<Props> = ({ game }) => {
  if (!game) return null
  const level = (game.party?.[0]?.level ?? game.level ?? 1)
  const member = game.party?.[0]
  const xp = member?.xp ?? 0
  const xpNeeded = xpForLevel((member?.level ?? level) + 1)
  const xpPercent = xpNeeded > 0 ? Math.min(100, Math.round((xp / xpNeeded) * 100)) : 0
  const gold = game.gold ?? 0

  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, height:48, background:'rgba(12,12,15,0.92)', display:'flex', alignItems:'center', justifyContent:'space-around', color:'#ffd07a', borderTop:'2px solid rgba(255,255,255,0.15)', zIndex: 9999 }}>
      <div>Level {level}</div>
      <div style={{ width: '40%', display:'flex', alignItems:'center' }}>
        <span style={{width: 80, textAlign:'right', marginRight:6}}>XP</span>
        <div style={{ flex:1, height:6, background:'#333', borderRadius:6, overflow:'hidden' }}>
          <span style={{display:'block', width: `${xpPercent}%`, height:'100%', background:'#facc15'}}/>
        </div>
        <span style={{ marginLeft:6 }}>{xpPercent}%</span>
      </div>
      <div>Gold: {gold}</div>
    </div>
  )
}

export default HUDStatus
