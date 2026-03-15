<template>
  <SectionWrapper title="完整演化流程" :info="info">
    <template #desc>
      将所有机制组合在一起，观察 NEAT 如何从零开始演化出能解决 XOR 问题的神经网络。
    </template>
    <template #canvas><canvas ref="canvasRef"></canvas></template>
    <template #controls>
      <NeatBtn @click="play">▶ 开始演化</NeatBtn>
      <NeatBtn variant="secondary" @click="reset">↺ 重置</NeatBtn>
    </template>
    <template #highlight>
      <strong>XOR 问题</strong>是一个经典的非线性可分问题：输入 (0,0)→0, (0,1)→1, (1,0)→1, (1,1)→0。单层网络无法解决，必须有隐藏层。NEAT 能自动发现需要的隐藏结构，从而成功解决 XOR。
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
const info = ref('点击开始，观察 NEAT 演化解决 XOR 问题的全过程')
let timer = null

const xorData = [[0,0,0],[0,1,1],[1,0,1],[1,1,0]]

const stages = [
  {
    nodes: [{x:.08,y:.25,c:'#00d4ff',l:'X₁'},{x:.08,y:.55,c:'#00d4ff',l:'X₂'},{x:.35,y:.4,c:'#ff6bcb',l:'Y'}],
    edges: [[0,2,'#4a90d9',.6],[1,2,'#4a90d9',.4]],
    fitness: .25, outputs: [.3,.4,.5,.3],
    desc: '第 0 代：初始最小网络，只能做线性分类',
  },
  {
    nodes: [{x:.08,y:.2,c:'#00d4ff',l:'X₁'},{x:.08,y:.55,c:'#00d4ff',l:'X₂'},{x:.22,y:.38,c:'#7b2ff7',l:'H₁'},{x:.35,y:.4,c:'#ff6bcb',l:'Y'}],
    edges: [[0,2,'#4a90d9',.8],[1,2,'#4a90d9',.5],[2,3,'#00e676',.9],[1,3,'#4a90d9',.3]],
    fitness: .55, outputs: [.2,.7,.6,.4],
    desc: '第 5 代：变异添加了隐藏节点，开始非线性',
  },
  {
    nodes: [{x:.08,y:.18,c:'#00d4ff',l:'X₁'},{x:.08,y:.58,c:'#00d4ff',l:'X₂'},{x:.2,y:.3,c:'#7b2ff7',l:'H₁'},{x:.2,y:.5,c:'#7b2ff7',l:'H₂'},{x:.35,y:.4,c:'#ff6bcb',l:'Y'}],
    edges: [[0,2,'#4a90d9',1],[1,3,'#4a90d9',1],[0,3,'#4a90d9',.6],[1,2,'#4a90d9',.5],[2,4,'#00e676',1],[3,4,'#00e676',.8]],
    fitness: .85, outputs: [.1,.8,.9,.2],
    desc: '第 15 代：两个隐藏节点，接近正确',
  },
  {
    nodes: [{x:.08,y:.18,c:'#00d4ff',l:'X₁'},{x:.08,y:.58,c:'#00d4ff',l:'X₂'},{x:.2,y:.28,c:'#7b2ff7',l:'H₁'},{x:.2,y:.5,c:'#7b2ff7',l:'H₂'},{x:.35,y:.4,c:'#ff6bcb',l:'Y'}],
    edges: [[0,2,'#4a90d9',1.2],[1,3,'#4a90d9',1.2],[0,3,'#4a90d9',-.8],[1,2,'#4a90d9',-.8],[2,4,'#00e676',1.5],[3,4,'#00e676',1.5]],
    fitness: .99, outputs: [.02,.97,.98,.03],
    desc: '第 25 代：权重优化完成，XOR 问题解决！ ✓',
  },
]

const fitnessData = [.25,.3,.35,.4,.45,.55,.6,.62,.65,.68,.7,.73,.76,.8,.82,.85,.87,.89,.91,.92,.94,.95,.96,.97,.98,.99]

