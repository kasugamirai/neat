<template>
  <SectionWrapper title="变异操作：如何增加复杂度" :info="info">
    <template #desc>
      NEAT 有两种结构变异方式来增长网络拓扑，加上权重变异来微调连接强度。
    </template>
    <template #canvas><canvas ref="canvasRef"></canvas></template>
    <template #controls>
      <NeatBtn @click="playConn">🔗 添加连接</NeatBtn>
      <NeatBtn @click="playNode">⭕ 添加节点</NeatBtn>
      <NeatBtn variant="secondary" @click="reset">↺ 重置</NeatBtn>
    </template>
    <template #highlight>
      <strong>添加连接：</strong>在两个原本未连接的节点之间建立新连接。<br>
      <strong>添加节点：</strong>选取一条已有连接，在中间插入一个新节点。原连接被禁用，创建两条新连接（入→新节点权重为1，新节点→出保留原权重）。这样新节点一开始不会破坏网络的已有行为。
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
const info = ref('选择一种变异方式来观察')
let raf = null
let mode = 'base'

const R = 18

const baseNodes = [
  { x: 0.14, y: 0.28, c: '#00d4ff', l: 'A' },
  { x: 0.14, y: 0.72, c: '#00d4ff', l: 'B' },
  { x: 0.55, y: 0.50, c: '#7b2ff7', l: 'C' },
  { x: 0.88, y: 0.50, c: '#ff6bcb', l: 'D' },
]

function drawBase(c, W, H) {
  clearCanvas(c, W, H)
  const m = 35, dH = H - m * 2
  c.fillStyle = '#fff'; c.font = 'bold 14px "Noto Sans SC", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'
  c.fillText('原始网络', W / 2, 24)
  const n = baseNodes, o = m
  drawEdge(c, n[0].x*W, o+n[0].y*dH, n[2].x*W, o+n[2].y*dH, '#4a90d9', 0.8)
  drawEdge(c, n[1].x*W, o+n[1].y*dH, n[2].x*W, o+n[2].y*dH, '#4a90d9', 0.6)
  drawEdge(c, n[2].x*W, o+n[2].y*dH, n[3].x*W, o+n[3].y*dH, '#4a90d9', 1.0)
  baseNodes.forEach(nd => drawNode(c, nd.x*W, o+nd.y*dH, R, nd.c, nd.l))
}

function drawCurrent() {
  if (!ctx.value) return
  if (mode === 'base') drawBase(ctx.value, w.value, h.value)
}

const { ctx, w, h } = useCanvas(canvasRef, 960, 400, drawCurrent)

function reset() {
  if (raf) cancelAnimationFrame(raf)
  mode = 'base'
  info.value = '选择一种变异方式来观察'
  if (ctx.value) drawBase(ctx.value, w.value, h.value)
}

function playConn() {
  if (raf) cancelAnimationFrame(raf)
  mode = 'conn'
  info.value = '🔗 在两个原本未连接的节点之间创建新连接…'
  let progress = 0
  function tick() {
    progress += 0.02
    const c = ctx.value, W = w.value, H = h.value
    const m = 35, dH = H - m * 2, o = m, n = baseNodes
    clearCanvas(c, W, H)
    c.fillStyle = '#fff'; c.font = 'bold 14px "Noto Sans SC", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'
    c.fillText('添加连接变异：A → D', W / 2, 24)
    drawEdge(c, n[0].x*W, o+n[0].y*dH, n[2].x*W, o+n[2].y*dH, '#4a90d9', 0.8)
    drawEdge(c, n[1].x*W, o+n[1].y*dH, n[2].x*W, o+n[2].y*dH, '#4a90d9', 0.6)
    drawEdge(c, n[2].x*W, o+n[2].y*dH, n[3].x*W, o+n[3].y*dH, '#4a90d9', 1.0)
    const p = Math.min(progress, 1)
    if (p > 0) drawEdge(c, n[0].x*W, o+n[0].y*dH, n[3].x*W, o+n[3].y*dH, '#00e676', 0.5, false, p)
    baseNodes.forEach(nd => drawNode(c, nd.x*W, o+nd.y*dH, R, nd.c, nd.l))
    if (p >= 1) {
      c.fillStyle = '#00e676'; c.font = '13px "Noto Sans SC", sans-serif'; c.textAlign = 'center'
      c.fillText('✨ 新连接! 创新编号 #4', W / 2, H - 14)
      info.value = '✅ 添加连接完成！新连接获得一个新的创新编号'
    }
    if (progress < 1.1) raf = requestAnimationFrame(tick)
  }
  tick()
}

function playNode() {
  if (raf) cancelAnimationFrame(raf)
  mode = 'node'
  info.value = '⭕ 在已有连接上插入一个新节点…'
  let progress = 0
  const newN = { x: 0.34, y: 0.22, c: '#ffb74d', l: 'E' }
  function tick() {
    progress += 0.015
    const c = ctx.value, W = w.value, H = h.value
    const m = 35, dH = H - m * 2, o = m, n = baseNodes
    clearCanvas(c, W, H)
    c.fillStyle = '#fff'; c.font = 'bold 14px "Noto Sans SC", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'
    c.fillText('添加节点变异：在 A→C 上插入节点 E', W / 2, 24)
    drawEdge(c, n[1].x*W, o+n[1].y*dH, n[2].x*W, o+n[2].y*dH, '#4a90d9', 0.6)
    drawEdge(c, n[2].x*W, o+n[2].y*dH, n[3].x*W, o+n[3].y*dH, '#4a90d9', 1.0)
    const p = Math.min(progress, 1)
    if (p > 0) {
      drawEdge(c, n[0].x*W, o+n[0].y*dH, n[2].x*W, o+n[2].y*dH, '#ff5555', 0.8, true)
      drawEdge(c, n[0].x*W, o+n[0].y*dH, newN.x*W, o+newN.y*dH, '#00e676', 0.5, false, p)
      if (p > 0.5) drawEdge(c, newN.x*W, o+newN.y*dH, n[2].x*W, o+n[2].y*dH, '#00e676', 0.8, false, (p - 0.5) * 2)
    } else {
      drawEdge(c, n[0].x*W, o+n[0].y*dH, n[2].x*W, o+n[2].y*dH, '#4a90d9', 0.8)
    }
    baseNodes.forEach(nd => drawNode(c, nd.x*W, o+nd.y*dH, R, nd.c, nd.l))
    if (p > 0) drawNode(c, newN.x*W, o+newN.y*dH, R * p, newN.c, newN.l)
    if (p >= 1) {
      c.fillStyle = '#ffb74d'; c.font = '12px "Noto Sans SC", sans-serif'; c.textAlign = 'center'
      c.fillText('✨ 新节点 E！原连接禁用，新建 A→E (#5, w=1.0) 和 E→C (#6, w=0.8)', W / 2, H - 14)
      info.value = '✅ 添加节点完成！原连接被禁用，两条新连接分别获得新的创新编号'
    }
    if (progress < 1.1) raf = requestAnimationFrame(tick)
  }
  tick()
}

onMounted(() => setTimeout(() => { if (ctx.value) drawBase(ctx.value, w.value, h.value) }, 80))
watch(() => props.active, v => { if (v) setTimeout(() => { if (ctx.value) drawBase(ctx.value, w.value, h.value) }, 80) })
</script>
