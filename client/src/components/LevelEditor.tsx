import React, { useState, useEffect } from 'react'
import { generateFloorMap } from '@/lib/game-engine'
import { saveGameData, loadGameData } from '@/saves/save-system'

export default function LevelEditor({ onClose }: { onClose: ()=>void }) {
  const [width, setWidth] = useState(25)
  const [height, setHeight] = useState(21)
  const [map, setMap] = useState<number[][]>(generateFloorMap(1).map)

  useEffect(() => {
    // Load last map if available
    const saved = loadGameData()
    if (saved?.map) {
      setMap(saved.map)
      setWidth(saved.map[0].length)
      setHeight(saved.map.length)
    }
  }, [])

  function setWall(x:number,y:number){
    setMap(prev => {
      const next = prev.map(r => r.slice())
      next[y] = next[y].slice()
      next[y][x] = 1
      return next
    })
  }
  function setFloor(x:number,y:number){
    setMap(prev => {
      const next = prev.map(r => r.slice())
      next[y] = next[y].slice()
      next[y][x] = 0
      return next
    })
  }
  function save() {
    const payload = { map, width, height }
    saveGameData(payload as any)
  }

  return (
    <div style={{position:'fixed',inset:0, background:'rgba(0,0,0,0.6)', display:'flex',alignItems:'center',justifyContent:'center', zIndex: 9999}} onClick={onClose}>
      <div style={{width: 640, height: 520, background:'rgba(15,15,25,0.96)', border:'1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: 12}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:'bold'}}>Level Editor</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6}}>
          <div>Width</div><input type='number' value={width} onChange={e=>setWidth(parseInt(e.target.value||'0'))} />
          <div>Height</div><input type='number' value={height} onChange={e=>setHeight(parseInt(e.target.value||'0'))} />
        </div>
        <div style={{border:'1px solid #555', height:360, marginTop:6, overflow:'auto'}}>
          {map.map((row, y) => (
            <div key={y} style={{display:'flex'}}>
              {row.map((cell, x) => (
                <div key={x} onClick={()=>cell===0?setWall(x,y):setFloor(x,y)} style={{width:20, height:20, border:'1px solid #333', background: cell===0? '#333' : '#666'}} />
              ))}
            </div>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:8, gap:8}}>
          <button onClick={save} style={{padding: '6px 12px', borderRadius:6, background:'#f59e0b', border:'none'}}>Save</button>
          <button onClick={onClose} style={{padding:'6px 12px', borderRadius:6, background:'#555', border:'none', color:'#fff'}}>Close</button>
        </div>
      </div>
    </div>
  )
}
