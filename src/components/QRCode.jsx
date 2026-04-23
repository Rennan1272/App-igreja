/**
 * QRCode — deterministic pixel grid from a string, rendered as SVG.
 * Not a real QR standard (no scanner) — visual representation of user identity.
 * For production: use qrcode.react or a native QR library.
 */

function pseudoRandom(seed) {
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) + seed.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

function generateMatrix(data, size = 21) {
  const grid = []
  for (let r = 0; r < size; r++) {
    const row = []
    for (let c = 0; c < size; c++) {
      const seed = `${data}-${r}-${c}`
      // Always fill corners (finder patterns)
      const topLeft     = r < 7 && c < 7
      const topRight    = r < 7 && c >= size - 7
      const bottomLeft  = r >= size - 7 && c < 7
      // Corner squares: border = filled, inside = hollow, center = filled
      const inCorner = topLeft || topRight || bottomLeft
      if (inCorner) {
        const lr = topLeft ? r : topRight ? r : r - (size - 7)
        const lc = topLeft ? c : topRight ? c - (size - 7) : c
        if (lr === 0 || lr === 6 || lc === 0 || lc === 6) { row.push(1); continue }
        if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) { row.push(1); continue }
        row.push(0); continue
      }
      // Timing patterns
      if (r === 6 || c === 6) { row.push((r + c) % 2 === 0 ? 1 : 0); continue }
      // Data modules
      row.push(pseudoRandom(seed) % 3 === 0 ? 1 : 0)
    }
    grid.push(row)
  }
  return grid
}

export default function QRCode({ data, size = 180, label }) {
  const MODULES = 21
  const cellSize = size / MODULES
  const matrix = generateMatrix(String(data), MODULES)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 12,
        display: 'inline-block',
        border: '2px solid #333',
      }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#000"
                  rx={cellSize * 0.15}
                />
              ) : null
            )
          )}
        </svg>
      </div>
      {label && (
        <div style={{ color: '#888', fontSize: 11, letterSpacing: 1, textAlign: 'center' }}>{label}</div>
      )}
    </div>
  )
}
