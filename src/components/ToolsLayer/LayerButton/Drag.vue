<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEditorStore } from '@/stores/modules/editor'
const editorStore = useEditorStore()
const dragEnabled = ref(false)

const switchMode = (val) => {
  if (val) {
    editorStore.editor?.startDring()
  } else {
    editorStore.editor?.endDring()
  }
}

onMounted(() => {
  nextTick(() => {
    editorStore.editor?.on('startDring', () => (dragEnabled.value = true))
    editorStore.editor?.on('endDring', () => (dragEnabled.value = false))
  })
})

onBeforeUnmount(() => {
  editorStore.editor?.off('startDring')
  editorStore.editor?.off('endDring')
})
</script>

<template>
  <el-switch
    class="mr-10px"
    size="large"
    v-model="dragEnabled"
    width="60"
    inline-prompt
    active-text="拖拽"
    inactive-text="选择"
    @change="switchMode"
  />
</template>
