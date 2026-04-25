import Dexie from 'dexie';

export const db = new Dexie('TimerAppDB');
db.version(2).stores({ // 升級版本號到 2 以套用新結構
  tasks: 'id, title, order_rank, duration, is_running, start_time, mode, target_time'
});