<script setup lang="ts">
import { ref, inject } from 'vue'
import { Upload, Image as ImageIcon } from 'lucide-vue-next'
import { v4 as uuidv4 } from 'uuid'
import { fabric } from 'fabric'

const activeIndex = ref('material')
const canvasEditor = inject('canvasEditor') as any

interface UploadFile {
  id: string
  url: string
  name: string
  progress?: number
  status: 'uploading' | 'done' | 'error'
}

const fileList = ref<UploadFile[]>([])
const loading = ref(false)
const noMore = ref(false)

const handleSelect = (key: string) => {
  activeIndex.value = key
}

// 模拟上传请求
const customUpload = (options: any) => {
  const { file, onProgress, onSuccess } = options

  // 创建预览 URL
  const url = URL.createObjectURL(file)
  const id = uuidv4()

  // 添加到列表首位
  const newFile: UploadFile = {
    id,
    url,
    name: file.name,
    progress: 0,
    status: 'uploading',
  }

  fileList.value.unshift(newFile)

  // 模拟进度
  let progress = 0
  const timer = setInterval(() => {
    progress += 10
    if (progress <= 100) {
      newFile.progress = progress
      onProgress({ percent: progress })
    } else {
      clearInterval(timer)
      newFile.status = 'done'
      newFile.progress = undefined
      onSuccess(newFile)
    }
  }, 200)
}

// 加载更多
const loadMore = () => {
  if (loading.value || noMore.value) return
  loading.value = true

  // 模拟加载更多数据
  setTimeout(() => {
    loading.value = false
    // 这里可以添加更多模拟数据，或者设置 noMore = true
    if (fileList.value.length > 50) {
      noMore.value = true
    }
  }, 1000)
}

// 添加图片到画布
const addImageToCanvas = (item: UploadFile) => {
  if (item.status !== 'done') return

  fabric.Image.fromURL(
    item.url,
    (img) => {
      img.set({
        left: 100,
        top: 100,
      })
      // 调整图片大小以适应画布
      if (img.width && img.width > 500) {
        img.scaleToWidth(500)
      }
      canvasEditor.canvas.add(img)
      canvasEditor.canvas.setActiveObject(img)
      canvasEditor.canvas.renderAll()
    },
    { crossOrigin: 'anonymous' },
  )
}
</script>

<template>
  <div class="material-panel h-full flex flex-col">
    <el-menu
      :default-active="activeIndex"
      mode="horizontal"
      @select="handleSelect"
      class="flex-none"
    >
      <el-menu-item index="material">素材库</el-menu-item>
      <el-menu-item index="upload">上传</el-menu-item>
    </el-menu>

    <div class="flex-1 overflow-hidden" v-if="activeIndex === 'upload'">
      <div class="p-4 h-full flex flex-col">
        <!-- 上传按钮区域 -->
        <el-upload
          class="upload-area w-full mb-4"
          drag
          action="#"
          :http-request="customUpload"
          :show-file-list="false"
          accept="image/*"
          multiple
        >
          <div class="flex flex-col items-center justify-center py-4">
            <Upload class="w-8 h-8 text-gray-400 mb-2" />
            <div class="text-sm text-gray-500">点击或拖拽上传图片</div>
          </div>
        </el-upload>

        <!-- 图片列表 -->
        <div
          class="image-list flex-1 overflow-y-auto"
          v-infinite-scroll="loadMore"
          :infinite-scroll-disabled="loading || noMore"
        >
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="item in fileList"
              :key="item.id"
              class="image-item relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
              @click="addImageToCanvas(item)"
            >
              <!-- 上传中状态 -->
              <div
                v-if="item.status === 'uploading'"
                class="aspect-square flex flex-col items-center justify-center p-2"
              >
                <div class="text-xs text-gray-500 mb-2 truncate w-full text-center">
                  {{ item.name }}
                </div>
                <el-progress
                  type="circle"
                  :percentage="item.progress"
                  :width="60"
                  :stroke-width="4"
                />
                <div class="text-xs text-blue-500 mt-2">正在上传...</div>
              </div>

              <!-- 完成状态 -->
              <div v-else class="aspect-square relative">
                <el-image
                  :src="item.url"
                  fit="cover"
                  class="w-full h-full transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                >
                  <template #error>
                    <div
                      class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"
                    >
                      <ImageIcon class="w-6 h-6" />
                    </div>
                  </template>
                </el-image>

                <!-- 悬停遮罩 -->
                <div
                  class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center"
                >
                  <div
                    class="opacity-0 group-hover:opacity-100 bg-white/90 px-2 py-1 rounded text-xs font-medium shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  >
                    点击添加
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="text-center py-4 text-gray-400 text-xs">加载中...</div>
          <div v-if="noMore && fileList.length > 0" class="text-center py-4 text-gray-400 text-xs">
            没有更多了
          </div>

          <!-- 空状态 -->
          <div
            v-if="fileList.length === 0"
            class="flex flex-col items-center justify-center py-12 text-gray-400"
          >
            <ImageIcon class="w-12 h-12 mb-2 opacity-50" />
            <div class="text-xs">暂无上传图片</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 p-4 flex items-center justify-center text-gray-400">
      素材库功能开发中...
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-menu--horizontal) {
  height: 40px;
  border-bottom: 1px solid #e5e7eb;

  .el-menu-item {
    height: 40px;
    line-height: 40px;
    border-bottom: 2px solid transparent;
    color: #666;

    &.is-active {
      border-bottom-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &:hover {
      color: var(--el-color-primary);
      background-color: transparent;
    }
  }
}

:deep(.el-upload) {
  width: 100%;

  .el-upload-dragger {
    width: 100%;
    height: auto;
    padding: 0;
    border-color: #e5e7eb;
    background-color: #f9fafb;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: #fff;
    }
  }
}

.image-list {
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 2px;

    &:hover {
      background: #d1d5db;
    }
  }
}
</style>
