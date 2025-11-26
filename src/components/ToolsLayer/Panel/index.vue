<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/modules/editor'
import { storeToRefs } from 'pinia'
import { panels } from '@/enums/editor'
import TextPanel from './TextPanel/index.vue'
import ShapePanel from './ShapePanel/index.vue'
import MaterialPanel from './MaterialPanel/index.vue'
import eventBus from '@/utils/eventBus'
import { ref } from 'vue'
import { ElMessage, type UploadProps } from 'element-plus'

const editorStore = useEditorStore()
const { showPanel, panelType } = storeToRefs(editorStore)

const panelTitle = computed(() => {
  switch (panelType.value) {
    case panels.text:
      return '文本'
    case panels.shape:
      return '形状'
    case panels.material:
      return '素材'
    default:
      return ''
  }
})
const closePanel = () => {
  editorStore.setShowPanel(false)
}

const uploadLoading = ref(false)

const customUpload = () => {
  // const { file } = options
  uploadLoading.value = true

  // Simulate upload delay
  setTimeout(() => {
    uploadLoading.value = false
    // Switch to material panel
    editorStore.setPanelType(panels.material)
    // Emit refresh event
    eventBus.emit('refreshMaterialList')
  }, 1500)
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(rawFile.type)
  const isLt5M = rawFile.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('上传文件只能是 JPG/PNG/JPEG 格式!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('上传文件大小不能超过 5MB!')
    return false
  }
  return true
}
</script>

<template>
  <div v-show="showPanel">
    <div
      class="bg-white rounded-md flex flex-col h-[calc(100vh-140px)] relative w-[280px] shadow-[0_.1px_8px_0_#1f426614]"
    >
      <div
        class="panel-header flex items-center justify-between border-b border-[#DCDFE6] h-[48px] pl-4 pr-2 relative w-full z-1"
      >
        <span>{{ panelTitle }}</span>
        <div>
          <el-upload
            action="#"
            class="inline-block mr-2"
            :http-request="customUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
            accept=".jpg,.jpeg,.png"
            :disabled="uploadLoading"
          >
            <el-button size="small" :loading="uploadLoading">点击上传</el-button>
          </el-upload>
          <el-button text :icon="X" @click="closePanel" />
        </div>
      </div>
      <div class="panel-content flex-1 overflow-y-auto p-4">
        <TextPanel v-if="panelType === panels.text" />
        <ShapePanel v-if="panelType === panels.shape" />
        <MaterialPanel v-if="panelType === panels.material" />
      </div>
    </div>
  </div>
</template>
