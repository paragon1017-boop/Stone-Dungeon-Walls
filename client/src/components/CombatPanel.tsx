import React from 'react'

type Monster = {
  id: string
  name: string
  hp: number
  maxHp: number
}

type Props = {
  onAttack: () => void
  onDefend: () => void
  onItem: () => void
  onFlee: () => void
  onPause?: () => void
  disabled?: boolean
  logs?: string[]
  monsters?: Monster[]
}

const CombatPanel: React.FC<Props> = ({ onAttack, onDefend, onItem, onFlee, onPause, disabled, logs = [], monsters = [] }) => {
  return (
    <div style={{position:'relative', width:'100%', maxWidth:700, background:'rgba(0,0,0,0.9)', borderRadius:12, padding:20, color:'#ffd07a', border:'3px solid #f6a623', boxShadow:'0 8px 32px rgba(0,0,0,0.9)'}}>
      <div style={{fontWeight:'bold', fontSize:20, marginBottom:12, textAlign:'center', textTransform:'uppercase', letterSpacing:2}}>⚔️ Combat</div>
      
      {/* Monsters Display */}
      {monsters.length > 0 && (
        <div style={{display:'flex', gap:16, marginBottom:16, justifyContent:'center', flexWrap:'wrap'}}>
          {monsters.map((m, i) => (
            <div key={m.id} style={{background:'rgba(255,0,0,0.2)', padding:12, borderRadius:8, border:'1px solid #ff4444', minWidth:120, textAlign:'center'}}>
              <div style={{fontWeight:'bold', color:'#ff6b6b', marginBottom:4}}>{m.name}</div>
              <div style={{fontSize:14}}>HP: {m.hp}/{m.maxHp}</div>
              <div style={{width:'100%', height:6, background:'#333', borderRadius:3, marginTop:4}}>
                <div style={{width:`${(m.hp/m.maxHp)*100}%`, height:'100%', background:m.hp > m.maxHp*0.5 ? '#4ade80' : m.hp > m.maxHp*0.25 ? '#fbbf24' : '#ef4444', borderRadius:3}}></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{display:'flex', gap:12, marginBottom:12, justifyContent:'center'}}>
        <button onClick={onAttack} disabled={disabled} style={{...buttonStyle, background:'#dc2626', fontSize:16, padding:'12px 24px'}} title="Attack">
          ⚔️ Attack
        </button>
        <button onClick={onDefend} disabled={disabled} style={{...buttonStyle, background:'#2563eb', fontSize:16, padding:'12px 24px'}} title="Defend">
          🛡️ Defend
        </button>
        <button onClick={onItem} disabled={disabled} style={{...buttonStyle, background:'#16a34a', fontSize:16, padding:'12px 24px'}} title="Use an item">
          🎒 Item
        </button>
        <button onClick={onFlee} disabled={disabled} style={{...buttonStyle, background:'#7c3aed', fontSize:16, padding:'12px 24px'}} title="Flee from combat">
          🏃 Flee
        </button>
        {onPause && (
          <button onClick={onPause} disabled={disabled} style={buttonStyle} title="Pause">
            ⏸️ Pause
          </button>
        )}
      </div>
      
      {logs.length > 0 && (
        <div style={{maxHeight:100, overflow:'auto', fontSize:13, background:'rgba(0,0,0,0.5)', padding:10, borderRadius:6, border:'1px solid #444'}}>
          {logs.slice(0, 5).map((l,i)=> <div key={i} style={{marginBottom:4, color:'#aaa'}}>» {l}</div>)}
        </div>
      )}
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: '2px solid rgba(255,255,255,0.2)',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  transition: 'transform 0.1s, box-shadow 0.1s'
}

export default CombatPanel
