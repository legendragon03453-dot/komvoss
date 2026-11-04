import { useEffect, useRef } from 'react'

/**
 * Fluid Particles Background (21st.dev, larsen66), adaptado:
 * - ocupa o elemento pai (não a janela) e usa canvas transparente, então o fundo vem do CSS;
 * - os rastros somem com "destination-out" em vez de pintar uma cor por cima;
 * - quantidade de partículas proporcional à área; pausa fora da tela, com a aba oculta ou com movimento reduzido.
 */

function createNoise() {
  const p = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6,
    148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171,
    168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46,
    245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159,
    86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
    47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129,
    22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191,
    179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4,
    150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
  ]
  const perm = new Array(512)
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i] = p[i]
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
  const lerp = (t: number, a: number, b: number) => a + t * (b - a)
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
  return (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)
    const u = fade(x)
    const v = fade(y)
    const w = fade(z)
    const A = perm[X] + Y
    const AA = perm[A] + Z
    const AB = perm[A + 1] + Z
    const B = perm[X + 1] + Y
    const BA = perm[B] + Z
    const BB = perm[B + 1] + Z
    return lerp(
      w,
      lerp(v, lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)), lerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z))),
      lerp(
        v,
        lerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)),
        lerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1)),
      ),
    )
  }
}

// pixels andados por quadro (a 30 fps; equivale ao passo de 2 px a 60 fps, um pouco mais calmo)
const STEP = 3
const MAX_PARTS = 900

type Props = {
  /** partículas por 1000×1000 px de área */
  density?: number
  noiseIntensity?: number
  particleSize?: { min: number; max: number }
  /** cor RGB das partículas, ex. "17, 21, 22" */
  color?: string
  /** opacidade máxima de cada partícula */
  alpha?: number
  className?: string
}

export function FluidParticles({
  density = 1400,
  noiseIntensity = 0.003,
  particleSize = { min: 0.5, max: 2 },
  color = '17, 21, 22',
  alpha = 0.15,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const noise = createNoise()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    type P = { x: number; y: number; size: number; life: number; maxLife: number }
    let parts: P[] = []
    const spawn = (): P => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 50,
    })
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(r.width))
      canvas.height = Math.max(1, Math.round(r.height))
      // limite de partículas: em telas grandes a conta por quadro crescia demais
      const n = Math.min(MAX_PARTS, Math.round((canvas.width * canvas.height * density) / 1e6))
      parts = Array.from({ length: n }, spawn)
    }
    resize()

    const step = (draw: boolean) => {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgb(${color})`
      const t = Date.now() * 1e-4
      for (const p of parts) {
        p.life += STEP / 2
        if (p.life > p.maxLife) {
          p.life = 0
          p.x = Math.random() * canvas.width
          p.y = Math.random() * canvas.height
        }
        const a = Math.sin((p.life / p.maxLife) * Math.PI) * alpha
        const ang = noise(p.x * noiseIntensity, p.y * noiseIntensity, t) * Math.PI * 4
        p.x += Math.cos(ang) * STEP
        p.y += Math.sin(ang) * STEP
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        if (!draw) continue
        // quadradinho com transparência: bem mais barato que desenhar um círculo por partícula
        ctx.globalAlpha = a
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)
      }
      ctx.globalAlpha = 1
    }

    if (reduced) {
      // um quadro parado, já com alguns rastros
      for (let i = 0; i < 30; i++) step(true)
      return
    }

    let raf = 0
    let visible = true
    // 30 quadros por segundo (o movimento é lento; a diferença não aparece e o processador agradece)
    let lastDraw = 0
    const loop = (now: number) => {
      // durante a abertura do site (html.is-loading) o canvas está coberto: não desenha
      if (now - lastDraw >= 1000 / 30 - 4 && !document.documentElement.classList.contains('is-loading')) {
        lastDraw = now
        step(true)
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
  }, [density, noiseIntensity, particleSize.min, particleSize.max, color, alpha])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
