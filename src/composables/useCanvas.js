import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Canvas composable – sets up a HiDPI canvas and provides drawing helpers.
 * Accepts an optional redraw callback that fires on every resize.
 */
export function useCanvas(canvasRef, logicalWidth = 960, logicalHeight = 420, onRedraw) {
  const ctx = ref(null)
  const w = ref(logicalWidth)
  const h = ref(logicalHeight)

  function setup() {
    const canvas = canvasRef.value
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const parent = canvas.parentElement
    // Use parent width so CSS width:100% is respected
    const cw = (parent ? parent.clientWidth : 0) || logicalWidth
    const ch = (logicalHeight / logicalWidth) * cw

    canvas.width = cw * dpr
    canvas.height = ch * dpr
    canvas.style.width = cw + 'px'
    canvas.style.height = ch + 'px'

    const c = canvas.getContext('2d')
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.value = c
    w.value = cw
    h.value = ch

    // Fire redraw callback so the component re-renders after resize
    if (onRedraw) onRedraw()
  }

  let ro = null
  onMounted(async () => {
    await nextTick()          // ensure DOM layout is settled
    setup()
    ro = new ResizeObserver(() => setup())
    if (canvasRef.value) ro.observe(canvasRef.value.parentElement)
  })
  onUnmounted(() => { if (ro) ro.disconnect() })

  return { ctx, w, h, setup }
}

/* ── Drawing primitives ─────────────────────────────────── */

export function lighten(hex, pct) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + pct)
  const g = Math.min(255, ((num >> 8) & 0xff) + pct)
  const b = Math.min(255, (num & 0xff) + pct)
  return `rgb(${r},${g},${b})`
}

export function clearCanvas(ctx, w, h) {
  ctx.clearRect(0, 0, w, h)
}

export function drawNode(ctx, x, y, r, color, label, labelBelow) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  grad.addColorStop(0, lighten(color, 40))
  grad.addColorStop(1, color)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = lighten(color, 20)
  ctx.lineWidth = 2
  ctx.stroke()

  if (label) {
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${Math.max(r * 0.65, 9)}px "Noto Sans SC", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x, y)
  }
  if (labelBelow) {
    ctx.fillStyle = '#8892b0'
    ctx.font = '11px "Noto Sans SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(labelBelow, x, y + r + 4)
  }
}

export function drawEdge(ctx, x1, y1, x2, y2, color, weight = 1, dashed = false, progress = 1) {
  const ex = x1 + (x2 - x1) * progress
  const ey = y1 + (y2 - y1) * progress

  ctx.beginPath()
  ctx.setLineDash(dashed ? [6, 4] : [])
  ctx.strokeStyle = color
  ctx.lineWidth = Math.min(Math.abs(weight) * 1.5 + 1, 4)
  ctx.globalAlpha = dashed ? 0.4 : 0.8
  ctx.moveTo(x1, y1)
  ctx.lineTo(ex, ey)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.setLineDash([])

  // arrow head
  if (progress >= 0.95) {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    ctx.beginPath()
    ctx.moveTo(ex - 12 * Math.cos(angle), ey - 12 * Math.sin(angle))
    ctx.lineTo(ex - 18 * Math.cos(angle) + 6 * Math.cos(angle - 0.5), ey - 18 * Math.sin(angle) + 6 * Math.sin(angle - 0.5))
    ctx.lineTo(ex - 18 * Math.cos(angle) + 6 * Math.cos(angle + 0.5), ey - 18 * Math.sin(angle) + 6 * Math.sin(angle + 0.5))
    ctx.closePath()
    ctx.fillStyle = color
    ctx.globalAlpha = 0.6
    ctx.fill()
    ctx.globalAlpha = 1
  }
}
