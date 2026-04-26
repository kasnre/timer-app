<template>
  <div class="app-container">
    <div v-if="showLoginModal" class="modal-overlay" style="background:var(--bg-color); z-index:9999;">
      <div class="card" style="width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 style="margin: 0;">登入雲端同步</h2>
          <button v-if="isOfflineMode" @click="showLoginModal = false" class="icon-btn" style="padding:4px">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <input v-model="authForm.username" type="text" class="custom-input" placeholder="帳號" />
          <input v-model="authForm.password" type="password" class="custom-input" placeholder="密碼" @keyup.enter="handleLogin" />
        </div>

        <div style="display: flex; gap: 10px;">
          <button @click="handleLogin" class="primary-btn" :disabled="isAuthLoading">
            {{ isAuthLoading ? '處理中...' : '登入' }}
          </button>
          <button @click="handleRegister" class="action-btn info" style="flex:1; justify-content:center" :disabled="isAuthLoading">
            註冊新帳號
          </button>
        </div>

        <div v-if="!isOfflineMode" style="text-align: center; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 20px;">
          <button @click="enableGuestMode" class="action-btn" style="background: transparent; color: var(--text-color); border: 2px solid var(--border-color); width: 100%; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>
            進入訪客模式 (純本地離線)
          </button>
        </div>
      </div>
    </div>

    <div v-if="quickEditTask" class="modal-overlay" @click.self="quickEditTask = null" style="z-index:9000;">
      <div class="modal-content card" style="max-width: 320px; text-align: center;">
        <h3 style="margin-top:0;">修改剩餘時間</h3>
        <p style="color:var(--text-muted); font-size:0.9em; margin-bottom: 20px;">
          (這只會改變「目前」的進度，不影響預設值)
        </p>
        <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom: 20px;">
          <input type="number" v-model.number="quickEditMinutes" class="custom-input" style="width: 100px; text-align: center; font-size: 24px;" min="1" />
          <span style="font-weight:bold; font-size: 1.2em;">分鐘</span>
        </div>
        <div class="modal-buttons">
          <button @click="quickEditTask = null" class="action-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-color);">取消</button>
          <button @click="saveQuickEdit" class="primary-btn">確認修改</button>
        </div>
      </div>
    </div>

    <div style="width: 100%; display: flex; flex-direction: column;">
      <AppHeader
        :is-online="isOnline"
        :is-dark-theme="isDarkTheme"
        :notification-permission="notificationPermission"
        :is-logged-in="isLoggedIn"
        @toggle-theme="toggleTheme"
        @export="exportData"
        @import="triggerImport"
        @reset-times="resetAllTimes"
        @clear-all="clearAllTasks"
        @open-login="showLoginModal = true"
        @logout="logout"
      />

      <input type="file" ref="fileInput" @change="handleImport" accept=".json" style="display:none" />

      <TaskCreator
        :new-task-title="newTaskTitle"
        :new-task-mode="newTaskMode"
        :work-minutes="workMinutes"
        :rest-minutes="restMinutes"
        :long-rest-minutes="longRestMinutes"
        @update:newTaskTitle="newTaskTitle = $event"
        @update:newTaskMode="newTaskMode = $event"
        @update:workMinutes="workMinutes = $event"
        @update:restMinutes="restMinutes = $event"
        @update:longRestMinutes="longRestMinutes = $event"
        @add="addTask"
      />

      <draggable
        v-model="activeTasks"
        item-key="id"
        @end="onDragEnd"
        handle=".drag-handle"
        class="task-grid"
        animation="200"
        tag="div"
      >
        <template #item="{ element }">
          <TaskItem
            :task="element"
            :now="now"
            @toggle="toggleTimer"
            @toggle-rest="toggleRest"
            @edit="openEditModal"
            @quick-edit="openQuickEditModal"
            @reset="resetTask"
            @delete="deleteTask"
          />
        </template>
      </draggable>

      <TaskEditModal
        v-if="editingTask"
        :editing-task="editingTask"
        :edit-form="editForm"
        @update:editForm="editForm = $event"
        @save="saveTaskEdit"
        @close="editingTask = null"
      />

      <BottomActionBar
        :target-global-task="targetGlobalTask"
        @toggle="toggleTimer"
        @open-stats="showSummary = true"
      />

      <StatsModal
        v-if="showSummary"
        :stats-mode="statsMode"
        :selected-date="selectedDate"
        :selected-week="selectedWeek"
        :selected-month="selectedMonth"
        :selected-year="selectedYear"
        :merge-same-name="mergeSameName"
        :pie-chart-style="pieChartStyle"
        :total-elapsed-seconds="totalElapsedSeconds"
        :stopwatch-tasks="stopwatchTasks"
        :countdown-tasks="countdownTasks"
        :merged-list="mergedList"
        :active-stats-tasks="activeStatsTasks"
        :current-mode-text="currentModeText"
        :format-time-str="formatTimeStr"
        @update:statsMode="statsMode = $event"
        @update:selectedDate="selectedDate = $event"
        @update:selectedWeek="selectedWeek = $event"
        @update:selectedMonth="selectedMonth = $event"
        @update:selectedYear="selectedYear = $event"
        @update:mergeSameName="mergeSameName = $event"
        @clear-task="clearTaskStat"
        @clear-all-stats="clearAllStats"
        @close="showSummary = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import draggable from 'vuedraggable'
