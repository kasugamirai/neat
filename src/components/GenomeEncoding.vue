<template>
  <SectionWrapper title="基因编码：如何表示一个神经网络" :info="info">
    <template #desc>
      NEAT 用一组<strong style="color:#00d4ff">连接基因</strong>来编码神经网络。每个连接基因记录：输入节点、输出节点、权重、是否启用、以及一个<strong style="color:#ff6bcb">创新编号</strong>（innovation number）。
    </template>
    <template #canvas><canvas ref="canvasRef"></canvas></template>
    <template #controls>
      <NeatBtn @click="play">▶ 展示编码过程</NeatBtn>
      <NeatBtn variant="secondary" @click="reset">↺ 重置</NeatBtn>
    </template>
    <template #highlight>
      <strong>创新编号（Innovation Number）：</strong>每当一个新的结构变异（新连接或新节点）出现时，它会获得一个全局递增的编号。这个编号就像"历史标记"，让我们知道不同网络中的基因是否有共同的起源，从而解决了不同拓扑之间的交叉难题。
    </template>
  </SectionWrapper>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import SectionWrapper from './SectionWrapper.vue'
import NeatBtn from './NeatBtn.vue'
import { useCanvas, clearCanvas, drawNode, drawEdge } from '../composables/useCanvas'

const props = defineProps({ active: Boolean })
const canvasRef = ref(null)
const { ctx, w, h } = useCanvas(canvasRef, 960, 500)
const info = ref('点击播放，看神经网络如何被编码为基因组')
let timer = null

const nodes = [
  { x: 0.12, y: 0.2, c: '#00d4ff', l: '1', lb: '输入' },
  { x: 0.12, y: 0.45, c: '#00d4ff', l: '2', lb: '输入' },
  { x: 0.5, y: 0.15, c: '#7b2ff7', l: '5', lb: '隐藏' },
  { x: 0.88, y: 0.32, c: '#ff6bcb', l: '3', lb: '输出' },
  { x: 0.12, y: 0.7, c: '#00d4ff', l: '4', lb: '偏置' },
]

const conns = [
  { from: 0, to: 3, in_n: 1, out_n: 3, w: 0.7, enabled: true, innov: 1 },
  { from: 1, to: 3, in_n: 2, out_n: 3, w: -0.5, enabled: false, innov: 2 },
  { from: 1, to: 2, in_n: 2, out_n: 5, w: 0.5, enabled: true, innov: 3 },
  { from: 4, to: 3, in_n: 4, out_n: 3, w: 0.2, enabled: true, innov: 4 },
  { from: 0, to: 2, in_n: 1, out_n: 5, w: 0.8, enabled: true, innov: 5 },
  { from: 2, to: 3, in_n: 5, out_n: 3, w: 1.0, enabled: true, innov: 6 },
]

function draw(step) {
  if (!ctx.value) return
  const c = ctx.value, W = w.value, H = h.value
  clearCanvas(c, W, H)

  const showCount = step === 0 ? conns.length : Math.min(step, conns.length)

  for (let i = 0; i < showCount; i++) {
    const cn = conns[i]
    const fn = nodes[cn.from], tn = nodes[cn.to]
    const color = !cn.enabled ? '#555' : (i < step || step === 0) ? '#4a90d9' : '#00e676'
    drawEdge(c, fn.x * W, fn.y * H, tn.x * W, tn.y * H, color, Math.abs(cn.w), !cn.enabled)
  }
  nodes.forEach(n => drawNode(c, n.x * W, n.y * H, 20, n.c, n.l, n.lb))

  // Table
  const tableY = H * 0.58
  c.fillStyle = 'rgba(255,255,255,0.05)'
  c.fillRect(20, tableY, W - 40, H - tableY - 10)

  const headers = ['创新#', '输入', '输出', '权重', '启用']
  const colW = (W - 60) / 6
  const startX = 40

  c.fillStyle = '#8892b0'
  c.font = 'bold 12px "Noto Sans SC", sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'alphabetic'
  headers.forEach((hdr, i) => c.fillText(hdr, startX + colW * i + colW / 2, tableY + 22))

  c.fillStyle = '#fff'
  c.font = 'bold 13px "Noto Sans SC", sans-serif'
  c.textAlign = 'left'
  c.fillText('📋 基因组（连接基因列表）', 30, tableY + 2)

  for (let i = 0; i < showCount; i++) {
    const cn = conns[i]
    const ry = tableY + 44 + i * 28
    if (step > 0 && i === step - 1) {
      c.fillStyle = 'rgba(0,212,255,0.1)'
      c.fillRect(25, ry - 14, W - 50, 26)
    }
    c.font = '12px monospace'
    c.textAlign = 'center'
    const vals = [cn.innov, cn.in_n, cn.out_n, cn.w.toFixed(1), cn.enabled ? '✓' : '✗']
    vals.forEach((v, j) => {
      c.fillStyle = j === 0 ? '#ff6bcb' : j === 4 ? (cn.enabled ? '#00e676' : '#ff5555') : '#ccc'
      c.fillText(v, startX + colW * j + colW / 2, ry)
    })
  }
}

function reset() { if (timer) clearTimeout(timer); info.value = '点击播放，看神经网络如何被编码为基因组'; draw(0) }

function play() {
  if (timer) clearTimeout(timer)
  let step = 1
  const msgs = [
    '', '基因 1：节点1→节点3，权重0.7，创新编号 #1',
    '基因 2：节点2→节点3，权重-0.5，已禁用（虚线），创新编号 #2',
    '基因 3：节点2→节点5（隐藏层），权重0.5，创新编号 #3',
    '基因 4：偏置节点4→节点3，权重0.2，创新编号 #4',
    '基因 5：节点1→节点5，权重0.8，创新编号 #5',
    '基因 6：节点5→节点3，权重1.0，创新编号 #6 — 编码完成！',
  ]
  function tick() {
    draw(step)
    info.value = msgs[step]
    step++
    if (step < 7) timer = setTimeout(tick, 1500)
  }
  tick()
}

onMounted(() => setTimeout(() => draw(0), 50))
watch(() => props.active, v => { if (v) setTimeout(() => draw(0), 60) })
</script>
