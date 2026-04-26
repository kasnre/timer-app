<template>
  <!-- 收合狀態：純加號方塊 -->
  <div v-if="!expanded" class="add-card card add-card--collapsed" @click="expand" title="新增方塊">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36" height="36" style="color:var(--text-muted)">
      <path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
    </svg>
  </div>

  <!-- 展開狀態：完整表單 -->
  <div v-else class="add-card card add-card--expanded">
    <div class="creator-top-row">
      <input
        ref="titleInput"
        :value="newTaskTitle"
        @input="$emit('update:newTaskTitle', $event.target.value)"
        @keyup.enter="onTitleEnter"
        type="text"
        class="creator-input"
        placeholder="輸入新項目名稱..."
      />
      <button @click="doAdd" class="creator-add-btn">新增方塊</button>
      <button @click="collapse" class="icon-btn" title="收起" style="margin-left:4px">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div class="creator-bottom-row">
      <div class="mode-selector">
        <label class="radio-label">
          <input type="radio" value="stopwatch" :checked="newTaskMode === 'stopwatch'" @change="$emit('update:newTaskMode', 'stopwatch')" />
          <span class="radio-custom"></span>
          <span class="radio-text">🕒 正向計時</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="countdown" :checked="newTaskMode === 'countdown'" @change="$emit('update:newTaskMode', 'countdown')" />
          <span class="radio-custom"></span>
          <span class="radio-text">⏳ 倒數計時</span>
        </label>
        <label class="radio-label">
          <input type="radio" value="pomodoro" :checked="newTaskMode === 'pomodoro'" @change="$emit('update:newTaskMode', 'pomodoro')" />
          <span class="radio-custom pomodoro"></span>
          <span class="radio-text">🍅 番茄鐘</span>
        </label>
      </div>

      <div class="time-inputs-row">
        <div v-if="newTaskMode !== 'stopwatch'" class="time-input-group">
          <input
            type="number"
            :value="workMinutes"
            @input="$emit('update:workMinutes', parseInt($event.target.value) || 0)"
            @keyup.enter="onWorkEnter"
            min="1"
            class="time-input"
          />
          <span>工作</span>
        </div>
        <div class="time-input-group">
          <input
            type="number"
            :value="restMinutes"
            @input="$emit('update:restMinutes', parseInt($event.target.value) || 0)"
            @keyup.enter="onRestEnter"
            min="1"
            class="time-input"
          />
          <span>短休</span>
        </div>
        <div v-if="newTaskMode === 'pomodoro'" class="time-input-group">
          <input
            type="number"
            :value="longRestMinutes"
            @input="$emit('update:longRestMinutes', parseInt($event.target.value) || 0)"
            @keyup.enter="doAdd"
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
import { ref, nextTick } from 'vue'

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

const expanded = ref(false)
const titleInput = ref(null)

const expand = async () => {
  expanded.value = true
  await nextTick()
  titleInput.value?.focus()
}

const collapse = () => {
  expanded.value = false
}

const doAdd = () => {
  emit('add')
  // 新增後自動收合
  expanded.value = false
}

// 標題欄 Enter：
// 如果是正向計時（沒有工作時間欄），直接新增
// 否則跳到工作時間欄（讓使用者繼續設定）
const onTitleEnter = () => {
  if (props.newTaskMode === 'stopwatch') {
    doAdd()
  } else {
    // focus 第一個 time-input（工作時間）
    const el = document.querySelector('.add-card--expanded .time-inputs-row .time-input')
    el?.focus()
  }
}

// 工作時間欄 Enter：跳到短休
const onWorkEnter = () => {
  const inputs = document.querySelectorAll('.add-card--expanded .time-inputs-row .time-input')
  if (inputs.length > 1) inputs[1].focus()
  else doAdd()
}

// 短休欄 Enter：
// 若是番茄鐘跳長休，否則直接新增
const onRestEnter = () => {
  if (props.newTaskMode === 'pomodoro') {
    const inputs = document.querySelectorAll('.add-card--expanded .time-inputs-row .time-input')
    if (inputs.length > 2) inputs[2].focus()
    else doAdd()
  } else {
    doAdd()
  }
}
</script>

<style scoped>
.add-card {
  min-width: 0;
  width: 100%;
  transition: all 0.2s;
}

.add-card--collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  cursor: pointer;
  border-style: dashed;
  opacity: 0.6;
}
.add-card--collapsed:hover {
  opacity: 1;
  border-color: var(--primary-color);
}

.add-card--expanded {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px 20px;
}

.creator-top-row {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
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
  padding: 0 20px;
  height: 44px;
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
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
.radio-label input { display: none; }

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--text-muted);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: border-color 0.2s;
}
.radio-label input:checked + .radio-custom { border-color: var(--primary-color); }
.radio-label input:checked + .radio-custom.pomodoro { border-color: var(--danger-color); }
.radio-label input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 10px; height: 10px;
  background-color: var(--primary-color);
  border-radius: 50%;
}
.radio-label input:checked + .radio-custom.pomodoro::after { background-color: var(--danger-color); }

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
  .creator-top-row { flex-wrap: wrap; }
  .creator-add-btn { padding: 12px; width: 100%; }
  .creator-bottom-row { flex-direction: column; align-items: flex-start; gap: 15px; }
  .mode-selector { flex-wrap: wrap; }
}
</style>