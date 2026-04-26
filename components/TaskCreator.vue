<template>
  <div class="creator-card">
    <div class="creator-top-row">
      <input 
        :value="newTaskTitle"
        @input="$emit('update:newTaskTitle', $event.target.value)"
        @keyup.enter="$emit('add')"
        type="text" 
        class="creator-input" 
        placeholder="輸入新項目名稱..." 
      />
      <button @click="$emit('add')" class="creator-add-btn">
        新增方塊
      </button>
    </div>

    <div class="creator-bottom-row">
      <div class="mode-selector">
        <label class="radio-label">
          <input 
            type="radio" 
            :value="'stopwatch'" 
            :checked="newTaskMode === 'stopwatch'"
            @change="$emit('update:newTaskMode', 'stopwatch')"
          >
          <span class="radio-custom"></span>
          <span class="radio-text">🕒 正向計時</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            :value="'countdown'" 
            :checked="newTaskMode === 'countdown'"
            @change="$emit('update:newTaskMode', 'countdown')"
          >
          <span class="radio-custom"></span>
          <span class="radio-text">⏳ 倒數計時</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            :value="'pomodoro'" 
            :checked="newTaskMode === 'pomodoro'"
            @change="$emit('update:newTaskMode', 'pomodoro')"
          >
          <span class="radio-custom pomodoro"></span>
          <span class="radio-text">🍅 番茄鐘</span>
        </label>
      </div>

      <!-- 移除原本外層的 v-if，讓所有模式都能設定休息時間 -->
      <div class="time-inputs-row">
        <!-- 正向計時通常沒有固定的「工作目標時間」，若你需要也可以把 v-if 拿掉 -->
        <div v-if="newTaskMode !== 'stopwatch'" class="time-input-group">
          <input 
            type="number" 
            :value="workMinutes"
            @input="$emit('update:workMinutes', parseInt($event.target.value) || 0)"
            min="1" 
            class="time-input" 
          />
          <span>工作</span>
        </div>
        
        <!-- 所有模式都有短休設定 -->
        <div class="time-input-group">
          <input 
            type="number" 
            :value="restMinutes"
            @input="$emit('update:restMinutes', parseInt($event.target.value) || 0)"
            min="1" 
            class="time-input" 
          />
          <span>短休</span>
        </div>
        
        <!-- 番茄鐘特有的長休 -->
        <div v-if="newTaskMode === 'pomodoro'" class="time-input-group">
          <input 
            type="number" 
            :value="longRestMinutes"
            @input="$emit('update:longRestMinutes', parseInt($event.target.value) || 0)"
            min="1" 
            class="time-input" 
          />
          <span>長休</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  newTaskTitle: String,
  newTaskMode: String,
  workMinutes: Number,
  restMinutes: Number,
  longRestMinutes: Number
});

defineEmits([
  'update:newTaskTitle',
  'update:newTaskMode',
  'update:workMinutes',
  'update:restMinutes',
  'update:longRestMinutes',
  'add'
]);
</script>

<style scoped>
.creator-card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.creator-top-row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.creator-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--input-bg);
  color: var(--input-text);
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.creator-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(76,175,80,0.2);
}

.creator-add-btn {
  padding: 0 25px;
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.creator-add-btn:hover {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.creator-bottom-row {
  display: flex;
  align-items: center;
  gap: 25px;
  flex-wrap: wrap;
}

.mode-selector {
  display: flex;
  gap: 20px;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.radio-label input {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--text-muted);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: border-color 0.2s;
}

.radio-label input:checked + .radio-custom {
  border-color: var(--primary-color);
}

.radio-label input:checked + .radio-custom.pomodoro {
  border-color: var(--danger-color);
}

.radio-label input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: var(--primary-color);
  border-radius: 50%;
}

.radio-label input:checked + .radio-custom.pomodoro::after {
  background-color: var(--danger-color);
}

.radio-text {
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.95em;
}

.time-inputs-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-weight: bold;
}

.time-input {
  width: 60px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--input-bg);
  color: var(--input-text);
  font-size: 15px;
  text-align: center;
  font-family: monospace;
}

.time-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

@media (max-width: 650px) {
  .creator-top-row {
    flex-direction: column;
  }
  .creator-add-btn {
    padding: 12px;
    width: 100%;
  }
  .creator-bottom-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .mode-selector {
    flex-wrap: wrap;
  }
}
</style>