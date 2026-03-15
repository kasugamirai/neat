<template>
  <SectionWrapper title="交叉操作：不同拓扑如何配对" :info="info">
    <template #desc>
      通过创新编号对齐两个父代的基因。同源基因（Matching）随机选一个；不一致基因（Disjoint）和多余基因（Excess）从更优秀的父代继承。
    </template>
    <template #canvas><canvas ref="canvasRef"></canvas></template>
    <template #controls>
      <NeatBtn @click="play">▶ 演示交叉</NeatBtn>
      <NeatBtn variant="secondary" @click="reset">↺ 重置</NeatBtn>
    </template>
    <template #highlight>
      <strong>为什么这很重要？</strong>传统遗传算法中，两个不同长度/结构的基因组很难做交叉。NEAT 通过创新编号实现了"历史同源对齐"，无需复杂的拓扑分析，就能正确地组合两个不同结构的网络。
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
const { ctx, w, h } = useCanvas(canvasRef, 960, 520)
const info = ref('点击播放，观察两个不同结构的网络如何交叉产生后代')
let timer = null

const p1 = [
  { inn: 1, txt: '1→4\n0.8', type: 'match' },
  { inn: 2, txt: '2→4\n-0.3', type: 'match' },
  { inn: 3, txt: '3→4\n0.5', type: 'match' },
  { inn: 4, txt: '2→5\n0.2', type: 'match' },
  { inn: 5, txt: '5→4\n-0.1', type: 'match' },
  { inn: null, txt: '', type: 'gap' },
  { inn: null, txt: '', type: 'gap' },
  { inn: 8, txt: '1→5\n0.6', type: 'excess' },
]
const p2 = [
  { inn: 1, txt: '1→4\n0.5', type: 'match' },
  { inn: 2, txt: '2→4\n0.1', type: 'match' },
  { inn: 3, txt: '3→4\n-0.7', type: 'match' },
  { inn: 4, txt: '2→5\n0.9', type: 'match' },
  { inn: 5, txt: '5→4\n0.3', type: 'match' },
  { inn: 6, txt: '5→6\n0.4', type: 'disjoint' },
  { inn: 7, txt: '6→4\n0.2', type: 'disjoint' },
  { inn: null, txt: '', type: 'gap' },
]
const child = [
  { inn: 1, txt: '1→4\n0.8', type: 'child', from: 'P1' },
  { inn: 2, txt: '2→4\n0.1', type: 'child', from: 'P2' },
  { inn: 3, txt: '3→4\n0.5', type: 'child', from: 'P1' },
  { inn: 4, txt: '2→5\n0.9', type: 'child', from: 'P2' },
  { inn: 5, txt: '5→4\n-0.1', type: 'child', from: 'P1' },
  { inn: null, txt: '', type: 'skip' },
  { inn: null, txt: '', type: 'skip' },
  { inn: 8, txt: '1→5\n0.6', type: 'child', from: 'P1' },
]

const colorMap = {
  match: { bg: 'rgba(0,212,255,0.15)', border: '#00d4ff' },
  disjoint: { bg: 'rgba(255,107,203,0.15)', border: '#ff6bcb' },
  excess: { bg: 'rgba(255,183,77,0.15)', border: '#ffb74d' },
  child: { bg: 'rgba(0,230,118,0.15)', border: '#00e676' },
}

function drawRow(c, genes, y, label, labelColor, W, stage) {
  const geneW = 72, gap = 6, startX = 60
  c.fillStyle = labelColor
  c.font = 'bold 13px "Noto Sans SC", sans-serif'
  c.textAlign = 'right'
  c.textBaseline = 'middle'
  c.fillText(label, startX - 10, y + 25)

  genes.forEach((g, i) => {
    const x = startX + i * (geneW + gap)
    if (g.type === 'gap' || g.type === 'skip') {
      if (stage >= 1 && g.type !== 'skip') {
        c.strokeStyle = 'rgba(255,255,255,0.1)'
        c.setLineDash([4, 4])
        c.strokeRect(x, y, geneW, 50)
        c.setLineDash([])
      }
      return
    }
    const col = colorMap[g.type]
    c.fillStyle = col.bg
    c.fillRect(x, y, geneW, 50)
    c.strokeStyle = col.border
    c.lineWidth = 1.5
    c.strokeRect(x, y, geneW, 50)
    c.fillStyle = col.border
    c.font = '10px monospace'
    c.textAlign = 'center'
    c.textBaseline = 'alphabetic'
    g.txt.split('\n').forEach((line, li) => c.fillText(line, x + geneW / 2, y + 18 + li * 14))
    if (g.from) { c.fillStyle = '#888'; c.font = '9px sans-serif'; c.fillText('← ' + g.from, x + geneW / 2, y + 46) }
  })
}

function draw(stage) {
  if (!ctx.value) return
  const c = ctx.value, W = w.value, H = h.value
  clearCanvas(c, W, H)

  const geneW = 72, gap = 6, startX = 60
  const rowH = 70, p1Y = 40, p2Y = p1Y + rowH + 30, childY = p2Y + rowH + 70

  // Innovation headers
  c.fillStyle = '#555'; c.font = '11px monospace'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'
  for (let i = 0; i < 8; i++) c.fillText('创新#' + (i + 1), startX + i * (geneW + gap) + geneW / 2, p1Y - 8)

  drawRow(c, p1, p1Y, '父代1 ★', '#00d4ff', W, stage)
  drawRow(c, p2, p2Y, '父代2', '#ff6bcb', W, stage)

  if (stage >= 2) {
    c.fillStyle = '#fff'; c.font = '20px sans-serif'; c.textAlign = 'center'
    c.fillText('⬇', W / 2, childY - 20)
    drawRow(c, child, childY, '后代', '#00e676', W, stage)
  }

  if (stage >= 1) {
    const ly = childY + 70
    const items = [
      ['同源基因 (Matching)', '#00d4ff'],
      ['不一致基因 (Disjoint)', '#ff6bcb'],
      ['多余基因 (Excess)', '#ffb74d'],
    ]
    if (stage >= 2) items.push(['后代基因', '#00e676'])
    c.font = '11px "Noto Sans SC", sans-serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'
    let lx = 60
    items.forEach(([text, color]) => {
      c.fillStyle = color; c.fillRect(lx, ly - 8, 12, 12)
      c.fillStyle = '#aaa'; c.fillText(text, lx + 18, ly + 2)
      lx += c.measureText(text).width + 42
    })
  }
}

function reset() { if (timer) clearTimeout(timer); info.value = '点击播放，观察两个不同结构的网络如何交叉产生后代'; draw(0) }

function play() {
  if (timer) clearTimeout(timer)
  let stage = 0
  const msgs = [
    '两个父代网络，通过创新编号对齐基因…',
    '🔵同源基因（创新#1-5）对齐 | 🟠父代1多余基因(#8) | 🔴父代2不一致基因(#6,7)',
    '✅ 同源基因随机选父代 | 不一致/多余基因从更优父代1继承 → 产生后代！',
  ]
  function tick() {
    draw(stage)
    info.value = msgs[stage]
    stage++
    if (stage < 3) timer = setTimeout(tick, 2500)
  }
  tick()
}

onMounted(() => setTimeout(() => draw(0), 50))
watch(() => props.active, v => { if (v) setTimeout(() => draw(0), 60) })
</script>
