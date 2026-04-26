<template>
  <div class="task-card card" :class="{ 'is-active': task.is_running && task.phase === 'work', 'is-resting': task.phase !== 'work' }">
    <div class="card-header">
      <div class="header-left-actions">
        <div class="drag-handle" title="拖曳排序">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
        </div>
        <!-- 放大按鈕 -->
        <button @click="$emit('expand', task)" class="icon-btn expand-btn" title="放大檢視">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path fill-rule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97h-2.69a.75.75 0 01-.75-.75zm-12 0A.75.75 0 013.75 3h4.5a.75.75 0 010 1.5H5.56l3.97 3.97a.75.75 0 01-1.06 1.06L4.5 5.56v2.69a.75.75 0 01-1.5 0v-4.5zm11.47 11.47a.75.75 0 111.06 1.06l-3.97 3.97h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v2.69l3.97-3.97zm-4.94 0l-3.97 3.97v-2.69a.75.75 0 00-1.5 0v4.5c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5H5.56l3.97-3.97a.75.75 0 00-1.06-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="title-container">
        <span class="title">{{ task.title }}</span>
        <span class="time-settings-info">
          {{ task.mode === 'stopwatch' ? '正向計時' : (task.mode === 'countdown' ? '倒數計時' : '番茄鐘') }}
          | 休息 {{ Math.floor(task.rest_time / 60) }}m
        </span>
      </div>
      <div class="actions">
        <button @click="$emit('edit', task)" class="icon-btn" title="編輯">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
          </svg>
        </button>
        <button @click="$emit('reset', task)" class="icon-btn" title="重置進度">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.86.86 0 00.86-.86V4.246a.75.75 0 00-1.5 0v3.183l-1.9-1.9A9 9 0 1012 21a.75.75 0 000-1.5 7.5 7.5 0 01-7.245-9.441z" clip-rule="evenodd" />
          </svg>
        </button>
        <button @click="$emit('delete', task.id)" class="icon-btn danger" title="刪除">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="action-icon">
            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.44.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <div class="circle-progress-container">
      <svg class="progress-ring" viewBox="0 0 120 120">
        <circle class="progress-ring__circle-bg" stroke-width="8" fill="transparent" r="54" cx="60" cy="60" />
        <circle class="progress-ring__circle" :stroke="task.phase === 'work' ? 'var(--circle-color)' : 'var(--rest-color)'" stroke-width="8" fill="transparent" r="54" cx="60" cy="60" :stroke-dasharray="339.292" :stroke-dashoffset="dashOffset" stroke-linecap="round" />
      </svg>
      <div class="time-display-wrapper"
           @click="task.mode !== 'stopwatch' ? $emit('quick-edit', task) : null"
           :style="{ cursor: task.mode !== 'stopwatch' ? 'pointer' : 'default' }"
           :title="task.mode !== 'stopwatch' ? '點擊修改剩餘時間' : ''">
        <span class="time-display" :class="{ 'rest-text': task.phase !== 'work' }">{{ formattedTime }}</span>
        <span v-if="task.mode === 'pomodoro' && task.phase === 'work'" class="sub-time-display">
          第 {{ (task.pomodoro_cycle || 0) + 1 }} 局
        </span>
      </div>
    </div>

    <div class="card-footer">
      <div class="badge" :class="{ 'rest-badge': task.phase !== 'work' }">
        <template v-if="task.phase === 'work'">
          <svg v-if="task.is_running" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4a.75.75 0 00-1.5 0v4.25h-2.5a.75.75 0 000 1.5h3.25a.75.75 0 00.75-.75V6z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.5 9a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm7-1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clip-rule="evenodd" />
          </svg>
          <span>{{ task.is_running ? '專注中' : '已待命' }}</span>
        </template>
        <template v-else>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a2.25 2.25 0 01-2.25 2.25h-5.5A2.25 2.25 0 013 6.25v-2zM5.25 3a1.25 1.25 0 00-1.25 1.25v2c0 .69.56 1.25 1.25 1.25h5.5c.69 0 1.25-.56 1.25-1.25v-2A1.25 1.25 0 0010.75 3h-5.5zM16.25 2.5a.75.75 0 00-.75.75v3.5a.75.75 0 00.75.75h.5a3.5 3.5 0 100-7h-.5a.75.75 0 000 1.5h.5a2 2 0 110 4h-.5v-3.5zm-5.47 9.53a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.38a.75.75 0 001.5 0v-5.38l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clip-rule="evenodd" />
          </svg>
          <span>{{ task.phase === 'long_rest' ? '長休息' : '休息中' }}</span>
        </template>
      </div>

      <div style="display:flex; gap:8px;">
        <button
          @click="$emit('toggle-rest', task)"
          class="control-btn secondary"
          :class="{ 'back-to-work': task.phase !== 'work' }"
          :title="restBtnLabel"
        >
          <template v-if="task.phase === 'work'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="ctrl-icon">
              <path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a2.25 2.25 0 01-2.25 2.25h-5.5A2.25 2.25 0 013 6.25v-2zM5.25 3a1.25 1.25 0 00-1.25 1.25v2c0 .69.56 1.25 1.25 1.25h5.5c.69 0 1.25-.56 1.25-1.25v-2A1.25 1.25 0 0010.75 3h-5.5zM16.25 2.5a.75.75 0 00-.75.75v3.5a.75.75 0 00.75.75h.5a3.5 3.5 0 100-7h-.5a.75.75 0 000 1.5h.5a2 2 0 110 4h-.5v-3.5zm-5.47 9.53a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.38a.75.75 0 001.5 0v-5.38l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clip-rule="evenodd" />
            </svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="ctrl-icon">
              <path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.061.025z" clip-rule="evenodd" />
            </svg>
          </template>
          {{ restBtnLabel }}
        </button>

        <button @click="$emit('toggle', task)" class="control-btn" :class="task.is_running ? 'pause' : 'play'">
          <svg v-if="task.is_running" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="ctrl-icon">
            <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="ctrl-icon">
            <path fill-rule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clip-rule="evenodd" />
          </svg>
          {{ task.is_running ? '暫停' : (task.phase !== 'work' ? '暫停' : '開始') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: Object,
  now: Number
})