import { db } from './db.js'
import { v4 as uuidv4 } from 'uuid'

import AppHeader from './components/AppHeader.vue'
import TaskCreator from './components/TaskCreator.vue'
import TaskItem from './components/TaskItem.vue'
import TaskEditModal from './components/TaskEditModal.vue'
import BottomActionBar from './components/BottomActionBar.vue'
import StatsModal from './components/StatsModal.vue'

const API_BASE_URL = 'http://127.0.0.1:8000'
const CF_HEADER = 'my_super_secret_cloudflare_token_2026'

const authToken = ref(localStorage.getItem('access_token') || null)
const isLoggedIn = computed(() => !!authToken.value)
const isOfflineMode = ref(!isLoggedIn.value)
const showLoginModal = ref(false)
const isAuthLoading = ref(false)
const authForm = ref({ username: '', password: '' })
const lastSyncTime = ref(null)

const tasks = ref([])
const activeTasks = computed({
  get: () => tasks.value.filter(t => !t.is_deleted),
  set: (val) => {
    const deleted = tasks.value.filter(t => t.is_deleted)
    tasks.value = [...val, ...deleted]
  }
})

const newTaskTitle = ref('')
const newTaskMode = ref('stopwatch')
const workMinutes = ref(25)
const restMinutes = ref(5)
const longRestMinutes = ref(15)

const isOnline = ref(navigator.onLine)
const isDarkTheme = ref(localStorage.getItem('theme') !== 'light')
const now = ref(Date.now())
const notificationPermission = ref('default')
let timerInterval = null

const lastActiveTaskId = ref(localStorage.getItem('lastActiveTaskId') || null)
const showSummary = ref(false)
const fileInput = ref(null)

const mergeSameName = ref(localStorage.getItem('mergeSameName') === 'true')
watch(mergeSameName, v => localStorage.setItem('mergeSameName', String(v)))

const editingTask = ref(null)
const editForm = ref({ title: '', work: 25, rest: 5, longRest: 15 })

const quickEditTask = ref(null)
const quickEditMinutes = ref(25)

const statsMode = ref('day')
const selectedDate = ref('')
const selectedWeek = ref('')
const selectedMonth = ref('')
const selectedYear = ref('')

const colorPalette = [
  '#4CAF50','#2196F3','#FF9800','#E91E63','#9C27B0',
  '#00BCD4','#8BC34A','#FFC107','#F44336','#3F51B5','#009688','#795548'
]

const enableGuestMode = () => { isOfflineMode.value = true; showLoginModal.value = false }

const handleRegister = async () => {
  if (!authForm.value.username || !authForm.value.password) return alert('請輸入帳號密碼')
  isAuthLoading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Secure-Token': CF_HEADER },
      body: JSON.stringify(authForm.value)
    })
    if (res.ok) {
      alert('註冊成功，為您自動登入！')
      await handleLogin()
    } else {
      const data = await res.json()
      alert('註冊失敗: ' + (data.detail || '帳號已存在'))
    }
  } catch {
    alert('網路連線失敗')
  }
  isAuthLoading.value = false
}

const handleLogin = async () => {
  if (!authForm.value.username || !authForm.value.password) return alert('請輸入帳號密碼')
  isAuthLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('username', authForm.value.username)
    params.append('password', authForm.value.password)

    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-App-Secure-Token': CF_HEADER },
      body: params
    })

    if (res.ok) {
      const data = await res.json()
      authToken.value = data.access_token
      localStorage.setItem('access_token', data.access_token)
      isOfflineMode.value = false
      showLoginModal.value = false
      authForm.value = { username: '', password: '' }
      alert('登入成功！已啟動雲端同步')
      await syncWithServer()
    } else {
      alert('登入失敗，帳號或密碼錯誤')
    }
  } catch {
    alert('網路連線失敗')
  }
  isAuthLoading.value = false
}

const logout = () => {
  if (confirm('確定要登出嗎？將切換回純本地離線模式。')) {
    authToken.value = null
    localStorage.removeItem('access_token')
    enableGuestMode()
  }
}

