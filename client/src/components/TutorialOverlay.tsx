import React, { useState } from 'react'

type Step = { title?: string; body?: React.ReactNode }
type Props = {
  onClose: () => void
  steps: Step[]
}

export default function TutorialOverlay({ onClose, steps }: Props) {
  const [idx, setIdx] = useState(0)
  const done = idx >= steps.length - 1

  const goNext = () => {
    if (!done) setIdx(i => i + 1)
    else onClose()
  }

  const s = steps[idx] || { body: null }

  return (
    <div style={{position:'fixed', inset:0, background: 'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999}} onClick={onClose}>
      <div style={{ width: 640, maxWidth:'90vw', background: 'rgba(15,15,20,0.98)', borderRadius: 12, padding: 20 }} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:'bold', fontSize:18, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span>{s.title ?? 'Tutorial'}</span>
          <span style={{fontSize:12, opacity:0.8}}>Step {idx+1} / {steps.length}</span>
        </div>
        <div style={{fontSize:14, lineHeight:1.5, color:'#ddd', marginTop:8}}>
          {s.body ?? (<>Welcome. Use the Combat panel to fight enemies. Press P to start combat.</>)}
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:12, gap:8}}>
          <button onClick={onClose} style={{padding:'6px 12px', borderRadius:6, background:'#555', border:'none', color:'#fff'}}>Skip</button>
          <button onClick={goNext} style={{padding:'6px 12px', borderRadius:6, background:'#f59e0b', border:'none', color:'#2b1a00', fontWeight:700}}>
            {done ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