function draw(gen) {
  if (!ctx.value) return
  const c = ctx.value, W = w.value, H = h.value
  clearCanvas(c, W, H)
  const s = stages[Math.min(gen, stages.length - 1)]

  // Network
  c.fillStyle = '#fff'; c.font = 'bold 13px "Noto Sans SC", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'
  c.fillText('最优网络结构', W * 0.22, 16)

  const nw = W * 0.45, nh = H * 0.65, ny = 25
  s.edges.forEach(([fi,ti,col,wt]) => {
    drawEdge(c, s.nodes[fi].x*nw*2.5, ny+s.nodes[fi].y*nh, s.nodes[ti].x*nw*2.5, ny+s.nodes[ti].y*nh, col, Math.abs(wt)*.7)
  })
  s.nodes.forEach(n => drawNode(c, n.x*nw*2.5, ny+n.y*nh, 18, n.c, n.l))

  // XOR table
  const tx = W * 0.52, ty = 30
  c.fillStyle = '#fff'; c.font = 'bold 13px "Noto Sans SC", sans-serif'
  c.fillText('XOR 真值表 vs 网络输出', W * 0.73, 16)

  const cols = ['X₁', 'X₂', '期望', '实际', '']
  const cp = [0, 50, 100, 160, 220]
  c.font = '11px "Noto Sans SC", sans-serif'; c.fillStyle = '#8892b0'
  cols.forEach((ch, i) => c.fillText(ch, tx + cp[i] + 20, ty + 8))

  xorData.forEach((row, ri) => {
    const ry = ty + 30 + ri * 32
    if (ri % 2 === 0) { c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(tx - 5, ry - 12, 260, 28) }
    c.font = '13px monospace'; c.textAlign = 'center'
    c.fillStyle = '#ccc'; c.fillText(row[0], tx + cp[0] + 20, ry + 4); c.fillText(row[1], tx + cp[1] + 20, ry + 4)
    c.fillStyle = '#00d4ff'; c.fillText(row[2], tx + cp[2] + 20, ry + 4)
    const out = s.outputs[ri], correct = Math.abs(out - row[2]) < 0.15
    c.fillStyle = correct ? '#00e676' : '#ff5555'
    c.fillText(out.toFixed(2), tx + cp[3] + 20, ry + 4)
    c.fillText(correct ? '✓' : '✗', tx + cp[4] + 10, ry + 4)
  })

  // Fitness graph
  const fx = W * 0.52, fy = H * 0.5, fw = W * 0.42, fh = H * 0.38
  c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(fx, fy, fw, fh)
  c.strokeStyle = 'rgba(255,255,255,0.1)'; c.strokeRect(fx, fy, fw, fh)
  c.fillStyle = '#fff'; c.font = 'bold 12px "Noto Sans SC", sans-serif'; c.textAlign = 'center'
  c.fillText('适应度曲线', fx + fw / 2, fy + 18)

  const gx = fx + 35, gy = fy + 30, gw = fw - 50, gh = fh - 50
  c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1
  c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke()

  c.fillStyle = '#666'; c.font = '9px sans-serif'; c.textAlign = 'center'
  c.fillText('代数', gx + gw / 2, gy + gh + 16)
  c.save(); c.translate(gx - 16, gy + gh / 2); c.rotate(-Math.PI / 2); c.fillText('适应度', 0, 0); c.restore()

  const showUpto = [1, 6, 16, 26][gen]
  c.beginPath(); c.strokeStyle = '#00d4ff'; c.lineWidth = 2
  for (let i = 0; i < showUpto && i < fitnessData.length; i++) {
    const px = gx + (i / 25) * gw, py = gy + gh - fitnessData[i] * gh
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py)
  }
  c.stroke()

  if (showUpto > 0) {
    const lastI = Math.min(showUpto - 1, fitnessData.length - 1)
    const px = gx + (lastI / 25) * gw, py = gy + gh - fitnessData[lastI] * gh
    c.beginPath(); c.arc(px, py, 5, 0, Math.PI * 2); c.fillStyle = '#00d4ff'; c.fill()
    c.fillStyle = '#fff'; c.font = 'bold 11px monospace'; c.textAlign = 'left'
    c.fillText(fitnessData[lastI].toFixed(2), px + 10, py + 4)
  }

  c.fillStyle = '#c4b5fd'; c.font = '13px "Noto Sans SC", sans-serif'; c.textAlign = 'center'
  c.fillText(s.desc, W / 2, H - 12)
}

function reset() { if (timer) clearTimeout(timer); info.value = '点击开始，观察 NEAT 演化解决 XOR 问题的全过程'; draw(0) }

function play() {
  if (timer) clearTimeout(timer)
  let stage = 0
  const msgs = [
    '🟢 初始化：从最小网络开始，适应度很低',
    '🔵 第 5 代：变异产生隐藏节点，物种形成保护了这个创新',
    '🟣 第 15 代：网络结构逐渐复杂化，权重持续优化',
    '🎯 第 25 代：完美解决 XOR！网络复杂度恰到好处',
  ]
  function tick() { draw(stage); info.value = msgs[stage]; stage++; if (stage < 4) timer = setTimeout(tick, 3000) }
  tick()
}

onMounted(() => setTimeout(() => draw(0), 50))
watch(() => props.active, v => { if (v) setTimeout(() => draw(0), 60) })
</script>
