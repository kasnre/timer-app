<template>
  <div class="task-card card" :class="{ 'is-active': task.is_running && task.phase === 'work', 'is-resting': task.phase !== 'work' }">
    <div class="card-header">
      <div class="header-left-actions">
        <div class="drag-handle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </div>
      </div>
      <div class="title-container" style="align-items: center; text-align: center;">
        <span class="title" :title="task.title">{{ task.title }}</span>
        <span class="time-settings-info">
          {{ task.mode === 'stopwatch' ? '正向計時' : (task.mode === 'countdown' ? '倒數計時' : '番茄鐘') }}
          <template v-if="task.mode !== 'stopwatch'">
            | 工作 {{ Math.floor((task.target_time || 0) / 60) }}m
          </template>
          | 休息 {{ Math.floor((task.rest_time || 0) / 60) }}m
          <span v-if="task.mode === 'pomodoro'">| 長休 {{ Math.floor((task.long_rest_time || 0) / 60) }}m</span>
        </span>
      </div>
      <div class="actions">
        <button @click="emit('edit', task)" class="icon-btn" title="編輯設定">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
        <button @click="emit('reset', task)" class="icon-btn" title="重置進度">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
        <button @click="emit('delete', task.id)" class="icon-btn danger" title="刪除">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>

    <div class="circle-progress-container">
      <svg class="progress-ring" width="210" height="210" viewBox="0 0 210 210">
        <circle class="progress-ring__circle-bg" stroke-width="4" fill="transparent" r="100" cx="105" cy="105" />
        <circle
          class="progress-ring__circle"
          :stroke="task.phase === 'work' ? 'var(--circle-color)' : 'var(--rest-color)'"
          stroke-width="4"
          fill="transparent"
          stroke-linecap="round"
          r="100"
          cx="105"
          cy="105"
          :stroke-dasharray="2 * Math.PI * 100"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      
      <!-- 改為呼叫 quick-edit 來快速修改剩餘時間 (如果是正向計時工作階段，在上層會有判斷忽略) -->
      <div class="time-display-wrapper" @click="emit('quick-edit', task)" style="cursor: pointer; padding: 10px; border-radius: 8px;" title="點擊修改剩餘時間">
        <div class="time-display" :class="{ 'rest-text': task.phase !== 'work' }" style="font-size: 32px;">
          {{ displayTime }}
        </div>
        <div v-if="task.mode !== 'stopwatch' || task.phase !== 'work'" class="sub-time-display">
          目標 {{ Math.floor(currentTargetTime / 60) }} 分
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="badge" :class="{ 'rest-badge': task.phase !== 'work' }">
        <template v-if="!task.is_running && task.cycle_elapsed === 0 && task.rest_elapsed === 0 && !task.start_time">
          <span>💤 待命</span>
        </template>
        <template v-else-if="task.phase === 'work' && task.mode === 'pomodoro'">
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> 番茄鐘 {{ (task.pomodoro_cycle || 0) + 1 }}/4</span>
        </template>
        <template v-else-if="task.phase === 'work'">
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> {{ task.is_running ? '專注中' : '已暫停' }}</span>
        </template>
        <template v-else-if="task.phase === 'rest'">
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="vertical-align: middle;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg> 短暫休息</span>
        </template>
        <template v-else>
          <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="vertical-align: middle;"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg> 長時間休息</span>
        </template>
      </div>

      <div style="display:flex; gap:8px;">
        <!-- 放開限制：即使是 stopwatch 的工作階段，也能按下休息按鈕了 -->
        <button @click="emit('toggle-rest', task)" class="control-btn secondary" :title="task.phase === 'work' ? '切換至休息' : '切換至專注'">
          <svg v-if="task.phase === 'work'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ctrl-icon"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ctrl-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          {{ task.phase === 'work' ? '休息' : '計時' }}
        </button>
        <button @click="emit('toggle', task)" class="control-btn" :class="task.is_running ? 'pause' : 'play'">
          <svg v-if="task.is_running" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ctrl-icon"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ctrl-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          {{ task.is_running ? '暫停' : '開始' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ task: Object, now: Number })
const emit = defineEmits(['toggle', 'toggle-rest', 'edit', 'quick-edit', 'reset', 'delete'])

