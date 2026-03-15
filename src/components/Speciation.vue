<template>
  <SectionWrapper title="物种形成：保护创新" :info="info">
    <template #desc>
      新结构刚出现时往往表现较差（权重未优化），如果直接与全种群竞争会被淘汰。NEAT 将结构相似的个体分为同一"物种"，在物种内部竞争，给创新结构时间来优化。
    </template>
    <template #canvas><canvas ref="canvasRef"></canvas></template>
    <template #controls>
      <NeatBtn @click="play">▶ 演示物种划分</NeatBtn>
      <NeatBtn variant="secondary" @click="reset">↺ 重置</NeatBtn>
    </template>
    <template #highlight>
      <strong>距离公式：</strong>δ = (c₁·E)/N + (c₂·D)/N + c₃·W̄ <br>
      其中 E = 多余基因数，D = 不一致基因数，W̄ = 同源基因权重差均值，N = 较大基因组长度。当 δ 超过阈值 δₜ 时，个体被分到新物种。每个物种内部使用<strong>适应度共享</strong>（fitness sharing），确保每个物种获得公平的繁殖机会。
    </template>
  </SectionWrapper>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import SectionWrapper from './SectionWrapper.vue'
import NeatBtn from './NeatBtn.vue'
import { useCanvas, clearCanvas } from '../composables/useCanvas'

const props = defineProps({ active: Boolean })
const canvasRef = ref(null)
const { ctx, w, h } = useCanvas(canvasRef, 960, 480)
const info = ref('点击播放，观察种群如何被分为不同物种')
let timer = null

// Deterministic pseudo-random
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } }

const r = rng(42)
const individuals = Array.from({ length: 30 }, () => {
  const ix = 0.1 + r() * 0.8, iy = 0.1 + r() * 0.8, sz = 4 + r() * 4
  let sp = 0
  if (ix < 0.35 && iy < 0.55) sp = 0
  else if (ix > 0.55 && iy < 0.5) sp = 1
  else if (iy > 0.55) sp = 2
  else sp = Math.floor(ix * 3) % 3
  return { x: ix, y: iy, size: sz, species: sp }
})

const speciesColors = ['#00d4ff', '#ff6bcb', '#ffb74d']
const speciesNames = ['物种 A（简单结构）', '物种 B（中等结构）', '物种 C（复杂结构）']

function draw(stage) {
  if (!ctx.value) return
  const c = ctx.value, W = w.value, H = h.value
  clearCanvas(c, W, H)

  c.fillStyle = '#fff'; c.font = 'bold 14px "Noto Sans SC", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'

  if (stage === 0) {
    c.fillText('种群中的个体（未分类）', W / 2, 24)
    individuals.forEach(ind => {
      c.beginPath(); c.arc(ind.x * W, ind.y * H, ind.size, 0, Math.PI * 2)
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fill()
      c.strokeStyle = 'rgba(255,255,255,0.15)'; c.stroke()
    })
  }

  if (stage === 1) {
    c.fillText('按拓扑相似度划分物种', W / 2, 24)
    const centers = [{ x: 0.22, y: 0.38 }, { x: 0.7, y: 0.32 }, { x: 0.5, y: 0.72 }]
    centers.forEach((cn, i) => {
      c.beginPath(); c.arc(cn.x * W, cn.y * H, 100, 0, Math.PI * 2)
      c.fillStyle = speciesColors[i] + '10'; c.fill()
      c.strokeStyle = speciesColors[i] + '40'; c.setLineDash([6, 4]); c.lineWidth = 2; c.stroke(); c.setLineDash([])
      c.fillStyle = speciesColors[i]; c.font = '12px "Noto Sans SC", sans-serif'
      c.fillText(speciesNames[i], cn.x * W, cn.y * H - 80)
    })
    individuals.forEach(ind => {
      c.beginPath(); c.arc(ind.x * W, ind.y * H, ind.size, 0, Math.PI * 2)
      const grad = c.createRadialGradient(ind.x*W, ind.y*H, 0, ind.x*W, ind.y*H, ind.size)
      grad.addColorStop(0, speciesColors[ind.species]); grad.addColorStop(1, speciesColors[ind.species] + '60')
      c.fillStyle = grad; c.fill()
    })
  }

  if (stage === 2) {
    c.fillText('适应度共享：各物种获得公平的繁殖份额', W / 2, 24)
    const barX = 80, barW = W - 160, barH = 35, shares = [0.35, 0.35, 0.3]
    let cx = barX
    shares.forEach((s, i) => {
      const sw = barW * s
      c.fillStyle = speciesColors[i] + '80'; c.fillRect(cx, 60, sw, barH)
      c.strokeStyle = speciesColors[i]; c.lineWidth = 1; c.strokeRect(cx, 60, sw, barH)
      c.fillStyle = '#fff'; c.font = '11px "Noto Sans SC", sans-serif'; c.textAlign = 'center'
      c.fillText(speciesNames[i].split('（')[0] + ` (${Math.round(s*100)}%)`, cx + sw / 2, 60 + barH / 2 + 4)
      cx += sw
    })

    const panels = [
      { x: 0.08, y: 0.35, w: 0.26, h: 0.55, color: speciesColors[0], name: '物种 A 内部竞争', fitness: [0.8, 0.6, 0.5, 0.3, 0.2] },
      { x: 0.38, y: 0.35, w: 0.26, h: 0.55, color: speciesColors[1], name: '物种 B 内部竞争', fitness: [0.7, 0.5, 0.4, 0.2] },
      { x: 0.68, y: 0.35, w: 0.26, h: 0.55, color: speciesColors[2], name: '物种 C 内部竞争', fitness: [0.4, 0.35, 0.3, 0.15] },
    ]

    panels.forEach(p => {
      c.fillStyle = p.color + '10'; c.fillRect(p.x * W, p.y * H, p.w * W, p.h * H)
      c.strokeStyle = p.color + '40'; c.strokeRect(p.x * W, p.y * H, p.w * W, p.h * H)
      c.fillStyle = p.color; c.font = 'bold 11px "Noto Sans SC", sans-serif'; c.textAlign = 'center'
      c.fillText(p.name, p.x * W + p.w * W / 2, p.y * H + 18)

      const bw = 25, bgap = 8, totalBW = p.fitness.length * (bw + bgap) - bgap
      let bx = p.x * W + (p.w * W - totalBW) / 2
      const baseY = p.y * H + p.h * H - 15, maxBH = p.h * H - 45
      p.fitness.forEach(f => {
        const bh = f * maxBH
        c.fillStyle = p.color + '60'; c.fillRect(bx, baseY - bh, bw, bh)
        c.fillStyle = '#ccc'; c.font = '9px monospace'; c.textAlign = 'center'
        c.fillText(f.toFixed(1), bx + bw / 2, baseY - bh - 5)
        bx += bw + bgap
      })
    })
  }
}

function reset() { if (timer) clearTimeout(timer); info.value = '点击播放，观察种群如何被分为不同物种'; draw(0) }

function play() {
  if (timer) clearTimeout(timer)
  let stage = 0
  const msgs = [
    '🔵 种群中有很多不同结构的个体，尚未分类',
    '🟡 根据拓扑距离 δ 将相似个体划分为同一物种',
    '🟢 各物种内部独立竞争，新结构的创新不会被老结构淘汰！',
  ]
  function tick() { draw(stage); info.value = msgs[stage]; stage++; if (stage < 3) timer = setTimeout(tick, 2500) }
  tick()
}

onMounted(() => setTimeout(() => draw(0), 50))
watch(() => props.active, v => { if (v) setTimeout(() => draw(0), 60) })
</script>
