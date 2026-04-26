<template>
  <div class="bottom-actions">
    <button
      v-if="targetGlobalTask"
      @click="emit('toggle', targetGlobalTask)"
      class="action-btn global-ctrl-btn"
      :class="targetGlobalTask.is_running ? 'pause' : 'play'"
    >
      <svg v-if="!targetGlobalTask.is_running" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="action-icon"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="action-icon"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" /></svg>
      {{ targetGlobalTask.is_running ? '暫停' : '繼續' }}
      ({{ targetGlobalTask.title }}{{ targetGlobalTask.phase !== 'work' ? ' - 休息中' : '' }})
    </button>
    <button @click="emit('open-stats')" class="action-btn info main-summary-btn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="action-icon"><path fill-rule="evenodd" d="M2.25 13.5a8.25 8.25 0 1014.06-5.89l.84-.84A9.75 9.75 0 113.18 14.7l-.93-.93v4.48h4.48l-.48-.48zM15 12a3 3 0 11-6 0 3 3 0 016 0z" clip-rule="evenodd" /></svg>
      時間使用統整
    </button>
  </div>
</template>

<script setup>
defineProps({ targetGlobalTask: Object })
const emit = defineEmits(['toggle', 'open-stats'])
</script>

<style scoped>
.bottom-actions {
  position: fixed; bottom: 0; left: 0; right: 0; padding: 15px 20px;
  background: var(--bg-color); border-top: 1px solid var(--border-color);
  display: flex; justify-content: center; align-items: center;
  flex-wrap: wrap; gap: 15px; z-index: 50;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.05); transition: background 0.3s, border-color 0.3s;
}
.global-ctrl-btn {
  padding: 14px 20px; font-size: 18px; border-radius: 30px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.main-summary-btn {
  padding: 14px 30px; font-size: 18px; border-radius: 30px;
  box-shadow: 0 4px 10px rgba(59,130,246,0.3);
}
</style>