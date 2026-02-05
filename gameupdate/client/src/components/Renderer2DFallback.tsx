import React, { useEffect, useRef } from 'react'

type Props = { map: number[][]; player: {x:number;y:number}; width?:number; height?:number }

export default function Renderer2DFallback({ map, player, width=600, height=400 }: Props) {
  const cnv = useRef<HTMLCanvasElement|null>(null)
  useEffect(() => {
    const c = cnv.current; if(!c) return
    c.width = width; c.height = height
    const ctx = c.getContext('2d'); if(!ctx) return
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,width,height)
    const w = map[0]?.length ?? 0; const h = map.length
    const cw = Math.max(1, Math.floor(width / w));
    const ch = Math.max(1, Math.floor(height / h));
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      ctx.fillStyle = map[y][x]===1 ? '#333' : '#777';
      ctx.fillRect(x*cw, y*ch, cw-1, ch-1)
    }
    ctx.fillStyle = '#ffd07a';
    ctx.beginPath(); ctx.arc(player.x*cw, player.y*ch, Math.max(3, cw/2), 0, Math.PI*2); ctx.fill()
  }, [map, player, width, height])
  return <canvas ref={cnv} style={{ display:'block', width, height }} />
}
