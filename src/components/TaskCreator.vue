<template>
  <div class="add-task-panel card">
    <input
      class="custom-input"
      :value="newTaskTitle"
      @input="emit('update:newTaskTitle', $event.target.value)"
      @keyup.enter="handleAdd"
      placeholder="輸入新項目名稱..."
    />
    <div class="mode-selector">
      <label>
        <input type="radio" :checked="newTaskMode === 'stopwatch'" @change="emit('update:newTaskMode', 'stopwatch')" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="mode-icon"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clip-rule="evenodd" /></svg>
        <span class="mode-text">正向計時</span>
      </label>
      <label>
        <input type="radio" :checked="newTaskMode === 'countdown'" @change="emit('update:newTaskMode', 'countdown')" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="mode-icon"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.902 7.098a3.75 3.75 0 013.849-.825A.75.75 0 0014.25 9h-4.5a.75.75 0 000 1.5H12a2.25 2.25 0 010 4.5H9.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H12a3.75 3.75 0 01-1.902-6.952z" clip-rule="evenodd" /></svg>
        <span class="mode-text">倒數計時</span>
      </label>
      <label>
        <input type="radio" :checked="newTaskMode === 'pomodoro'" @change="emit('update:newTaskMode', 'pomodoro')" />
        <span class="mode-icon" style="font-size:16px;line-height:20px;display:inline-block">🍅</span>
        <span class="mode-text">番茄鐘</span>
      </label>

      <div class="time-inputs">
        <template v-if="newTaskMode === 'stopwatch'">
          <input class="custom-input time-input" type="number" :value="restMinutes" @input="emit('update:restMinutes', Number($event.target.value))" min="1" placeholder="休息" />
          <span class="unit-text">分鐘 (休息)</span>
        </template>
        <template v-if="newTaskMode === 'countdown'">
          <input class="custom-input time-input" type="number" :value="workMinutes" @input="emit('update:workMinutes', Number($event.target.value))" min="1" placeholder="工作" />
          <span class="unit-text">工作</span>
          <input class="custom-input time-input" type="number" :value="restMinutes" @input="emit('update:restMinutes', Number($event.target.value))" min="1" placeholder="休息" />
          <span class="unit-text">休息</span>
        </template>
        <template v-if="newTaskMode === 'pomodoro'">
          <input class="custom-input time-input" type="number" :value="workMinutes" @input="emit('update:workMinutes', Number($event.target.value))" min="1" placeholder="工作" />
          <span class="unit-text">工作</span>
          <input class="custom-input time-input" type="number" :value="restMinutes" @input="emit('update:restMinutes', Number($event.target.value))" min="1" placeholder="短休" />
          <span class="unit-text">短休</span>
          <input class="custom-input time-input" type="number" :value="longRestMinutes" @input="emit('update:longRestMinutes', Number($event.target.value))" min="1" placeholder="長休" />
          <span class="unit-text">長休</span>
        </template>
      </div>
    </div>
    
    <button 
      @click="handleAdd" 
      class="primary-btn" 
      :class="{ 'btn-disabled': !isTitleValid }"
      :disabled="!isTitleValid"
    >
      新增方塊
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ 
  newTaskTitle: String, 
  newTaskMode: String, 
  workMinutes: Number, 
  restMinutes: Number, 
  longRestMinutes: Number 
})

const emit = defineEmits([
  'update:newTaskTitle',
  'update:newTaskMode',
  'update:workMinutes',
  'update:restMinutes',
  'update:longRestMinutes',
  'add'
])

const isTitleValid = computed(() => {
  return props.newTaskTitle && props.newTaskTitle.trim().length > 0
})

const handleAdd = () => {
  if (isTitleValid.value) {
    emit('add')
  }
}
</script>

<style scoped>
.add-task-panel { margin:0 auto 40px; display:flex; flex-direction:column; gap:15px; max-width:800px; width:100%; }
.custom-input { padding:12px; font-size:16px; border:1px solid var(--border-color); border-radius:6px; background-color:var(--input-bg) !important; color:var(--input-text) !important; outline:none; transition:background 0.3s,border-color 0.3s,color 0.3s; width:100%; }
.custom-input:focus { border-color:var(--primary-color); }
.custom-input::placeholder { color:var(--text-muted); }
.mode-selector { display:flex; gap:15px; align-items:center; flex-wrap:wrap; }
.mode-selector label { display:flex; align-items:center; gap:6px; cursor:pointer; }
.mode-icon { width:20px; height:20px; color:var(--text-muted); }
.mode-text { font-size:1rem; color:var(--text-color); font-weight:bold; }
input[type="radio"] { accent-color:var(--radio-color); cursor:pointer; width:18px; height:18px; }
.time-inputs { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.time-input { width:70px; padding:8px 10px; text-align:center; }
.unit-text { color:var(--text-color); font-weight:bold; font-size:0.9em; margin-right: 6px; }

.primary-btn { 
  padding:12px; 
  background-color:var(--primary-color); 
  color:#fff; 
  border:none; 
  border-radius:6px; 
  font-size:16px; 
  cursor:pointer; 
  font-weight:bold; 
  width:100%;
  transition: all 0.3s ease;
}

.btn-disabled {
  background-color: var(--border-color) !important;
  color: var(--text-muted) !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

@media (max-width:400px) {
  .mode-selector { flex-direction:column; align-items:flex-start; }
}
</style>