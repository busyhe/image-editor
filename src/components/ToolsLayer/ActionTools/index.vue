<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { fabric } from 'fabric'
import { useEditorStore } from '@/stores/modules/editor'

const defaultPosition = { shadow: '', fontFamily: 'arial' }
const editorStore = useEditorStore()

const handleAddShape = () => {
  const rect = new fabric.Rect({
    ...defaultPosition,
    fill: '#F57274FF',
    width: 400,
    height: 400,
    name: '矩形',
  })

  console.debug('[DEBUG__ActionTools/index.vue-editorStore.editor]', editorStore.editor)
  editorStore.editor.addBaseType(rect, { center: true })
}

onMounted(() => {})
</script>

<template>
  <div class="flex justify-center gap-2">
    <el-button @click="handleAddShape">
      <el-icon>
        <Plus />
      </el-icon>
    </el-button>
  </div>
</template>
