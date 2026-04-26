<template>
  <!-- 加號方塊（未展開） -->
  <div v-if="!open" class="add-card card add-card-collapsed" @click="openForm" title="新增方塊">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="plus-icon">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </div>

  <!-- 展開後的建立表單 Modal -->
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="close" style="z-index:8000;">
      <div class="modal-content card" style="max-width:440px;">
        <h2 class="modal-title" style="font-size:1.2em;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd"/></svg>
          新增計時方塊
        </h2>

        <!-- 名稱 -->
        <div style="display:flex;flex-direction:column;gap:15px;margin-bottom:20px;">
          <label style="display:flex;flex-direction:column;gap:5px;font-weight:bold;">
            方塊名稱：
            <input
              ref="titleInputRef"
              type="text"
              v-model="form.title"
              class="custom-input"
              placeholder="輸入名稱..."
              @keyup.enter="focusNext('modeSection')"
            />
          </label>

          <!-- 模式 -->
          <div style="font-weight:bold;margin-bottom:2px;">計時模式：</div>
          <div class="mode-selector">
            <label class="radio-label">
              <input type="radio" v-model="form.mode" value="stopwatch" />
              <span class="radio-custom"></span>
              <span class="radio-text">🕒 正向計時</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.mode" value="countdown" />
              <span class="radio-custom"></span>
              <span class="radio-text">⏳ 倒數計時</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.mode" value="pomodoro" />
              <span class="radio-custom pomodoro"></span>
              <span class="radio-text">🍅 番茄鐘</span>
            </label>
          </div>

          <!-- 時間欄位 -->
          <div class="time-inputs-row">
            <div v-if="form.mode !== 'stopwatch'" class="time-input-group">
              <input
                ref="workRef"
                type="number"
                v-model.number="form.work"
                min="1"
                class="time-input"
                @keyup.enter="form.mode === 'pomodoro' ? focusRef(restRef) : focusRef(restRef)"
              />
              <span>工作</span>
            </div>
            <div class="time-input-group">
              <input
                ref="restRef"
                type="number"
                v-model.number="form.rest"
                min="1"
                class="time-input"
                @keyup.enter="form.mode === 'pomodoro' ? focusRef(longRestRef) : submit()"
              />
              <span>短休</span>
            </div>
            <div v-if="form.mode === 'pomodoro'" class="time-input-group">
              <input
                ref="longRestRef"
                type="number"
                v-model.number="form.longRest"
                min="1"
                class="time-input"
                @keyup.enter="submit()"
              />
              <span>長休</span>
            </div>
          </div>
        </div>

        <div class="modal-buttons">
          <button @click="close" class="action-btn" style="background:transparent;border:1px solid var(--border-color);color:var(--text-color);">取消</button>
          <button @click="submit" class="primary-btn">新增方塊</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const emit = defineEmits(['add'])

const open = ref(false)
const titleInputRef = ref(null)
const workRef = ref(null)
const restRef = ref(null)
const longRestRef = ref(null)

const defaultForm = () => ({ title: '', mode: 'stopwatch', work: 25, rest: 5, longRest: 15 })
const form = ref(defaultForm())

const openForm = async () => {
  form.value = defaultForm()
  open.value = true
  await nextTick()
  titleInputRef.value?.focus()
}

const close = () => { open.value = false }

const focusRef = (r) => { nextTick(() => r?.focus()) }
const focusNext = (section) => {
  if (section === 'modeSection') {
    if (form.value.mode !== 'stopwatch') focusRef(workRef)
    else focusRef(restRef)
  }
}

const submit = () => {
  if (!form.value.title.trim()) {
    titleInputRef.value?.focus()
    return
  }
  emit('add', { ...form.value })
  close()
}
</script>

<style scoped>
.add-card-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  cursor: pointer;
  border-style: dashed;
  border-color: var(--border-color);
  background: transparent;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  color: var(--text-muted);
}
.add-card-collapsed:hover {
  border-color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 5%, transparent);
  color: var(--primary-color);
  transform: scale(1.02);
}
.plus-icon { width: 48px; height: 48px; stroke-width: 1.5; }

.mode-selector { display: flex; gap: 16px; flex-wrap: wrap; }
.radio-label {
  display: flex; align-items: center; gap: 6px;
  cursor: pointer; user-select: none;
}
.radio-label input { display: none; }
.radio-custom {
  width: 18px; height: 18px;
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
.radio-text { color: var(--text-color); font-weight: 600; font-size: 0.95em; }

.time-inputs-row { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
.time-input-group { display: flex; align-items: center; gap: 8px; color: var(--text-color); font-weight: bold; }
.time-input {
  width: 60px; padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--input-bg);
  color: var(--input-text);
  font-size: 15px; text-align: center; font-family: monospace;
}
.time-input:focus { outline: none; border-color: var(--primary-color); }
</style>