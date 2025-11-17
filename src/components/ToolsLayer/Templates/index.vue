<script setup lang="ts">
import { ref } from 'vue'
import { useTemplateStore } from '@/stores/modules/template'
import { storeToRefs } from 'pinia'
import TemplateThumb from './TemplateThumb.vue'
import Draggable from 'vuedraggable'
import { Plus, Copy, Trash2 } from 'lucide-vue-next'
import { ElMessageBox } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import type { Template } from '@/types/template'

const templateStore = useTemplateStore()
const { templateList, curTempIdx } = storeToRefs(templateStore)

const templatesLoadLimit = ref(20) // 初始加载的缩略图数量

const fillDigit = (num: number, digit: number) => {
  return num.toString().padStart(digit, '0')
}

// 点击缩略图切换页面
const handleClickTemplateThumbnail = (event: MouseEvent, index: number) => {
  if (curTempIdx.value === index) return
  templateStore.switchTemplate(index)
}

// 拖拽结束处理
const handleDragEnd = (event: any) => {
  const { newIndex, oldIndex } = event
  if (newIndex === oldIndex) return

  // 更新当前索引
  if (curTempIdx.value === oldIndex) {
    templateStore.setTemplateIndex(newIndex)
  } else if (curTempIdx.value > oldIndex && curTempIdx.value <= newIndex) {
    templateStore.setTemplateIndex(curTempIdx.value - 1)
  } else if (curTempIdx.value < oldIndex && curTempIdx.value >= newIndex) {
    templateStore.setTemplateIndex(curTempIdx.value + 1)
  }
}

// 新增页面
const handleAddTemplate = async () => {
  // 创建一个新的空白模板
  const newTemplate: Template = {
    id: uuidv4(),
    width: 900,
    height: 2000,
    zoom: 1,
    objects: [
      {
        type: 'rect',
        id: 'workspace',
        left: 0,
        top: 0,
        width: 900,
        height: 2000,
        fill: 'transparent',
        selectable: false,
        hasControls: false,
        evented: false,
      } as any,
    ],
    backgroundColor: '#ffffff',
    workSpace: {
      width: 900,
      height: 2000,
      fill: '#ffffff',
      fillType: 0,
    },
  }

  await templateStore.addTemplate(newTemplate)
}

// 复制页面
const handleDuplicateTemplate = async () => {
  if (curTempIdx.value < 0) return
  await templateStore.duplicateTemplate()
}

// 删除页面
const handleDeleteTemplate = async () => {
  if (templateList.value.length <= 1) {
    ElMessageBox.alert('至少需要保留一个页面', '提示', {
      confirmButtonText: '确定',
    })
    return
  }

  ElMessageBox.confirm('确定删除当前页面吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await templateStore.deleteTemplate()
    })
    .catch(() => {
      // 取消删除
    })
}
</script>

<template>
  <div class="templates-container">
    <div class="templates-actions">
      <button class="action-btn" @click="handleAddTemplate" title="新增页面">
        <Plus :size="16" />
      </button>
      <button class="action-btn" @click="handleDuplicateTemplate" title="复制页面">
        <Copy :size="16" />
      </button>
      <button class="action-btn" @click="handleDeleteTemplate" title="删除页面">
        <Trash2 :size="16" />
      </button>
    </div>

    <Draggable
      v-model="templateList"
      :animation="300"
      :scroll="true"
      :scrollSensitivity="50"
      @end="handleDragEnd"
      item-key="id"
      class="templates-list"
    >
      <template #item="{ element, index }">
        <div
          :class="{
            'template-item': true,
            active: curTempIdx === index,
          }"
          @mousedown="($event: MouseEvent) => handleClickTemplateThumbnail($event, index)"
        >
          <div class="label">{{ fillDigit(index + 1, 2) }}</div>
          <TemplateThumb
            class="thumbnail"
            :template="element"
            :size="100"
            :visible="index < templatesLoadLimit"
            :active="curTempIdx === index"
            @click="($event: MouseEvent) => handleClickTemplateThumbnail($event, index)"
          />
        </div>
      </template>
    </Draggable>

    <div class="templates-info">{{ curTempIdx + 1 }} / {{ templateList.length }}</div>
  </div>
</template>

<style lang="scss" scoped>
.templates-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 200px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.templates-actions {
  display: flex;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }

  &:active {
    transform: scale(0.95);
  }
}

.templates-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.template-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &.active {
    .label {
      color: #409eff;
      font-weight: bold;
    }
  }
}

.label {
  font-size: 12px;
  color: #999;
  min-width: 24px;
  text-align: right;
  transition: all 0.2s;
}

.thumbnail {
  flex: 1;
}

.templates-info {
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  text-align: center;
  color: #666;
}
</style>
