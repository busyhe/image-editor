<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { fabric } from 'fabric'
import FabricView from '@/components/FabricView/index.vue'
import templateData from './template.json'
import templateData2 from './template2.json'

// Array of templates for loop rendering
const templates = ref([
  { id: 1, data: templateData, name: 'Template 1' },
  { id: 2, data: templateData2, name: 'Template 2' },
])

// Preview state
const showPreview = ref(false)
const currentIndex = ref(0)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
const previewContainerRef = ref<HTMLElement | null>(null)
let previewCanvas: fabric.StaticCanvas | null = null
const fontList = ref([
  {
    fontFamily: '站酷快乐体',
    url: 'https://api.kuaitu.cc/uploads/_c638250a7d.woff2',
  },
  {
    fontFamily: '优设标题黑',
    url: 'https://api.kuaitu.cc/uploads/_39c33c33e3.woff2',
  },
])

const openPreview = (index: number) => {
  currentIndex.value = index
  showPreview.value = true
  nextTick(() => {
    initPreviewCanvas()
  })
}

const closePreview = () => {
  showPreview.value = false
  if (previewCanvas) {
    previewCanvas.dispose()
    previewCanvas = null
  }
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    nextTick(() => initPreviewCanvas())
  }
}

const nextImage = () => {
  if (currentIndex.value < templates.value.length - 1) {
    currentIndex.value++
    nextTick(() => initPreviewCanvas())
  }
}

const initPreviewCanvas = async () => {
  if (!previewCanvasRef.value || !previewContainerRef.value) return

  // Dispose old canvas
  if (previewCanvas) {
    previewCanvas.dispose()
    previewCanvas = null
  }

  try {
    previewCanvas = new fabric.StaticCanvas(previewCanvasRef.value, {
      renderOnAddRemove: false,
      selection: false,
    })

    const renderData = templates.value[currentIndex.value]?.data
    if (renderData) {
      await new Promise<void>((resolve) => {
        previewCanvas?.loadFromJSON(renderData, () => {
          resolve()
        })
      })
      fitPreviewToContainer()
    }
  } catch (e) {
    console.error('Preview: error initializing canvas', e)
  }
}

const fitPreviewToContainer = () => {
  if (!previewCanvas || !previewContainerRef.value) return

  const targetWidth = previewContainerRef.value.clientWidth
  const targetHeight = previewContainerRef.value.clientHeight

  const workspace = previewCanvas.getObjects().find((obj: any) => obj.id === 'workspace')

  let contentWidth = previewCanvas.getWidth()
  let contentHeight = previewCanvas.getHeight()

  if (workspace) {
    contentWidth = workspace.width! * workspace.scaleX!
    contentHeight = workspace.height! * workspace.scaleY!
  }

  if (!contentWidth || !contentHeight) return

  const scaleX = targetWidth / contentWidth
  const scaleY = targetHeight / contentHeight
  const zoom = Math.min(scaleX, scaleY) * 0.9

  previewCanvas.setZoom(zoom)

  const vpt = previewCanvas.viewportTransform!
  vpt[4] = (targetWidth - contentWidth * zoom) / 2
  vpt[5] = (targetHeight - contentHeight * zoom) / 2

  previewCanvas.setDimensions({
    width: targetWidth,
    height: targetHeight,
  })

  previewCanvas.requestRenderAll()
}

// Download original image
const downloadImage = async () => {
  const renderData = templates.value[currentIndex.value]?.data
  if (!renderData) return

  // Create a temporary canvas at original size
  const tempCanvas = document.createElement('canvas')
  const tempFabricCanvas = new fabric.StaticCanvas(tempCanvas, {
    renderOnAddRemove: false,
  })

  try {
    await new Promise<void>((resolve) => {
      tempFabricCanvas.loadFromJSON(renderData, () => {
        resolve()
      })
    })

    // Find workspace to get original dimensions
    const workspace = tempFabricCanvas.getObjects().find((obj: any) => obj.id === 'workspace')
    let exportWidth = tempFabricCanvas.getWidth()
    let exportHeight = tempFabricCanvas.getHeight()

    if (workspace) {
      exportWidth = workspace.width! * workspace.scaleX!
      exportHeight = workspace.height! * workspace.scaleY!
    }

    // Set canvas to original size
    tempFabricCanvas.setDimensions({ width: exportWidth, height: exportHeight })
    tempFabricCanvas.setZoom(1)

    // Center the viewport if workspace exists
    if (workspace) {
      const vpt = tempFabricCanvas.viewportTransform!
      vpt[4] = 0
      vpt[5] = 0
    }

    tempFabricCanvas.requestRenderAll()

    // Export to data URL
    const dataURL = tempFabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    })

    // Create download link
    const link = document.createElement('a')
    link.download = `${templates.value[currentIndex.value]?.name || 'image'}.png`
    link.href = dataURL
    link.click()
  } finally {
    tempFabricCanvas.dispose()
  }
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!showPreview.value) return
  if (e.key === 'Escape') closePreview()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (previewCanvas) {
    previewCanvas.dispose()
    previewCanvas = null
  }
})
</script>

<template>
  <div class="preview-page">
    <div class="preview-header">
      <h1>Fabric.js Preview Component Demo</h1>
    </div>
    <div class="preview-content">
      <div v-for="(template, index) in templates" :key="template.id" class="template-card">
        <div class="template-title">{{ template.name }}</div>
        <FabricView
          :data="template.data"
          :width="300"
          :height="400"
          fit="contain"
          backgroundColor="#ffffff"
          preview
          :fontList="fontList"
          @preview-click="openPreview(index)"
        />
      </div>
    </div>

    <!-- Unified Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreview" class="preview-mask" @click="closePreview">
        <!-- Prev Button -->
        <button v-show="currentIndex > 0" class="preview-nav preview-prev" @click.stop="prevImage">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <!-- Canvas Container -->
        <div ref="previewContainerRef" class="preview-container" @click.stop>
          <canvas ref="previewCanvasRef"></canvas>
        </div>

        <!-- Next Button -->
        <button
          v-show="currentIndex < templates.length - 1"
          class="preview-nav preview-next"
          @click.stop="nextImage"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>

        <!-- Top Right Actions -->
        <div class="preview-actions">
          <!-- Download Button -->
          <button class="preview-action-btn" @click.stop="downloadImage" title="下载原图">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </button>
          <!-- Close Button -->
          <button class="preview-action-btn" @click="closePreview" title="关闭">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>

        <!-- Counter -->
        <div class="preview-counter">{{ currentIndex + 1 }} / {{ templates.length }}</div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.preview-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.preview-content {
  flex: 1;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.template-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.template-title {
  padding: 12px 16px;
  background: #fff;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

/* Preview Modal Styles */
.preview-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-container {
  width: 80vw;
  height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;
}

.preview-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-prev {
  left: 20px;
}

.preview-next {
  right: 20px;
}

.preview-actions {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.preview-action-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;
}

.preview-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-counter {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
}
</style>
