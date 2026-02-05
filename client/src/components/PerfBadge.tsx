import React from 'react'

export default function PerfBadge() {
  // Simple always-on badge; can be toggled via Phase 8 in future
  return (
    <div aria-label="Performance" style={{position:'fixed', bottom:8, right:8, padding:'6px 10px', borderRadius:6, background:'rgba(0,0,0,0.6)', color:'#9ae6b4', fontWeight:700, zIndex:9999}}>
      PERF: ON
    </div>
  )
}
