<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content card" style="max-width:400px">
      <h2 class="modal-title" style="font-size:1.2em">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fill-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.097.078.15.222.15.399v.2c0 .178-.053.322-.15.4l-.84.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.31.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.675-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.097-.078-.15-.221-.15-.4v-.2c0-.177.053-.322.15-.4l.84-.692a1.875 1.875 0 00.432-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clip-rule="evenodd" /></svg>
        設定方塊
      </h2>
      <form @submit.prevent="emit('save')" style="display:flex;flex-direction:column;gap:15px;margin-bottom:20px">
        <label style="display:flex;flex-direction:column;gap:5px;font-weight:bold">
          方塊名稱：
          <input
            ref="titleRef"
            type="text"
            :value="editForm.title"
            @input="update('title', $event.target.value)"
            class="custom-input"
            :autofocus="true"
            @keyup.enter="editingTask.mode !== 'stopwatch' ? focusRef(workRef) : focusRef(restRef)"
          />
        </label>
        <label v-if="editingTask.mode !== 'stopwatch'" style="display:flex;flex-direction:column;gap:5px;font-weight:bold">
          工作時間 (分)：
          <input
            ref="workRef"
            type="number"
            :value="editForm.work"
            @input="update('work', Number($event.target.value))"
            class="custom-input"
            min="1"
            @keyup.enter="focusRef(restRef)"
          />
        </label>
        <label style="display:flex;flex-direction:column;gap:5px;font-weight:bold">
          休息時間 (分)：
          <input
            ref="restRef"
            type="number"
            :value="editForm.rest"
            @input="update('rest', Number($event.target.value))"
            class="custom-input"
            min="1"
            @keyup.enter="editingTask.mode === 'pomodoro' ? focusRef(longRestRef) : emit('save')"
          />
        </label>
        <label v-if="editingTask.mode === 'pomodoro'" style="display:flex;flex-direction:column;gap:5px;font-weight:bold">
          長休息時間 (分)：
          <input
            ref="longRestRef"
            type="number"
            :value="editForm.longRest"
            @input="update('longRest', Number($event.target.value))"
            class="custom-input"
            min="1"
            @keyup.enter="emit('save')"
          />
        </label>
        <!-- hidden submit so Enter on form works -->
        <button type="submit" style="display:none" aria-hidden="true"></button>
      </form>
      <div class="modal-buttons">
        <button @click="emit('save')" class="primary-btn">儲存設定</button>
        <button @click="emit('close')" class="action-btn" style="background:transparent;border:1px solid var(--border-color);color:var(--text-color)">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
const props = defineProps({ editingTask: Object, editForm: Object })
const emit = defineEmits(['save', 'close', 'update:editForm'])
const update = (key, val) => emit('update:editForm', { ...props.editForm, [key]: val })

const titleRef = ref(null)
const workRef = ref(null)
const restRef = ref(null)
const longRestRef = ref(null)
const focusRef = (r) => nextTick(() => r?.focus())
</script>
