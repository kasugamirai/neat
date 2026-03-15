<template>
  <button :class="['ctrl-btn', variant]" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup>
defineProps({ variant: { type: String, default: 'primary' } })
defineEmits(['click'])
</script>

<style scoped>
.ctrl-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}
.ctrl-btn.primary {
  background: linear-gradient(135deg, #00d4ff, #0084ff);
  color: #fff;
}
.ctrl-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,212,255,0.3);
}
.ctrl-btn.secondary {
  background: rgba(255,255,255,0.08);
  color: #ccc;
}
.ctrl-btn.secondary:hover { background: rgba(255,255,255,0.14); }
</style>
