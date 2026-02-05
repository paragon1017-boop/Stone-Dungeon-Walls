import React, { useEffect, useRef, useState } from 'react'

const FPSDisplay: React.FC = () => {
  const [fps, setFps] = useState(0)
  const last = useRef<number>(performance.now())
  const frames = useRef<number>(0)
  const acc = useRef<number>(0)

  useEffect(() => {
    let mounted = true
    const loop = (t: number) => {
      if (!mounted) return
      frames.current++
      const dt = t - last.current
      last.current = t
      acc.current += dt
      if (acc.current >= 500) {
        const cur = Math.round(frames.current * 1000 / acc.current)
        setFps(cur)
        frames.current = 0
        acc.current = 0
      }
      requestAnimationFrame(loop)
    }
    const id = requestAnimationFrame(loop)
    return () => { mounted = false; cancelAnimationFrame(id) }
  }, [])

  return (
    <div style={{ position: 'fixed', right: 12, top: 12, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', color: '#9ae6b4', fontWeight: 700, fontFamily: 'monospace', zIndex: 9999 }}>
      FPS: {fps}
    </div>
  )
}

export default FPSDisplay