const emit = defineEmits(['toggle', 'toggle-rest', 'edit', 'quick-edit', 'reset', 'delete', 'expand'])

const formatTimeStr = (seconds) => {
  if (isNaN(seconds) || seconds < 0) seconds = 0
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const currentWorkSeconds = computed(() => {
  const t = props.task
  let active = 0
  if (t.is_running && t.phase === 'work' && t.start_time) {
    let liveEnd = props.now
    if (t.mode === 'countdown' || t.mode === 'pomodoro') {
      const rem = Math.max(0, (t.target_time || 0) - (t.cycle_elapsed || 0))
      liveEnd = Math.min(liveEnd, t.start_time + rem * 1000)
    }
    active = (liveEnd - t.start_time) / 1000
  }
  return (t.cycle_elapsed || 0) + active
})

const currentRestSeconds = computed(() => {
  const t = props.task
  let active = 0
  if (t.is_running && (t.phase === 'rest' || t.phase === 'long_rest') && t.start_time) {
    const targetRest = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
    const rem = Math.max(0, targetRest - (t.rest_elapsed || 0))
    const liveEnd = Math.min(props.now, t.start_time + rem * 1000)
    active = (liveEnd - t.start_time) / 1000
  }
  return (t.rest_elapsed || 0) + active
})

const formattedTime = computed(() => {
  const t = props.task
  if (t.phase === 'work') {
    if (t.mode === 'stopwatch') return formatTimeStr(currentWorkSeconds.value)
    const rem = Math.max(0, t.target_time - currentWorkSeconds.value)
    return formatTimeStr(rem)
  } else {
    const tr = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
    const rem = Math.max(0, tr - currentRestSeconds.value)
    return formatTimeStr(rem)
  }
})

const dashOffset = computed(() => {
  const circumference = 339.292
  const t = props.task
  if (t.phase === 'work') {
    if (t.mode === 'stopwatch') {
      const sec = currentWorkSeconds.value
      const pct = (sec % 60) / 60
      return circumference * (1 - pct)
    }
    const rem = Math.max(0, t.target_time - currentWorkSeconds.value)
    const pct = t.target_time > 0 ? rem / t.target_time : 0
    return circumference * (1 - pct)
  } else {
    const tr = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
    const rem = Math.max(0, tr - currentRestSeconds.value)
    const pct = tr > 0 ? rem / tr : 0
    return circumference * (1 - pct)
  }
})

const restBtnLabel = computed(() => {
  const t = props.task
  if (t.phase === 'work') return '休息'
  if (t.is_running) return '結束'
  return '返回'
})
</script>

<style scoped>
.task-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  min-width: 0;
  width: 100%;
}
.card-header {
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}
.card.is-resting .card-header {
  border-bottom-color: var(--rest-border);
}
.header-left-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding-right: 10px;
}
.drag-handle {
  cursor: grab;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}
.expand-btn {
  color: var(--text-muted);
}
.expand-btn:hover {
  color: var(--primary-color);
}
.title-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}
.title {
  font-weight: bold;
  font-size: 1.1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
}
.time-settings-info {
  font-size: 0.8em;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: monospace;
  font-weight: 600;
}
.circle-progress-container {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 15px auto;
}
.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.progress-ring__circle-bg {
  stroke: var(--circle-bg);
}
.card.is-resting .progress-ring__circle-bg {
  stroke: var(--rest-border);
  opacity: 0.5;
}
.progress-ring__circle {
  transition: stroke-dashoffset 0.1s linear, stroke 0.3s;
}
.time-display-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.time-display {
  font-size: 28px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--text-color);
  line-height: 1.1;
}
.time-display.rest-text {
  color: var(--rest-color);
}
.sub-time-display {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
  font-family: monospace;
  font-weight: 600;
  background: var(--badge-bg);
  padding: 3px 8px;
  border-radius: 12px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
}
.badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--badge-bg);
  color: var(--badge-text);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
}
.rest-badge {
  background: var(--rest-border);
  color: var(--rest-color);
}
.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  font-size: 0.9em;
  transition: opacity 0.2s, background 0.25s;
}
.control-btn:hover { opacity: 0.9; }
.control-btn.secondary {
  background: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-color);
}
.control-btn.secondary.back-to-work {
  border-color: var(--rest-color);
  color: var(--rest-color);
}
.card.is-resting .control-btn.secondary {
  border-color: var(--rest-color);
  color: var(--rest-color);
}
.ctrl-icon { width: 16px; height: 16px; }
.play { background-color: var(--primary-color); }
.pause { background-color: var(--danger-color); }

@media (max-width: 400px) {
  .circle-progress-container { width: 150px; height: 150px; }
  .time-display { font-size: 24px; }
}
</style>
