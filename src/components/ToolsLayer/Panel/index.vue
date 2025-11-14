<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/modules/editor'
import { storeToRefs } from 'pinia'
import { panels } from '@/enums/editor'
import TextPanel from './TextPanel/index.vue'
import ShapePanel from './ShapePanel/index.vue'

const editorStore = useEditorStore()
const { showPanel, panelType } = storeToRefs(editorStore)

const panelTitle = computed(() => {
  switch (panelType.value) {
    case panels.text:
      return '文本'
    case panels.shape:
      return '形状'
    case panels.upload:
      return '上传'
    default:
      return ''
  }
})
const closePanel = () => {
  editorStore.setShowPanel(false)
}
</script>

<template>
  <div v-show="showPanel">
    <div class="bg-white rounded-md flex flex-col h-[calc(100vh-140px)] relative w-[280px]">
      <div
        class="panel-header flex items-center justify-between border-b border-[#DCDFE6] h-[48px] pl-4 pr-2 relative w-full z-1"
      >
        <span>{{ panelTitle }}</span>
        <el-button text :icon="X" @click="closePanel" />
      </div>
      <div class="panel-content flex-1 overflow-y-auto p-4">
        <TextPanel v-if="panelType === panels.text" />
        <ShapePanel v-if="panelType === panels.shape" />
      </div>
    </div>
  </div>
</template>