const getDateStr = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const formatTimeStr = (seconds) => {
  if (isNaN(seconds) || seconds < 0) seconds = 0
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h > 0 ? h.toString().padStart(2,'0') + ':' : ''}${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

const getSplitLogs = (startTs, endTs) => {
  const logs = {}
  let cur = startTs
  while (cur < endTs) {
    const d = new Date(cur)
    const key = getDateStr(cur)
    const nextDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime()
    const stepEnd = Math.min(endTs, nextDay)
    logs[key] = (logs[key] || 0) + (stepEnd - cur) / 1000
    cur = stepEnd
  }
  return logs
}

const loadTasks = async () => {
  const loaded = await db.tasks.orderBy('order_rank').toArray()
  const currentTime = Date.now()

  tasks.value = loaded.map(t => {
    if (!t.logs) t.logs = t.duration > 0 ? { [getDateStr(currentTime)]: t.duration } : {}
    if (t.cycle_elapsed === undefined) t.cycle_elapsed = t.duration || 0
    if (t.rest_elapsed === undefined) t.rest_elapsed = 0
    if (!t.phase) t.phase = 'work'
    if (!t.rest_time) t.rest_time = 5 * 60
    if (!t.long_rest_time) t.long_rest_time = 15 * 60
    if (t.pomodoro_cycle === undefined) t.pomodoro_cycle = 0
    if (t.is_deleted === undefined) t.is_deleted = false

    if (t.is_running && t.start_time) {
      if (t.updated_at && t.updated_at > t.start_time) {
        t.start_time = t.start_time + (currentTime - t.updated_at)
      }
      lastActiveTaskId.value = t.id
      localStorage.setItem('lastActiveTaskId', t.id)
    } else {
      t.is_running = false
      t.start_time = null
    }

    return t
  })
}

const syncWithServer = async () => {
  if (!isLoggedIn.value || !isOnline.value) return
  try {
    const localTasks = await db.tasks.toArray()
    const payload = localTasks.map(t => ({
      id: t.id,
      title: t.title,
      mode: t.mode,
      target_time: t.target_time,
      rest_time: t.rest_time,
      long_rest_time: t.long_rest_time,
      logs: t.logs || {},
      updated_at: t.updated_at || Date.now(),
      is_deleted: !!t.is_deleted,
      is_running: !!t.is_running,
      start_time: t.start_time,
      phase: t.phase,
      cycle_elapsed: t.cycle_elapsed,
      rest_elapsed: t.rest_elapsed
    }))

    const res = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken.value}`,
        'X-App-Secure-Token': CF_HEADER
      },
      body: JSON.stringify({ tasks: payload })
    })

    if (res.ok) {
      const data = await res.json()
      const serverData = data.tasks.map(t => {
        const localT = localTasks.find(lt => lt.id === t.id)
        return {
          ...t,
          order_rank: localT ? localT.order_rank : String(Date.now()),
          duration: t.duration !== undefined ? t.duration : (localT ? localT.duration : 0),
          cycle_elapsed: t.cycle_elapsed !== undefined ? t.cycle_elapsed : (localT ? localT.cycle_elapsed : 0),
          rest_elapsed: t.rest_elapsed !== undefined ? t.rest_elapsed : (localT ? localT.rest_elapsed : 0),
          phase: t.phase || (localT ? localT.phase : 'work'),
          pomodoro_cycle: t.pomodoro_cycle || (localT ? localT.pomodoro_cycle : 0),
          is_running: t.is_running !== undefined ? t.is_running : (localT ? localT.is_running : false),
          start_time: t.start_time !== undefined ? t.start_time : (localT ? localT.start_time : null),
        }
      })
      await db.tasks.clear()
      await db.tasks.bulkAdd(serverData)
      await loadTasks()
      lastSyncTime.value = Date.now()
    } else if (res.status === 401) {
      alert('登入狀態已過期，請重新登入')
      logout()
    }
  } catch (err) {
    console.error('同步失敗', err)
  }
}

const getCurrentWorkSeconds = (t) => {
  let active = 0
  if (t.is_running && t.phase === 'work' && t.start_time) {
    let liveEnd = now.value
    if (t.mode === 'countdown' || t.mode === 'pomodoro') {
      const rem = Math.max(0, (t.target_time || 0) - (t.cycle_elapsed || 0))
      liveEnd = Math.min(liveEnd, t.start_time + rem * 1000)
    }
    active = (liveEnd - t.start_time) / 1000
  }
  return (t.cycle_elapsed || 0) + active
}

const getCurrentRestSeconds = (t) => {
  let active = 0
  if (t.is_running && (t.phase === 'rest' || t.phase === 'long_rest') && t.start_time) {
    const targetRest = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
    const rem = Math.max(0, targetRest - (t.rest_elapsed || 0))
    const liveEnd = Math.min(now.value, t.start_time + rem * 1000)
    active = (liveEnd - t.start_time) / 1000
  }
  return (t.rest_elapsed || 0) + active
}

const saveToDbAndSync = async (t) => {
  t.updated_at = Date.now()
  await db.tasks.put(JSON.parse(JSON.stringify(t)))
  syncWithServer()
}

const updateTaskLogs = async (t, endTsOverride = null) => {
  if (!t.is_running || !t.start_time) return
  let endTs = endTsOverride || Date.now()

  if (t.phase === 'work') {
    if ((t.mode === 'countdown' || t.mode === 'pomodoro') && !endTsOverride) {
      const rem = Math.max(0, (t.target_time || 0) - (t.cycle_elapsed || 0))
      endTs = Math.min(endTs, t.start_time + rem * 1000)
    }
    const split = getSplitLogs(t.start_time, endTs)
    t.logs = t.logs || {}
    for (const [k, v] of Object.entries(split)) t.logs[k] = (t.logs[k] || 0) + v
    const added = Object.values(split).reduce((a, b) => a + b, 0)
    t.duration = (t.duration || 0) + added
    t.cycle_elapsed = (t.cycle_elapsed || 0) + added
  } else {
    const targetRest = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
    if (!endTsOverride) {
      const rem = Math.max(0, targetRest - (t.rest_elapsed || 0))
      endTs = Math.min(endTs, t.start_time + rem * 1000)
    }
    t.rest_elapsed = (t.rest_elapsed || 0) + (endTs - t.start_time) / 1000
  }

  t.is_running = false
  t.start_time = null
  await saveToDbAndSync(t)
}

const stopAllOthers = async (excludeId) => {
  for (const t of tasks.value) {
    if (t.is_running && t.id !== excludeId) await updateTaskLogs(t)
  }
}

let isHandlingPhase = false
const handlePhaseComplete = async (t) => {
  if (isHandlingPhase) return
  isHandlingPhase = true

  try {
    const exactEnd = t.phase === 'work'
      ? t.start_time + ((t.target_time || 0) - (t.cycle_elapsed || 0)) * 1000
      : t.start_time + ((t.phase === 'long_rest' ? t.long_rest_time : t.rest_time) - (t.rest_elapsed || 0)) * 1000

    await updateTaskLogs(t, exactEnd)

    let msg = t.title
    if (t.phase === 'work') {
      msg += ' 專注完成！'
      t.cycle_elapsed = 0
      t.rest_elapsed = 0
      if (t.mode === 'pomodoro') {
        t.pomodoro_cycle = (t.pomodoro_cycle || 0) + 1
        t.phase = t.pomodoro_cycle >= 4 ? 'long_rest' : 'rest'
        if (t.pomodoro_cycle >= 4) t.pomodoro_cycle = 0
      } else {
        t.phase = 'rest'
      }
    } else {
      msg += ' 休息結束！'
      t.rest_elapsed = 0
      t.phase = 'work'
    }
    t.is_running = false
    await saveToDbAndSync(t)
    triggerAlarm(msg)
  } finally {
    isHandlingPhase = false
  }
}

const addTask = async () => {
  if (!newTaskTitle.value.trim()) return
  const newTask = {
    id: uuidv4(),
    title: newTaskTitle.value.trim(),
    order_rank: String(Date.now()),
    duration: 0,
    cycle_elapsed: 0,
    rest_elapsed: 0,
    logs: {},
    is_running: false,
    start_time: null,
    mode: newTaskMode.value,
    target_time: (newTaskMode.value !== 'stopwatch') ? workMinutes.value * 60 : 0,
    rest_time: restMinutes.value * 60,
    long_rest_time: longRestMinutes.value * 60,
    phase: 'work',
    pomodoro_cycle: 0,
    updated_at: Date.now(),
    is_deleted: false
  }
  await saveToDbAndSync(newTask)
  tasks.value.push(newTask)
  newTaskTitle.value = ''
}

const deleteTask = async (id) => {
  if (!confirm('確定要刪除這個項目嗎？')) return
  const t = tasks.value.find(x => x.id === id)
  if (t) {
    t.is_deleted = true
    t.is_running = false
    await saveToDbAndSync(t)
    if (lastActiveTaskId.value === id) {
      lastActiveTaskId.value = null
      localStorage.removeItem('lastActiveTaskId')
    }
  }
}

const resetTask = async (task) => {
  task.is_running = false
  task.cycle_elapsed = 0
  task.rest_elapsed = 0
  task.phase = 'work'
  task.pomodoro_cycle = 0
  task.start_time = null
  await saveToDbAndSync(task)
}

const onDragEnd = async () => {
  tasks.value.forEach((t, i) => {
    t.order_rank = String(i).padStart(5, '0')
    t.updated_at = Date.now()
    db.tasks.put(t)
  })
  syncWithServer()
}

const openEditModal = (t) => {
  editingTask.value = { ...t }
  editForm.value = {
    title: t.title,
    work: Math.floor((t.target_time || 0) / 60) || 25,
    rest: Math.floor((t.rest_time || 0) / 60) || 5,
    longRest: Math.floor((t.long_rest_time || 0) / 60) || 15
  }
}

const saveTaskEdit = async () => {
  if (!editingTask.value) return
  const t = tasks.value.find(x => x.id === editingTask.value.id)
  if (t) {
    if (editForm.value.title.trim()) t.title = editForm.value.title.trim()
    if (t.mode !== 'stopwatch') t.target_time = editForm.value.work * 60
    t.rest_time = editForm.value.rest * 60
    if (t.mode === 'pomodoro') t.long_rest_time = editForm.value.longRest * 60
    await saveToDbAndSync(t)
  }
  editingTask.value = null
}

const openQuickEditModal = (t) => {
  quickEditTask.value = t
  if (t.phase === 'work') {
    if (t.mode === 'stopwatch') return
    const rem = Math.max(0, (t.target_time || 0) - (t.cycle_elapsed || 0))
    quickEditMinutes.value = Math.ceil(rem / 60)
  } else {
    const totalRest = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
    const rem = Math.max(0, totalRest - (t.rest_elapsed || 0))
    quickEditMinutes.value = Math.ceil(rem / 60)
  }
}

const saveQuickEdit = async () => {
  const t = quickEditTask.value
  if (!t || quickEditMinutes.value <= 0) return

  const wasRunning = t.is_running
  if (wasRunning) await updateTaskLogs(t)

  const newRemSeconds = quickEditMinutes.value * 60

  if (t.phase === 'work') {
    t.cycle_elapsed = Math.max(0, t.target_time - newRemSeconds)
  } else {
    const totalRest = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
    t.rest_elapsed = Math.max(0, totalRest - newRemSeconds)
  }

  if (wasRunning) {
    t.is_running = true
    t.start_time = Date.now()
    now.value = t.start_time
  }

  await saveToDbAndSync(t)
  quickEditTask.value = null
}

const toggleTimer = async (targetTask) => {
  initAudio()
  if (notificationPermission.value === 'default') requestNotificationPermission()
  lastActiveTaskId.value = targetTask.id
  localStorage.setItem('lastActiveTaskId', targetTask.id)

  if (targetTask.is_running) {
    await updateTaskLogs(targetTask)
  } else {
    if (targetTask.phase === 'work' && targetTask.mode !== 'stopwatch') {
      if ((targetTask.cycle_elapsed || 0) >= targetTask.target_time) return
    } else if (targetTask.phase !== 'work') {
      const tr = targetTask.phase === 'long_rest' ? targetTask.long_rest_time : targetTask.rest_time
      if ((targetTask.rest_elapsed || 0) >= tr) return
    }
    await stopAllOthers(targetTask.id)
    targetTask.is_running = true
    targetTask.start_time = Date.now()
    now.value = targetTask.start_time
    await saveToDbAndSync(targetTask)
  }
}

const toggleRest = async (t) => {
  initAudio()
  if (notificationPermission.value === 'default') requestNotificationPermission()
  lastActiveTaskId.value = t.id
  localStorage.setItem('lastActiveTaskId', t.id)

  if (t.is_running) {
    await updateTaskLogs(t)
  }
  await stopAllOthers(t.id)

  t.phase = t.phase === 'work' ? 'rest' : 'work'

  if (t.phase === 'rest' || t.phase === 'long_rest') {
    t.rest_elapsed = 0
  }

  setTimeout(async () => {
    t.is_running = true
    t.start_time = Date.now()
    now.value = t.start_time
    await saveToDbAndSync(t)
  }, 50)
}

const resetAllTimes = async () => {
  if (!confirm('確定要將所有項目的「目前計時」歸零並暫停嗎？')) return
  for (const t of tasks.value) {
    t.is_running = false
    t.cycle_elapsed = 0
    t.rest_elapsed = 0
    t.phase = 'work'
    t.pomodoro_cycle = 0
    t.start_time = null
    t.updated_at = Date.now()
    await db.tasks.put(JSON.parse(JSON.stringify(t)))
  }
  syncWithServer()
}

const clearAllTasks = async () => {
  if (!confirm('確定要「徹底刪除」所有計時方塊嗎？此動作無法復原！')) return
  for (const t of tasks.value) {
    t.is_deleted = true
    t.is_running = false
    t.updated_at = Date.now()
    await db.tasks.put(JSON.parse(JSON.stringify(t)))
  }
  lastActiveTaskId.value = null
  localStorage.removeItem('lastActiveTaskId')
  syncWithServer()
}

const triggerImport = () => {
  if (fileInput.value) fileInput.value.click()
}

const handleImport = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (!Array.isArray(data)) throw new Error()
      if (!confirm('確定要匯入？這將覆蓋所有目前的方塊與紀錄！')) return
      await db.tasks.clear()
      await db.tasks.bulkAdd(data.map(t => ({ ...t, is_running: false, start_time: null, updated_at: Date.now() })))
      await loadTasks()
      syncWithServer()
      alert('匯入成功！')
    } catch {
      alert('匯入失敗：檔案格式不正確')
    }
    e.target.value = ''
  }
  reader.readAsText(file)
}

const exportData = async () => {
  const blob = new Blob([JSON.stringify(activeTasks.value.map(t => ({ ...t })), null, 2)], { type: 'application/json' })
  const filename = `Timer_Backup_${getDateStr(Date.now())}.json`
  try {
    if (window.showSaveFilePicker) {
      const h = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ accept: { 'application/json': ['.json'] } }]
      })
      const w = await h.createWritable()
      await w.write(blob)
      await w.close()
      alert('匯出成功！')
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (err) {
    if (err.name !== 'AbortError') alert('匯出失敗')
  }
}

const getWeekDays = (weekStr) => {
  if (!weekStr) return []
  const [yearStr, weekNumStr] = weekStr.split('-W')
  const year = parseInt(yearStr, 10)
  const weekNum = parseInt(weekNumStr, 10)

  const jan4 = new Date(year, 0, 4)
  const dayOfJan4 = (jan4.getDay() + 6) % 7
  const firstMonday = new Date(year, 0, 4 - dayOfJan4)

  const targetMonday = new Date(firstMonday.getTime() + (weekNum - 1) * 7 * 86400000)

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(targetMonday.getTime() + i * 86400000)
    days.push(getDateStr(d.getTime()))
  }
  return days
}

const getWeekRange = (weekStr) => {
  const days = getWeekDays(weekStr)
  if (days.length === 0) return { start: '', end: '' }
  return { start: days[0].substring(5), end: days[6].substring(5) }
}

const currentModeText = computed(() => {
  if (statsMode.value === 'total') return '所有歷史'
  if (statsMode.value === 'day') return selectedDate.value
  if (statsMode.value === 'week') {
    if (!selectedWeek.value) return '未選擇'
    const { start, end } = getWeekRange(selectedWeek.value)
    return `${start} ~ ${end}`
  }
  if (statsMode.value === 'month') return `${selectedMonth.value} 月份`
  if (statsMode.value === 'year') return `${selectedYear.value} 年份`
  return ''
})

const removeLogsByMode = (logs) => {
  if (statsMode.value === 'total') {
    for (const k in logs) delete logs[k]
  } else if (statsMode.value === 'day') {
    delete logs[selectedDate.value]
  } else if (statsMode.value === 'week') {
    const weekDays = getWeekDays(selectedWeek.value)
    weekDays.forEach(d => delete logs[d])
  } else if (statsMode.value === 'month') {
    for (const k in logs) {
      if (k.startsWith(selectedMonth.value)) delete logs[k]
    }
  } else if (statsMode.value === 'year') {
    for (const k in logs) {
      if (k.startsWith(selectedYear.value)) delete logs[k]
    }
  }
}

const processedTasks = computed(() => {
  const weekDays = statsMode.value === 'week' ? getWeekDays(selectedWeek.value) : []

  return activeTasks.value.map((task, i) => {
    const allLogs = { ...(task.logs || {}) }
    if (task.is_running && task.phase === 'work' && task.start_time) {
      let liveEnd = now.value
      if (task.mode !== 'stopwatch') {
        const rem = Math.max(0, (task.target_time || 0) - (task.cycle_elapsed || 0))
        liveEnd = Math.min(liveEnd, task.start_time + rem * 1000)
      }
      for (const [k, v] of Object.entries(getSplitLogs(task.start_time, liveEnd))) {
        allLogs[k] = (allLogs[k] || 0) + v
      }
    }

    let elapsed = 0
    if (statsMode.value === 'total') elapsed = Object.values(allLogs).reduce((a, b) => a + b, 0)
    else if (statsMode.value === 'day') elapsed = allLogs[selectedDate.value] || 0
    else if (statsMode.value === 'month') {
      for (const [k, v] of Object.entries(allLogs)) if (k.startsWith(selectedMonth.value)) elapsed += v
    } else if (statsMode.value === 'year') {
      for (const [k, v] of Object.entries(allLogs)) if (k.startsWith(selectedYear.value)) elapsed += v
    } else if (statsMode.value === 'week') {
      for (const d of weekDays) elapsed += (allLogs[d] || 0)
    }

    elapsed = Math.max(0, Math.floor(elapsed))
    return {
      ...task,
      elapsed,
      formattedTime: formatTimeStr(elapsed),
      color: colorPalette[i % colorPalette.length]
    }
  })
})

const activeStatsTasks = computed(() => {
  const withElapsed = processedTasks.value.filter(t => t.elapsed > 0)
  if (!mergeSameName.value) return withElapsed
  const map = new Map()
  withElapsed.forEach(t => {
    if (!map.has(t.title)) {
      map.set(t.title, {
        id: 'merged_' + t.title,
        title: t.title,
        elapsed: 0,
        color: t.color,
        isMerged: true,
        originalTasks: []
      })
    }
    const m = map.get(t.title)
    m.elapsed += t.elapsed
    m.originalTasks.push(t)
  })
  return Array.from(map.values())
    .map(m => ({ ...m, formattedTime: formatTimeStr(m.elapsed) }))
    .sort((a, b) => b.elapsed - a.elapsed)
})

const stopwatchTasks = computed(() => activeStatsTasks.value.filter(t => !t.isMerged && t.mode === 'stopwatch'))
const countdownTasks = computed(() => activeStatsTasks.value.filter(t => !t.isMerged && t.mode !== 'stopwatch'))
const mergedList = computed(() => activeStatsTasks.value.filter(t => t.isMerged))
const totalElapsedSeconds = computed(() => activeStatsTasks.value.reduce((a, t) => a + t.elapsed, 0))

const pieChartStyle = computed(() => {
  if (totalElapsedSeconds.value <= 0) return { background: 'var(--circle-bg)' }
  let str = ''
  let angle = 0
  activeStatsTasks.value.forEach(t => {
    if (t.elapsed <= 0) return
    const pct = (t.elapsed / totalElapsedSeconds.value) * 100
    str += `${t.color} ${angle}% ${angle + pct}%, `
    angle += pct
  })
  return { background: `conic-gradient(${str.slice(0, -2)})` }
})

const clearTaskStat = async (t) => {
  if (!confirm(`確定要清除「${t.title}」在 [${currentModeText.value}] 的統計？`)) return
  const targets = t.isMerged ? t.originalTasks : [t]
  for (const orig of targets) {
    const task = tasks.value.find(x => x.id === orig.id)
    if (task) {
      task.logs = { ...task.logs }
      removeLogsByMode(task.logs)
      await saveToDbAndSync(task)
    }
  }
}

const clearAllStats = async () => {
  if (!confirm(`確定要清除「所有項目」在 [${currentModeText.value}] 的統計？`)) return
  for (const t of activeTasks.value) {
    t.logs = { ...t.logs }
    removeLogsByMode(t.logs)
    await saveToDbAndSync(t)
  }
}

let audioCtx = null
const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
}

const playAlarmSound = () => {
  initAudio()
  const beep = (s) => {
    const osc = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 880
    g.gain.setValueAtTime(0.5, s)
    g.gain.exponentialRampToValueAtTime(0.01, s + 0.2)
    osc.connect(g)
    g.connect(audioCtx.destination)
    osc.start(s)
    osc.stop(s + 0.2)
  }
  const t = audioCtx.currentTime
  for (let i = 0; i < 3; i++) {
    beep(t + i * 0.8)
    beep(t + i * 0.8 + 0.25)
  }
}

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return
  notificationPermission.value = Notification.permission !== 'default'
    ? Notification.permission
    : await Notification.requestPermission()
}

const triggerAlarm = (msg) => {
  playAlarmSound()
  if (Notification.permission === 'granted') {
    new Notification('時間到！', { body: msg, icon: '/favicon.ico', requireInteraction: true })
  }
}

const applyTheme = () => {
  // 加上這行，把 class 綁在 html 標籤上
  document.documentElement.classList.toggle('dark-theme', isDarkTheme.value)
  // 這行保留給 body
  document.body.classList.toggle('dark-theme', isDarkTheme.value)
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  applyTheme()
}

const targetGlobalTask = computed(() => {
  if (!activeTasks.value.length) return null
  return activeTasks.value.find(t => t.id === lastActiveTaskId.value) || activeTasks.value[0]
})

onMounted(async () => {
  applyTheme()
  await loadTasks()

  if (isLoggedIn.value) {
    await syncWithServer()
  }

  const cd = new Date()
  const currentDateStr = getDateStr(cd.getTime())
  selectedDate.value = currentDateStr
  selectedMonth.value = currentDateStr.slice(0, 7)
  selectedYear.value = currentDateStr.slice(0, 4)

  const dateForWeek = new Date(cd.getTime())
  dateForWeek.setHours(0, 0, 0, 0)
  dateForWeek.setDate(dateForWeek.getDate() + 3 - (dateForWeek.getDay() + 6) % 7)
  const week1 = new Date(dateForWeek.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(((dateForWeek.getTime() - week1.getTime()) / 86400000) / 7)
  selectedWeek.value = `${dateForWeek.getFullYear()}-W${String(weekNum).padStart(2, '0')}`

  if ('Notification' in window) notificationPermission.value = Notification.permission

  timerInterval = setInterval(() => {
    now.value = Date.now()
    activeTasks.value.forEach(t => {
      if (!t.is_running) return
      if (isHandlingPhase) return

      if (t.phase === 'work' && t.mode !== 'stopwatch') {
        if ((t.target_time || 0) - getCurrentWorkSeconds(t) <= 0.1) handlePhaseComplete(t)
      } else if (t.phase === 'rest' || t.phase === 'long_rest') {
        const tr = t.phase === 'long_rest' ? t.long_rest_time : t.rest_time
        if (tr - getCurrentRestSeconds(t) <= 0.1) handlePhaseComplete(t)
      }
    })
  }, 100)

  window.addEventListener('online', () => {
    isOnline.value = true
    if (isLoggedIn.value) syncWithServer()
  })
  window.addEventListener('offline', () => isOnline.value = false)
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<style>
/* CSS 變數定義 */
:root {
  --bg-color: #f0f2f5;
  --text-color: #1a1a1a;
  --text-muted: #666666;
  --card-bg: #ffffff;
  --border-color: #cbd5e1;
  --input-bg: #ffffff;
  --input-text: #1a1a1a;
  --primary-color: #4CAF50;
  --danger-color: #ef4444;
  --circle-bg: #e2e8f0;
  --circle-color: #4CAF50;
  --icon-hover-bg: rgba(0,0,0,0.05);
  --badge-bg: #f1f5f9;
  --badge-text: #475569;
  --radio-color: #475569;
  --active-border: #4CAF50;
  --rest-color: #3b82f6;
  --rest-bg: #eff6ff;
  --rest-border: #bfdbfe;
  color-scheme: light;
}

body.dark-theme {
  --bg-color: #121212;
  --text-color: #e4e4e7;
  --text-muted: #a1a1aa;
  --card-bg: #1e1e1e;
  --border-color: #333333;
  --input-bg: #2d2d2d;
  --input-text: #e4e4e7;
  --primary-color: #34d399;
  --danger-color: #f87171;
  --circle-bg: #333333;
  --circle-color: #34d399;
  --icon-hover-bg: rgba(255,255,255,0.1);
  --badge-bg: #333333;
  --badge-text: #d4d4d8;
  --radio-color: #34d399;
  --active-border: #34d399;
  --rest-color: #60a5fa;
  --rest-bg: #172554;
  --rest-border: #1e3a8a;
  color-scheme: dark;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

#app {
  width: 100%;
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 100%;
}

.app-container {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
  padding: 30px 4vw 90px;
  display: flex;
  flex-direction: column;
}

.custom-input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--input-bg);
  color: var(--input-text);
  font-size: 16px;
  font-family: inherit;
}
.custom-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(76,175,80,0.2);
}

.card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
}

.card.is-active {
  border-color: var(--active-border);
  box-shadow: 0 0 15px rgba(76,175,80,0.3);
}

.card.is-resting {
  border-color: var(--rest-color);
  background-color: var(--rest-bg);
  box-shadow: 0 0 15px rgba(59,130,246,0.2);
}

.header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-bottom: 10px;
  position: relative;
}

.header h1 {
  margin: 0;
  font-size: 2em;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  color: var(--text-color);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  min-width: 44px;
  z-index: 10;
}

.theme-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
}

.theme-toggle-btn:hover {
  background: var(--icon-hover-bg);
  transform: scale(1.1);
}

.theme-icon {
  width: 28px;
  height: 28px;
}

.dropdown-container {
  position: relative;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 98;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  padding: 8px 0;
  min-width: 180px;
  border-radius: 12px;
  z-index: 99;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background: var(--icon-hover-bg);
}

.dropdown-item.warning:hover {
  color: #f59e0b;
}

.dropdown-item.danger:hover {
  color: var(--danger-color);
}

.menu-icon {
  width: 18px;
  height: 18px;
}

.menu-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 4px 0;
}

.network-status {
  font-size: 0.9em;
  color: var(--text-muted);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 30px;
  align-items: start;
  width: 100%;
}

@media (max-width: 500px) {
  .task-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  z-index: 50;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
  transition: background 0.3s, border-color 0.3s;
}

.action-btn, .primary-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  transition: opacity 0.2s, transform 0.2s;
}

.action-btn svg, .primary-btn svg {
  width: 20px;
  height: 20px;
}

.primary-btn {
  background: var(--primary-color);
}

.action-btn:hover, .primary-btn:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.action-btn.info {
  background-color: #3b82f6;
}

.action-btn.danger {
  background-color: var(--danger-color);
}

.global-ctrl-btn {
  padding: 14px 20px;
  font-size: 18px;
  border-radius: 30px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background-color: var(--primary-color);
  color: white;
}

.global-ctrl-btn.pause {
  background-color: var(--danger-color);
}

.global-ctrl-btn svg, .main-summary-btn svg {
  width: 24px;
  height: 24px;
}

.main-summary-btn {
  padding: 14px 30px;
  font-size: 18px;
  border-radius: 30px;
  box-shadow: 0 4px 10px rgba(59,130,246,0.3);
  background-color: #3b82f6;
  color: white;
}

/* 修正 TaskItem 右上角按鈕與底下的行為 */
.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--icon-hover-bg);
  color: var(--text-color);
}

.icon-btn.danger:hover {
  background: rgba(239,68,68,0.1);
  color: var(--danger-color);
}

/* 這裡不要用 display: block，SVG 會隨外層 flex 正常對齊 */
.action-icon {
  width: 18px;
  height: 18px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 4px;
}

.modal-title {
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 15px;
  color: var(--text-color);
}

.modal-buttons {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.modal-buttons .action-btn,
.modal-buttons .primary-btn {
  margin: 0;
  flex: 1;
  justify-content: center;
}

@media (max-width: 500px) {
  .header h1 {
    font-size: 1.4em;
  }
  .modal-buttons {
    flex-direction: column;
  }
}

.actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>