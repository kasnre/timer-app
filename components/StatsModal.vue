<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card stats-modal">
      <div class="stats-header">
        <h2 class="stats-title">統計資料</h2>
        <button @click="$emit('close')" class="icon-btn" style="padding:4px">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="stats-controls">
        <div class="stats-tabs">
          <button :class="{ active: statsMode === 'day' }" @click="$emit('update:statsMode', 'day')">日</button>
          <button :class="{ active: statsMode === 'week' }" @click="$emit('update:statsMode', 'week')">週</button>
          <button :class="{ active: statsMode === 'month' }" @click="$emit('update:statsMode', 'month')">月</button>
          <button :class="{ active: statsMode === 'year' }" @click="$emit('update:statsMode', 'year')">年</button>
          <button :class="{ active: statsMode === 'total' }" @click="$emit('update:statsMode', 'total')">總計</button>
        </div>

        <div class="stats-filters" v-if="statsMode !== 'total'">
          <input
            v-if="statsMode === 'day'"
            type="date"
            :value="selectedDate"
            @input="$emit('update:selectedDate', $event.target.value)"
            class="custom-date-input"
          />
          <input
            v-if="statsMode === 'week'"
            type="week"
            :value="selectedWeek"
            @input="$emit('update:selectedWeek', $event.target.value)"
            class="custom-date-input"
          />
          <input
            v-if="statsMode === 'month'"
            type="month"
            :value="selectedMonth"
            @input="$emit('update:selectedMonth', $event.target.value)"
            class="custom-date-input"
          />
          <!-- 年分改用 select 下拉選單 -->
          <div v-if="statsMode === 'year'" style="width:100%; display:flex; justify-content:center;">
            <select
              :value="selectedYear"
              @change="$emit('update:selectedYear', $event.target.value)"
              class="custom-date-input"
              style="cursor: pointer; appearance: auto;"
            >
              <option v-for="year in yearOptions" :key="year" :value="year.toString()">
                {{ year }} 年
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="pie-wrap" v-if="totalElapsedSeconds > 0">
        <div class="pie-container" @click="$emit('update:mergeSameName', !mergeSameName)" style="cursor: pointer;" title="點擊切換：合併/展開 同名項目">
          <div class="pie-chart" :style="pieChartStyle"></div>
        </div>
        <p style="text-align: center; font-size: 0.85em; color: var(--text-muted); margin-top: -15px; margin-bottom: 20px;">
          (點擊圓餅圖可{{ mergeSameName ? '展開' : '合併' }}同名項目)
        </p>
      </div>

      <div class="summary-lists">
        <div v-if="activeStatsTasks.length === 0" class="empty-text">
          此區間無計時紀錄
        </div>
        <template v-else>
          <!-- 合併顯示模式 -->
          <div v-if="mergeSameName" class="summary-group">
            <h3 class="group-title">任務統計 (已合併同名)</h3>
            <div v-for="t in mergedList" :key="t.id" class="summary-item">
              <div class="summary-item-left">
                <div class="color-dot" :style="{ backgroundColor: t.color }"></div>
                <span class="summary-title">{{ t.title }}</span>
              </div>
              <div class="summary-item-right">
                <span class="summary-time">{{ t.formattedTime }}</span>
                <button @click="$emit('clear-task', t)" class="icon-btn danger" style="padding:4px" title="清除此項紀錄">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.44.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 獨立顯示模式 -->
          <template v-else>
            <div v-if="stopwatchTasks.length > 0" class="summary-group">
              <h3 class="group-title">正向計時</h3>
              <div v-for="t in stopwatchTasks" :key="t.id" class="summary-item">
                <div class="summary-item-left">
                  <div class="color-dot" :style="{ backgroundColor: t.color }"></div>
                  <span class="summary-title">{{ t.title }}</span>
                </div>
                <div class="summary-item-right">
                  <span class="summary-time">{{ t.formattedTime }}</span>
                  <button @click="$emit('clear-task', t)" class="icon-btn danger" style="padding:4px" title="清除此項紀錄">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.44.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="countdownTasks.length > 0" class="summary-group">
              <h3 class="group-title">倒數 / 番茄鐘</h3>
              <div v-for="t in countdownTasks" :key="t.id" class="summary-item">
                <div class="summary-item-left">
                  <div class="color-dot" :style="{ backgroundColor: t.color }"></div>
                  <span class="summary-title">{{ t.title }}</span>
                </div>
                <div class="summary-item-right">
                  <span class="summary-time">{{ t.formattedTime }}</span>
                  <button @click="$emit('clear-task', t)" class="icon-btn danger" style="padding:4px" title="清除此項紀錄">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.44.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <div class="summary-total">
        <span style="font-weight: bold; color: var(--text-color);">總專注時間</span>
        <span class="total-time-text">{{ formatTimeStr(totalElapsedSeconds) }}</span>
      </div>

      <div style="text-align: center; margin-top: 15px;" v-if="activeStatsTasks.length > 0">
        <button @click="$emit('clear-all-stats')" class="action-btn danger" style="width: 100%; justify-content: center;">
          清除 [{{ currentModeText }}] 的所有統計紀錄
        </button>
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

defineEmits([
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

// 產生下拉選單用的年份陣列 (從現在的年份往前推 10 年，往後推 10 年)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push(i)
  }
  // 確保當前選擇的年份也有在清單裡
  if (props.selectedYear && !years.includes(Number(props.selectedYear))) {
    years.push(Number(props.selectedYear))
    years.sort((a, b) => a - b)
  }
  return years
})
</script>

<style scoped>
.stats-modal {
  display: flex;
  flex-direction: column;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 15px;
}

.stats-title {
  margin: 0;
  font-size: 1.5em;
  color: var(--text-color);
}

.stats-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.stats-tabs {
  display: flex;
  background: var(--bg-color);
  border-radius: 8px;
  padding: 4px;
}

.stats-tabs button {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.stats-tabs button.active {
  background: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.stats-filters {
  display: flex;
  justify-content: center;
}

.custom-date-input {
  width: 100%;
  max-width: 250px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--input-bg);
  color: var(--input-text);
  font-size: 16px;
  text-align: center;
  font-family: inherit;
}

.pie-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pie-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
  transition: transform 0.2s;
}
.pie-container:hover {
  transform: scale(1.02);
}

.pie-chart {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  border: 4px solid var(--card-bg);
}

.summary-lists {
  margin-bottom: 25px;
}

.summary-group {
  margin-bottom: 20px;
}

.group-title {
  margin: 0 0 10px 0;
  font-size: 1.1em;
  color: var(--text-muted);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: var(--bg-color);
  border-radius: 8px;
  margin-bottom: 10px;
}

.summary-item-left,
.summary-item-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.summary-title {
  font-weight: bold;
  color: var(--text-color);
}

.summary-time {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--text-color);
}

.empty-text {
  text-align: center;
  color: var(--text-muted);
  padding: 20px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(76,175,80,0.1);
  border-radius: 8px;
  border: 1px solid var(--primary-color);
  margin-bottom: 15px;
}

.total-time-text {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.4em;
  font-family: 'Courier New', monospace;
}
</style>