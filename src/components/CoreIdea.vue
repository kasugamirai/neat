<template>
  <SectionWrapper title="核心思想：从简单到复杂" :info="info">
    <template #desc>
      传统方法使用固定结构的神经网络，只优化权重。NEAT 的创新在于：<strong style="color:#00d4ff">同时演化网络的结构和权重</strong>，从最简单的网络开始，逐步增长复杂度。
    </template>
    <template #canvas>
      <canvas ref="canvasRef"></canvas>
    </template>
    <template #controls>
      <NeatBtn @click="play">▶ 播放演化过程</NeatBtn>
      <NeatBtn variant="secondary" @click="reset">↺ 重置</NeatBtn>
    </template>
    <template #highlight>
      <strong>关键洞见：</strong>从最小网络开始演化意味着搜索空间始终保持最小。新的结构只在需要时才被添加，避免了不必要的复杂性。这就像生物进化——从简单的单细胞生命逐渐演化出复杂的多细胞生物。
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
const { ctx, w, h } = useCanvas(canvasRef, 960, 420)
const info = ref('点击播放，观察网络如何从最简结构逐步演化')

let timer = null

const stages = [
  {
    nodes: [
      { x: 0.15, y: 0.3, c: '#00d4ff', l: 'X₁', lb: '输入' },
      { x: 0.15, y: 0.7, c: '#00d4ff', l: 'X₂', lb: '输入' },
      { x: 0.85, y: 0.5, c: '#ff6bcb', l: 'Y', lb: '输出' },
    ],
    edges: [[0, 2, '#4a90d9', 0.8], [1, 2, '#4a90d9', 0.6]],
    label: '初始：最小网络（只有输入→输出）',
  },
  {
    nodes: [
      { x: 0.12, y: 0.3, c: '#00d4ff', l: 'X₁', lb: '输入' },
      { x: 0.12, y: 0.7, c: '#00d4ff', l: 'X₂', lb: '输入' },
      { x: 0.5, y: 0.35, c: '#7b2ff7', l: 'H₁', lb: '隐藏' },
      { x: 0.88, y: 0.5, c: '#ff6bcb', l: 'Y', lb: '输出' },
    ],
    edges: [[0, 2, '#4a90d9', 0.7], [1, 3, '#4a90d9', 0.5], [0, 3, '#4a90d9', 0.4], [2, 3, '#00e676', 1.0]],
    label: '第 5 代：出现第一个隐藏节点',
  },
  {
    nodes: [
      { x: 0.1, y: 0.25, c: '#00d4ff', l: 'X₁', lb: '输入' },
      { x: 0.1, y: 0.75, c: '#00d4ff', l: 'X₂', lb: '输入' },
      { x: 0.42, y: 0.3, c: '#7b2ff7', l: 'H₁', lb: '隐藏' },
      { x: 0.42, y: 0.7, c: '#7b2ff7', l: 'H₂', lb: '隐藏' },
      { x: 0.9, y: 0.5, c: '#ff6bcb', l: 'Y', lb: '输出' },
    ],
    edges: [[0, 2, '#4a90d9', 0.9], [1, 2, '#4a90d9', 0.6], [1, 3, '#4a90d9', 0.8], [0, 3, '#4a90d9', 0.3], [2, 4, '#00e676', 1.0], [3, 4, '#00e676', 0.7]],
    label: '第 15 代：出现第二个隐藏节点',
  },
  {
    nodes: [
      { x: 0.08, y: 0.25, c: '#00d4ff', l: 'X₁', lb: '输入' },
      { x: 0.08, y: 0.75, c: '#00d4ff', l: 'X₂', lb: '输入' },
      { x: 0.35, y: 0.2, c: '#7b2ff7', l: 'H₁' },
      { x: 0.35, y: 0.55, c: '#7b2ff7', l: 'H₂' },
      { x: 0.35, y: 0.85, c: '#7b2ff7', l: 'H₃' },
      { x: 0.65, y: 0.38, c: '#7b2ff7', l: 'H₄' },
      { x: 0.92, y: 0.5, c: '#ff6bcb', l: 'Y', lb: '输出' },
    ],
    edges: [
      [0, 2, '#4a90d9', 0.9], [0, 3, '#4a90d9', 0.5], [1, 3, '#4a90d9', 0.8], [1, 4, '#4a90d9', 0.7],
      [2, 5, '#00e676', 1.0], [3, 5, '#00e676', 0.6], [4, 6, '#00e676', 0.8], [5, 6, '#00e676', 1.0], [3, 6, '#ffb74d', 0.4],
    ],
    label: '第 30 代：网络复杂度按需增长，找到解！✓',
  },
]

const msgs = [
  '🟢 初始化：从最简单的网络开始，没有任何隐藏节点',
  '🔵 变异产生了第一个隐藏节点 H₁，创新被保护在独立物种中',
  '🟣 继续演化，第二个隐藏节点 H₂ 出现，网络能力增强',
  '🎯 经过多代演化，网络复杂度恰好够用，成功解决问题！',
]

function draw(stage) {
  if (!ctx.value) return
  const c = ctx.value
  const W = w.value, H = h.value
  clearCanvas(c, W, H)
  const s = stages[stage]
  s.edges.forEach(([fi, ti, col, wt]) => {
    drawEdge(c, s.nodes[fi].x * W, s.nodes[fi].y * H, s.nodes[ti].x * W, s.nodes[ti].y * H, col, wt)
  })
  s.nodes.forEach(n => drawNode(c, n.x * W, n.y * H, 22, n.c, n.l, n.lb))
  c.fillStyle = '#fff'
  c.font = 'bold 15px "Noto Sans SC", sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'alphabetic'
  c.fillText(s.label, W / 2, H - 16)
}

function reset() {
  if (timer) clearTimeout(timer)
  info.value = '点击播放，观察网络如何从最简结构逐步演化'
  draw(0)
}

function play() {
  if (timer) clearTimeout(timer)
  let stage = 0
  function step() {
    draw(stage)
    info.value = msgs[stage]
    stage++
    if (stage < stages.length) timer = setTimeout(step, 2000)
  }
  step()
}

onMounted(() => { setTimeout(() => draw(0), 50) })
watch(() => props.active, v => { if (v) setTimeout(() => draw(0), 60) })
</script>
