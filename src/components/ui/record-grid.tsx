import { useEffect, useRef } from 'react'

/**
 * Fundo da camada ERP ("o ERP guarda"): uma grade de registros. Pacotes de dados correm pelas linhas,
 * gravam uma célula ao chegar e a gravação se espalha em onda pelas vizinhas, apagando devagar.
 * Canvas transparente (o fundo vem do CSS); pausa fora da tela, com a aba oculta ou com movimento reduzido.
 */

type Props = {
  /** cor RGB da tinta, ex. "17, 21, 22" */
  color?: string
  /** lado de cada célula, em px */
  cell?: number
  className?: string
}

export function RecordGrid({ color = '17, 21, 22', cell = 30, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gap = 6
    const pitch = cell + gap
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    // a 30 fps: cada passo vale dois quadros de 60 fps
    const K = 2

    let cols = 0
    let rows = 0
    let ox = 0
    let oy = 0
    let level = new Float32Array(0)
    // células acesas (só elas são redesenhadas); a grade apagada fica pronta numa imagem
    let active = new Set<number>()
    const base = document.createElement('canvas')
    type Packet = { row: number; x: number; speed: number; target: number; dir: 1 | -1 }
    type Ripple = { c: number; r: number; age: number }
    let packets: Packet[] = []
    let ripples: Ripple[] = []

    const newPacket = (): Packet => {
      const dir = Math.random() < 0.5 ? 1 : -1
      const target = Math.floor(cols * (0.15 + Math.random() * 0.7))
      return { row: Math.floor(Math.random() * rows), x: dir === 1 ? -pitch * 3 : cols * pitch + pitch * 3, speed: 2.2 + Math.random() * 2.8, target, dir }
    }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.round(r.width))
      const h = Math.max(1, Math.round(r.height))
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / pitch) + 1
      rows = Math.ceil(h / pitch) + 1
      ox = (w - cols * pitch) / 2 + gap / 2
      oy = (h - rows * pitch) / 2 + gap / 2
      level = new Float32Array(cols * rows)
      active = new Set()
      base.width = canvas.width
      base.height = canvas.height
      const b = base.getContext('2d')!
      b.setTransform(dpr, 0, 0, dpr, 0, 0)
      b.fillStyle = `rgba(${color}, 0.035)`
      b.beginPath()
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) b.roundRect(ox + x * pitch, oy + y * pitch, cell, cell, 5)
      b.fill()
      const n = Math.max(6, Math.round((w * h) / 90000))
      packets = Array.from({ length: n }, () => {
        const p = newPacket()
        // espalha os pacotes pelo caminho já no primeiro quadro
        p.x = Math.random() * cols * pitch
        return p
      })
      ripples = []
    }
    resize()

    const write = (c: number, row: number) => {
      const i = row * cols + c
      if (i >= 0 && i < level.length) {
        level[i] = 1
        active.add(i)
      }
      ripples.push({ c: i, r: 0, age: 0 })
    }

    const step = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(base, 0, 0, w, h)

      // pacotes andam pela linha e gravam a célula de destino
      for (const p of packets) {
        p.x += p.speed * p.dir * K
        const col = Math.floor(p.x / pitch)
        if ((p.dir === 1 && col >= p.target) || (p.dir === -1 && col <= p.target)) {
          write(p.target, p.row)
          Object.assign(p, newPacket())
        }
      }

      // ondas: cada gravação acende as vizinhas num anel que cresce
      for (const rp of ripples) {
        rp.r += 0.18 * K
        rp.age++
        const cr = Math.floor(rp.c / cols)
        const cc = rp.c % cols
        const R = Math.ceil(rp.r)
        for (let y = cr - R; y <= cr + R; y++) {
          if (y < 0 || y >= rows) continue
          for (let x = cc - R; x <= cc + R; x++) {
            if (x < 0 || x >= cols) continue
            const d = Math.hypot(x - cc, y - cr)
            if (Math.abs(d - rp.r) < 0.5 * K) {
              const i = y * cols + x
              level[i] = Math.max(level[i], 0.55 * (1 - rp.r / 5))
              active.add(i)
            }
          }
        }
      }
      ripples = ripples.filter((rp) => rp.r < 5)

      // células acesas
      ctx.fillStyle = `rgb(${color})`
      ctx.strokeStyle = `rgb(${color})`
      ctx.lineWidth = 1
      for (const i of active) {
        const v = level[i]
        const px = ox + (i % cols) * pitch
        const py = oy + Math.floor(i / cols) * pitch
        ctx.globalAlpha = v * 0.32
        ctx.beginPath()
        ctx.roundRect(px, py, cell, cell, 5)
        ctx.fill()
        if (v > 0.6) {
          ctx.globalAlpha = (v - 0.6) * 0.9
          ctx.stroke()
        }
        level[i] = v * 0.976
        if (level[i] < 0.01) {
          level[i] = 0
          active.delete(i)
        }
      }
      ctx.globalAlpha = 1

      // rastro de cada pacote
      for (const p of packets) {
        const py = oy + p.row * pitch + cell / 2
        const len = 90
        const g = ctx.createLinearGradient(p.x - len * p.dir, 0, p.x, 0)
        g.addColorStop(0, `rgba(${color}, 0)`)
        g.addColorStop(1, `rgba(${color}, 0.55)`)
        ctx.strokeStyle = g
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(ox + p.x - len * p.dir, py)
        ctx.lineTo(ox + p.x, py)
        ctx.stroke()
        ctx.fillStyle = `rgba(${color}, 0.7)`
        ctx.beginPath()
        ctx.arc(ox + p.x, py, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (reduced) {
      for (let i = 0; i < 80; i++) step()
      return
    }

    let raf = 0
    let visible = true
    let lastDraw = 0
    const loop = (now: number) => {
      if (now - lastDraw >= 1000 / 30 - 4) {
        lastDraw = now
        step()
      }
      raf = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(raf)
      if (visible && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(canvas)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [color, cell])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
