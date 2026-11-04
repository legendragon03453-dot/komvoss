/*
 * Localização aproximada do visitante para as estatísticas do painel (país, estado e cidade),
 * lida dos cabeçalhos que a Vercel já calcula pelo IP. O IP em si não é devolvido nem guardado.
 */
export const config = { runtime: 'edge' }

export default function handler(req) {
  const h = req.headers
  const dec = (v) => {
    try {
      return v ? decodeURIComponent(v) : null
    } catch {
      return v
    }
  }
  return new Response(
    JSON.stringify({
      country: h.get('x-vercel-ip-country'),
      region: dec(h.get('x-vercel-ip-country-region')),
      city: dec(h.get('x-vercel-ip-city')),
    }),
    { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } },
  )
}
