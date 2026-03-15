<template>
  <div class="section-wrapper">
    <h2>{{ title }}</h2>
    <p class="desc"><slot name="desc" /></p>

    <div class="canvas-container">
      <slot name="canvas" />
    </div>

    <div class="controls">
      <slot name="controls" />
    </div>

    <div class="step-info">{{ info }}</div>

    <div class="highlight-box">
      <slot name="highlight" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  info: String,
})
</script>

<style scoped>
.section-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
h2 {
  font-size: 1.6em;
  margin-bottom: 16px;
  color: #fff;
}
.desc {
  color: #a0aec0;
  line-height: 1.8;
  margin-bottom: 16px;
  font-size: 0.95em;
}
.canvas-container {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  margin: 20px 0;
  overflow: hidden;
}
.canvas-container canvas { display: block; width: 100%; }
.controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
  flex-wrap: wrap;
}
.step-info {
  text-align: center;
  padding: 12px;
  background: rgba(123,47,247,0.1);
  border: 1px solid rgba(123,47,247,0.2);
  border-radius: 10px;
  margin: 12px 0;
  color: #c4b5fd;
  font-size: 0.9em;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.highlight-box {
  background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(123,47,247,0.08));
  border-left: 3px solid #00d4ff;
  padding: 16px 20px;
  border-radius: 0 10px 10px 0;
  margin: 16px 0;
  font-size: 0.9em;
  line-height: 1.7;
  color: #a0aec0;
}
.highlight-box :deep(strong) { color: #00d4ff; }
</style>