const currentWorkSeconds = computed(() => {
  let active = 0
  if (props.task.is_running && props.task.phase === 'work' && props.task.start_time) {
    let liveEnd = props.now
    if (props.task.mode === 'countdown' || props.task.mode === 'pomodoro') {
      const rem = Math.max(0, (props.task.target_time || 0) - (props.task.cycle_elapsed || 0))
      liveEnd = Math.min(liveEnd, props.task.start_time + rem * 1000)
    }
    active = (liveEnd - props.task.start_time) / 1000
  }
  return (props.task.cycle_elapsed || 0) + active
})

const currentRestSeconds = computed(() => {
  let active = 0
  if (props.task.is_running && (props.task.phase === 'rest' || props.task.phase === 'long_rest') && props.task.start_time) {
    const targetRest = props.task.phase === 'long_rest' ? props.task.long_rest_time : props.task.rest_time
    const rem = Math.max(0, targetRest - (props.task.rest_elapsed || 0))
    let liveEnd = Math.min(props.now, props.task.start_time + rem * 1000)
    active = (liveEnd - props.task.start_time) / 1000
  }
  return (props.task.rest_elapsed || 0) + active
})

const currentTargetTime = computed(() => {
  if (props.task.phase === 'work') return props.task.target_time || 0
  if (props.task.phase === 'long_rest') return props.task.long_rest_time || 0
  return props.task.rest_time || 0
})

const formatTimeStrWithHours = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const sc = Math.floor(totalSeconds % 60)
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`
}

const displayTime = computed(() => {
  let s = 0
  if (props.task.phase === 'work') {
    if (props.task.mode === 'stopwatch') s = currentWorkSeconds.value
    else s = Math.max(0, currentTargetTime.value - currentWorkSeconds.value)
  } else {
    s = Math.max(0, currentTargetTime.value - currentRestSeconds.value)
  }
  return formatTimeStrWithHours(s)
})

const dashOffset = computed(() => {
  const circumference = 2 * Math.PI * 100
  
  // 修正：正向計時的圓環改為「每 60 秒跑一圈」
  if (props.task.phase === 'work' && props.task.mode === 'stopwatch') {
    const currentSeconds = currentWorkSeconds.value
    const secondsInMinute = currentSeconds % 60
    const pct = secondsInMinute / 60
    // 逆時針填滿
    return circumference * (1 - pct)
  }
  
  const total = currentTargetTime.value
  if (total <= 0) return 0
  
  const current = props.task.phase === 'work' ? currentWorkSeconds.value : currentRestSeconds.value
  const pct = Math.min(current / total, 1)
  return circumference * (1 - pct)
})
</script>

<style scoped>
.task-card { display: flex; flex-direction: column; gap: 15px; position: relative; min-width: 0; width: 100%; }
.card-header { display: flex; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }
.header-left-actions { display: flex; align-items: center; gap: 2px; padding-right: 10px; }
.drag-handle { cursor: grab; color: var(--text-muted); display: flex; align-items: center; }
.title-container { display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }
.title { font-weight: bold; font-size: 1.1em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-color); }
.time-settings-info { font-size: 0.8em; color: var(--text-muted); margin-top: 4px; font-family: monospace; font-weight: 600; }
.actions { display: flex; gap: 4px; align-items: center; }

.circle-progress-container { position: relative; width: 210px; height: 210px; margin: 15px auto; }
.progress-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
.progress-ring__circle-bg { stroke: var(--circle-bg); }
.is-resting .progress-ring__circle-bg { stroke: var(--rest-border); opacity: 0.5; }
.progress-ring__circle { transition: stroke-dashoffset 0.1s linear, stroke 0.3s; }

.time-display-wrapper { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; transition: background 0.2s; }
.time-display-wrapper:hover { background: var(--icon-hover-bg); }

.time-display { font-family: 'Courier New', monospace; font-weight: bold; color: var(--text-color); line-height: 1.1; }
.time-display.rest-text { color: var(--rest-color); }
.sub-time-display { font-size: 14px; color: var(--text-muted); margin-top: 6px; font-family: monospace; font-weight: 600; background: var(--badge-bg); padding: 4px 10px; border-radius: 12px; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 10px; }
.badge { display: flex; align-items: center; gap: 5px; background: var(--badge-bg); color: var(--badge-text); padding: 6px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600; }
.rest-badge { background: var(--rest-border); color: var(--rest-color); }
</style>