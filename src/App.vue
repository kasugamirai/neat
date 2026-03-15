<template>
  <div id="app">
    <header class="header">
      <h1>NEAT 算法图解</h1>
      <p>NeuroEvolution of Augmenting Topologies — Stanley &amp; Miikkulainen, 2002</p>
    </header>

    <nav class="nav-bar">
      <button
        v-for="(tab, i) in tabs"
        :key="i"
        :class="['nav-btn', { active: activeTab === i }]"
        @click="activeTab = i"
      >{{ tab.icon }} {{ tab.label }}</button>
    </nav>

    <transition name="fade" mode="out-in">
      <component :is="currentComponent" :key="activeTab" :active="true" />
    </transition>

    <footer class="footer">
      基于 Stanley &amp; Miikkulainen (2002)
      "Evolving Neural Networks through Augmenting Topologies"
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CoreIdea from './components/CoreIdea.vue'
import GenomeEncoding from './components/GenomeEncoding.vue'
import CrossoverOp from './components/CrossoverOp.vue'
import MutationOp from './components/MutationOp.vue'
import Speciation from './components/Speciation.vue'
import EvolutionProcess from './components/EvolutionProcess.vue'

const tabs = [
  { icon: '💡', label: '核心思想', component: CoreIdea },
  { icon: '🧬', label: '基因编码', component: GenomeEncoding },
  { icon: '✂️', label: '交叉操作', component: CrossoverOp },
  { icon: '🔀', label: '变异操作', component: MutationOp },
  { icon: '🐠', label: '物种形成', component: Speciation },
  { icon: '📈', label: '演化过程', component: EvolutionProcess },
]

const activeTab = ref(0)
const currentComponent = computed(() => tabs[activeTab.value].component)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Noto Sans SC', sans-serif;
  background: #0a0e27;
  color: #e0e0e0;
  overflow-x: hidden;
}

.header {
  text-align: center;
  padding: 40px 20px 20px;
  background: linear-gradient(180deg, #0f1538 0%, #0a0e27 100%);
}
.header h1 {
  font-size: 2.2em;
  font-weight: 700;
  background: linear-gradient(135deg, #00d4ff, #7b2ff7, #ff6bcb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}
.header p { color: #8892b0; font-size: 1em; }

.nav-bar {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 14, 39, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.nav-btn {
  padding: 8px 18px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  background: transparent;
  color: #8892b0;
  cursor: pointer;
  font-size: 0.85em;
  font-family: inherit;
  transition: all 0.3s;
}
.nav-btn:hover { border-color: #00d4ff; color: #00d4ff; }
.nav-btn.active {
  background: linear-gradient(135deg, #00d4ff22, #7b2ff722);
  border-color: #00d4ff;
  color: #00d4ff;
}

.footer {
  text-align: center;
  padding: 40px 20px;
  color: #4a5568;
  font-size: 0.8em;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.fade-enter-from { opacity: 0; transform: translateY(16px); }
.fade-leave-to { opacity: 0; transform: translateY(-16px); }

@media (max-width: 600px) {
  .header h1 { font-size: 1.5em; }
  .nav-btn { padding: 6px 12px; font-size: 0.78em; }
}
</style>
