<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content card">
      <h2 class="modal-title" style="color: var(--text-color);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        時間使用統整
      </h2>

      <div class="stats-controls">
        <div class="stats-tabs">
          <button :class="{ active: statsMode === 'total' }" @click="emit('update:statsMode', 'total')">總計</button>
          <button :class="{ active: statsMode === 'day' }" @click="emit('update:statsMode', 'day')">日</button>
          <button :class="{ active: statsMode === 'week' }" @click="emit('update:statsMode', 'week')">週</button>
          <button :class="{ active: statsMode === 'month' }" @click="emit('update:statsMode', 'month')">月</button>
          <button :class="{ active: statsMode === 'year' }" @click="emit('update:statsMode', 'year')">年</button>
        </div>

        <div class="stats-filters">
          <input v-if="statsMode === 'day'" type="date" :value="selectedDate" @input="emit('update:selectedDate', $event.target.value)" class="custom-date-input" />
          
          <!-- 週選擇器，使用原生 input type="week" -->
          <div v-else-if="statsMode === 'week'" style="display:flex; flex-direction:column; align-items:center; gap:5px;">
            <input type="week" :value="selectedWeek" @input="emit('update:selectedWeek', $event.target.value)" class="custom-date-input" />
            <span v-if="selectedWeek" style="font-size:0.85em; color:var(--text-muted);">
              {{ weekRangeStr }}
            </span>
          </div>

          <input v-else-if="statsMode === 'month'" type="month" :value="selectedMonth" @input="emit('update:selectedMonth', $event.target.value)" class="custom-date-input" />
          
          <select v-else-if="statsMode === 'year'" :value="selectedYear" @change="emit('update:selectedYear', $event.target.value)" class="custom-date-input">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }} 年</option>
          </select>
        </div>
      </div>

      <div class="pie-container">
        <div 
          class="pie-chart" 
          :style="pieChartStyle" 
          @click="toggleMerge" 
          title="點擊切換：合併同名項目 / 分開顯示"
        ></div>
        
        <div v-if="totalElapsedSeconds <= 0" class="pie-empty-text">無紀錄</div>
        
        <div v-if="totalElapsedSeconds > 0" class="merge-hint">
          (點擊圖表可切換模式：目前為 <strong>{{ mergeSameName ? '合併同名' : '分開顯示' }}</strong>)
        </div>
      </div>

      <div class="summary-lists">
        <template v-if="mergeSameName">
          <div class="summary-group">
            <h3 class="group-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right:4px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              合併同名項目
            </h3>
            <div v-for="t in mergedList" :key="t.id" class="summary-item">
              <div class="summary-item-left">
                <span class="color-dot" :style="{ backgroundColor: t.color }"></span>
                <span class="summary-title">{{ t.title }}</span>
              </div>
              <div class="summary-item-right">
                <span class="summary-time">{{ t.formattedTime }}</span>
                <button @click="emit('clear-task', t)" class="stat-delete-btn" title="清除此項目在此區間的統計">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            <div v-if="mergedList.length === 0" class="empty-text">目前區間尚無紀錄</div>
          </div>
        </template>
        
        <template v-else>
          <div class="summary-group" v-if="stopwatchTasks.length > 0">
            <h3 class="group-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right:4px;"><polyline points="12 8 12 12 14 14"></polyline><circle cx="12" cy="12" r="10"></circle></svg>
              正向計時
            </h3>
            <div v-for="t in stopwatchTasks" :key="t.id" class="summary-item">
              <div class="summary-item-left">
                <span class="color-dot" :style="{ backgroundColor: t.color }"></span>
                <span class="summary-title">{{ t.title }}</span>
              </div>
              <div class="summary-item-right">
                <span class="summary-time">{{ t.formattedTime }}</span>
                <button @click="emit('clear-task', t)" class="stat-delete-btn" title="清除此項目在此區間的統計">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="summary-group" v-if="countdownTasks.length > 0">
            <h3 class="group-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right:4px;"><path d="M10 2h4"></path><path d="M12 14v-4"></path><path d="M4 13a8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8"></path></svg>
              倒數 / 番茄鐘
            </h3>
            <div v-for="t in countdownTasks" :key="t.id" class="summary-item">
              <div class="summary-item-left">
                <span class="color-dot" :style="{ backgroundColor: t.color }"></span>
                <span class="summary-title">{{ t.title }}</span>
              </div>
              <div class="summary-item-right">
                <span class="summary-time">{{ t.formattedTime }}</span>
                <button @click="emit('clear-task', t)" class="stat-delete-btn" title="清除此項目在此區間的統計">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
          <div v-if="!mergeSameName && activeStatsTasks.length === 0" class="empty-text">目前區間尚無紀錄</div>
        </template>
      </div>

      <div class="summary-total">
        <span style="font-weight:bold; color:var(--text-color)">此區間總專注：</span>
        <span class="total-time-text">{{ formatTimeStr(totalElapsedSeconds) }}</span>
      </div>

      <div class="modal-buttons">
        <button v-if="totalElapsedSeconds > 0" @click="emit('clear-all-stats')" class="action-btn danger">
          清除 {{ currentModeText }} 紀錄
        </button>
        <button @click="emit('close')" class="primary-btn">關閉視窗</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  statsMode: String,
  selectedDate: String,
  selectedWeek: String,
  selectedMonth: String,
  selectedYear: String,
  mergeSameName: Boolean,
  pieChartStyle: Object,
  totalElapsedSeconds: Number,
  stopwatchTasks: Array,
  countdownTasks: Array,
  mergedList: Array,
  activeStatsTasks: Array,
  currentModeText: String,
  formatTimeStr: Function
})

