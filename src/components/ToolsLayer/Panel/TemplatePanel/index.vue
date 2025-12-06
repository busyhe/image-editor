<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEditorStore } from '@/stores/modules/editor'
import templateData from './template.json'

const editorStore = useEditorStore()
const templates = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  // Load templates from JSON file
  templates.value = templateData
})

// Apply selected template to canvas
const applyTemplate = async (template: any) => {
  if (!editorStore.canvas || !template) return

  loading.value = true
  try {
    // Get the first object from template (the group containing all elements)
    const templateObj = template.objects?.[0]
    if (!templateObj) {
      console.warn('Template has no objects')
      return
    }

    // Clear canvas and load template
    const canvas = editorStore.canvas

    // Set canvas size based on template dimensions
    const width = templateObj.width || 430
    const height = templateObj.height || 932

    // Set workspace size
    editorStore.editor?.setSize(width, height)

    // Load template objects to canvas
    const objects = templateObj.objects || []
    for (const obj of objects) {
      await new Promise<void>((resolve) => {
        // Use fabric.util.enlivenObjects to create fabric objects from JSON
        fabric.util.enlivenObjects(
          [obj],
          (enlivenedObjects: fabric.Object[]) => {
            enlivenedObjects.forEach((fabricObj) => {
              canvas.add(fabricObj)
            })
            resolve()
          },
          'fabric',
        )
      })
    }

    canvas.renderAll()

    // Close panel after applying template
    editorStore.setShowPanel(false)
  } catch (error) {
    console.error('Failed to apply template:', error)
  } finally {
    loading.value = false
  }
}

// Get template name from first object
const getTemplateName = (template: any) => {
  return template.objects?.[0]?.name || 'Unnamed Template'
}

// Get template dimensions
const getTemplateDimensions = (template: any) => {
  const obj = template.objects?.[0]
  if (!obj) return ''
  return `${obj.width || 0} x ${obj.height || 0}`
}

import { fabric } from 'fabric'
</script>

<template>
  <div class="template-panel" v-loading="loading">
    <div class="template-grid">
      <div
        v-for="(template, index) in templates"
        :key="index"
        class="template-item"
        @click="applyTemplate(template)"
      >
        <div class="template-preview">
          <div class="template-placeholder">
            <span class="template-icon">📄</span>
          </div>
        </div>
        <div class="template-info">
          <div class="template-name">{{ getTemplateName(template) }}</div>
          <div class="template-size">{{ getTemplateDimensions(template) }}</div>
        </div>
      </div>
    </div>
    <div v-if="templates.length === 0" class="empty-state">暂无模板</div>
  </div>
</template>

<style lang="scss" scoped>
.template-panel {
  width: 100%;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-item {
  cursor: pointer;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    transform: translateY(-2px);
  }
}

.template-preview {
  width: 100%;
  height: 120px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-icon {
  font-size: 32px;
}

.template-info {
  padding: 8px;
  background: #fff;
}

.template-name {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-size {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}
</style>
