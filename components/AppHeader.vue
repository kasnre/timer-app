<template>
  <div class="header-container">
    <div class="header">
      <div class="header-left">
        <div class="dropdown-container">
          <button @click="showMenu = !showMenu" class="theme-toggle-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="theme-icon">
              <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 15z" clip-rule="evenodd" />
            </svg>
          </button>
          <div v-if="showMenu" class="dropdown-overlay" @click="showMenu = false"></div>
          <div v-if="showMenu" class="dropdown-menu card">
            
            <!-- 帳號管理區塊 -->
            <template v-if="!isLoggedIn">
              <button @click="emit('open-login'); showMenu = false" class="dropdown-item" style="color: var(--primary-color)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" /></svg>
                登入 / 註冊雲端同步
              </button>
            </template>
            <template v-else>
              <div class="dropdown-item" style="cursor: default; font-size: 0.85em; color: var(--text-muted)">
                🟢 已登入同步中
              </div>
              <button @click="emit('logout'); showMenu = false" class="dropdown-item warning">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon"><path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
                登出帳號
              </button>
            </template>

            <div class="menu-divider"></div>

            <!-- 原本的功能 -->
            <button @click="emit('export'); showMenu = false" class="dropdown-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon"><path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>
              匯出方塊紀錄
            </button>
            <button @click="emit('import'); showMenu = false" class="dropdown-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon"><path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>
              匯入方塊紀錄
            </button>
            <div class="menu-divider"></div>
            <button @click="emit('reset-times'); showMenu = false" class="dropdown-item warning">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon"><path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clip-rule="evenodd" /></svg>
              重置目前時間
            </button>
            <button @click="emit('clear-all'); showMenu = false" class="dropdown-item danger">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="menu-icon"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" /></svg>
              清空所有方塊
            </button>
          </div>
        </div>
      </div>

      <h1>跨平台專注計時器</h1>

      <div class="header-right">
        <button @click="emit('toggle-theme')" class="theme-toggle-btn">
          <svg v-if="!isDarkTheme" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="theme-icon">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM6.166 17.834a.75.75 0 001.06 1.06l1.59-1.591a.75.75 0 10-1.06-1.061l-1.591 1.59zM4.5 12a.75.75 0 01-.75.75H1.5a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM6.166 6.166a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.06 1.06l1.591 1.59z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="theme-icon">
            <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <div class="network-status">
      {{ isOnline ? '🟢 已連線 (背景同步準備就緒)' : '🔴 離線模式 (本地儲存)' }}
      <span v-if="notificationPermission === 'denied'" style="color:var(--danger-color);margin-left:10px">
        (請允許通知權限以確保桌面提醒正常)
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ isOnline: Boolean, isDarkTheme: Boolean, notificationPermission: String, isLoggedIn: Boolean })
const emit = defineEmits(['toggle-theme', 'export', 'import', 'reset-times', 'clear-all', 'open-login', 'logout'])
const showMenu = ref(false)
</script>

<style scoped>
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

.header-left,
.header-right {
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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

@media (max-width: 500px) {
  .header h1 {
    font-size: 1.4em;
  }
}
</style>