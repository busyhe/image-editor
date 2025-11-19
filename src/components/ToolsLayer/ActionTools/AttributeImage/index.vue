<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Layers2 } from 'lucide-vue-next'
import useSelect from '@/hooks/select'
import { useEditorStore } from '@/stores/modules/editor'
import { Utils } from '@/lib/core'

interface IExtendImage {
  [x: string]: any
  originWidth?: number
  originHeight?: number
  originSrc?: string
}

const editorStore = useEditorStore()
const { isOne } = useSelect()
const isImage = ref(false)

const getActiveObject = (): (fabric.Image & IExtendImage) | undefined => {
  const activeObject = editorStore.canvas?.getActiveObject()
  if (!activeObject || !Utils.isImage(activeObject)) return
  return activeObject
}

const handleSelectOne = () => {
  isImage.value = !!getActiveObject()
}

onMounted(() => {
  nextTick(() => {
    editorStore.editor?.on('selectOne', handleSelectOne)
  })
})

onBeforeUnmount(() => {
  editorStore.editor.off('selectOne', handleSelectOne)
})
</script>

<template>
  <div v-if="isOne && isImage" class="inline-block">
    <el-button title="编辑元素">
      <Layers2 :size="16" />
    </el-button>
  </div>
</template>