const emit = defineEmits([
  'update:statsMode', 
  'update:selectedDate', 
  'update:selectedWeek',
  'update:selectedMonth', 
  'update:selectedYear', 
  'update:mergeSameName', 
  'clear-task', 
  'clear-all-stats', 
  'close'
])

// 為了讓週選擇器下面顯示日期範圍，我們需要跟 App.vue 一樣的解析邏輯
const weekRangeStr = computed(() => {
  if (!props.selectedWeek) return ''
  const [yearStr, weekNumStr] = props.selectedWeek.split('-W')
  const year = parseInt(yearStr, 10)
  const weekNum = parseInt(weekNumStr, 10)
  
  const firstDayOfYear = new Date(year, 0, 1)
  const daysOffset = firstDayOfYear.getDay()
  const firstSunday = new Date(year, 0, 1 - daysOffset)
  const targetSunday = new Date(firstSunday.getTime() + (weekNum - 1) * 7 * 86400000)
  const targetSaturday = new Date(targetSunday.getTime() + 6 * 86400000)
  
  const m1 = String(targetSunday.getMonth() + 1).padStart(2, '0')
  const d1 = String(targetSunday.getDate()).padStart(2, '0')
  const m2 = String(targetSaturday.getMonth() + 1).padStart(2, '0')
  const d2 = String(targetSaturday.getDate()).padStart(2, '0')
  
  return `${m1}/${d1} ~ ${m2}/${d2}`
})

const yearOptions = Array.from({ length: 11 }, (_, i) => String(2020 + i))

const toggleMerge = () => {
  emit('update:mergeSameName', !props.mergeSameName)
}
</script>

<style scoped>
.modal-title { margin:0 0 20px 0; display:flex; align-items:center; justify-content:center; gap:8px; border-bottom:2px solid var(--border-color); padding-bottom:15px; }

.stats-controls { display:flex; flex-direction:column; gap:15px; margin-bottom:25px; }
.stats-tabs { display:flex; background:var(--bg-color); border-radius:8px; padding:4px; }
.stats-tabs button { flex:1; padding:8px 0; border:none; background:transparent; color:var(--text-muted); border-radius:6px; cursor:pointer; font-weight:bold; transition:all 0.2s; }
.stats-tabs button.active { background: var(--primary-color); color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.stats-filters { display:flex; justify-content:center; }

/* 原生日期元件顏色的靈魂：透過 color-scheme 告訴瀏覽器套用明暗 */
.custom-date-input {
  color-scheme: light dark; /* 重要！瀏覽器會自動根據背景反轉日曆與選擇器顏色 */
  box-sizing: border-box;
  height: 42px;
  line-height: 40px;
  padding: 0 10px;
  max-width: 250px;
  width: 100%;
  text-align: center;
  font-weight: bold;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: var(--input-bg);
  color: var(--input-text);
  font-family: inherit;
}

/* 在深色模式下確保日曆圖示不會因為背景黑而消失（Safari 支援）*/
@media (prefers-color-scheme: dark) {
  body.dark-theme .custom-date-input::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
}

.pie-container { position:relative; display:flex; flex-direction:column; justify-content:center; align-items:center; margin-bottom:30px; }
.pie-chart { width: 240px; height: 240px; border-radius: 50%; box-shadow: 0 6px 20px rgba(0,0,0,0.15); border: 4px solid var(--card-bg); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.pie-chart:hover { transform: scale(1.02); box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
.pie-chart:active { transform: scale(0.98); }
.pie-empty-text { position:absolute; top: 50%; transform: translateY(-50%); color:var(--text-muted); font-weight:bold; font-size:1.2em; pointer-events:none; }

.merge-hint { margin-top: 15px; font-size: 0.85em; color: var(--text-muted); }
.merge-hint strong { color: var(--text-color); }

.summary-lists { margin-bottom:25px; }
.summary-group { margin-bottom:20px; }
.group-title { margin:0 0 10px 0; font-size:1.1em; color:var(--text-muted); }
.summary-item { display:flex; justify-content:space-between; align-items:center; padding:12px 15px; background:var(--bg-color); border-radius:8px; margin-bottom:10px; }
.summary-item-left,.summary-item-right { display:flex; align-items:center; gap:10px; }
.color-dot { width:14px; height:14px; border-radius:50%; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
.summary-title { font-weight:bold; color:var(--text-color); }
.summary-time { font-family:'Courier New',monospace; font-weight:bold; color:var(--text-color); }
.empty-text { text-align:center; color:var(--text-muted); padding:20px 0; }
.summary-total { display:flex; justify-content:space-between; align-items:center; padding:15px 20px; background:rgba(76,175,80,0.1); border-radius:8px; border:1px solid var(--primary-color); margin-bottom:15px; }
.total-time-text { color:var(--primary-color); font-weight:bold; font-size:1.4em; font-family:'Courier New',monospace; }
.stat-delete-btn { background:transparent; border:none; cursor:pointer; color:var(--text-muted); display:flex; align-items:center; padding:4px; border-radius:4px; transition:background 0.2s,color 0.2s; }
.stat-delete-btn:hover { background:rgba(239,68,68,0.1); color:var(--danger-color); }
</style>