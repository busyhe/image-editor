```
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { fabric } from 'fabric'
import axios from 'axios'
import { useResizeObserver } from '@vueuse/core'

type FitMode = 'contain' | 'cover' | 'fill' | 'none'

const props = withDefaults(
  defineProps<{
    data?: any
    url?: string
    width?: number
    height?: number
    fit?: FitMode
    backgroundColor?: string
    preview?: boolean
  }>(),
  {
    fit: 'contain',
    backgroundColor: '#f3f4f6',
    preview: false,
  },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
const previewContainerRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const showPreview = ref(false)
let canvas: fabric.StaticCanvas | null = null
let previewCanvas: fabric.StaticCanvas | null = null

// Initialize canvas
const initCanvas = () => {
  if (!canvasRef.value || canvas) return
  if (!fabric) return

  try {
    canvas = new fabric.StaticCanvas(canvasRef.value, {
      renderOnAddRemove: false,
      selection: false,
    })
  } catch (e) {
    console.error('FabricView: error initializing canvas', e)
  }
}

const loadData = async () => {
  if (!canvas) initCanvas()
  if (!canvas) return

  loading.value = true
  try {
    let renderData = props.data

    // Fetch data if URL is provided and no data prop
    if (!renderData && props.url) {
      const { data } = await axios.get(props.url)
      renderData = data
    }

    if (renderData) {
      await new Promise<void>((resolve) => {
        canvas?.loadFromJSON(renderData, () => {
          resolve()
        })
      })
      fitToContainer()
    }
  } catch (error) {
    console.error('Failed to load fabric data:', error)
  } finally {
    loading.value = false
    canvas.requestRenderAll()
  }
}

const fitToContainer = () => {
  if (!canvas || !containerRef.value) return

  // Use props width/height or container dimensions
  const targetWidth = props.width || containerRef.value.clientWidth
  const targetHeight = props.height || containerRef.value.clientHeight

  // Get workspace object if exists
  const workspace = canvas.getObjects().find((obj: any) => obj.id === 'workspace')

  let contentWidth = canvas.getWidth()
  let contentHeight = canvas.getHeight()

  // If workspace object exists, use its dimensions as the content reference
  if (workspace) {
    contentWidth = workspace.width! * workspace.scaleX!
    contentHeight = workspace.height! * workspace.scaleY!
  }

  if (!contentWidth || !contentHeight) return

  let zoom = 1
  const scaleX = targetWidth / contentWidth
  const scaleY = targetHeight / contentHeight

  // Calculate zoom based on fit mode
  switch (props.fit) {
    case 'contain':
      zoom = Math.min(scaleX, scaleY)
      break
    case 'cover':
      zoom = Math.max(scaleX, scaleY)
      break
    case 'fill':
      canvas.setZoom(1)
      canvas.setDimensions({ width: targetWidth, height: targetHeight })
      const objects = canvas.getObjects()
      objects.forEach((obj: any) => {
        if (obj.id !== 'workspace') {
          obj.set({
            left: (obj.left / contentWidth) * targetWidth,
            top: (obj.top / contentHeight) * targetHeight,
            scaleX: (obj.scaleX || 1) * scaleX,
            scaleY: (obj.scaleY || 1) * scaleY,
          })
          obj.setCoords()
        }
      })
      if (workspace) {
        workspace.set({
          left: 0,
          top: 0,
          width: targetWidth,
          height: targetHeight,
          scaleX: 1,
          scaleY: 1,
        })
        workspace.setCoords()
      }
      canvas.requestRenderAll()
      return
    case 'none':
      zoom = 1
      break
    default:
      zoom = Math.min(scaleX, scaleY)
  }

  canvas.setZoom(zoom)

  const vpt = canvas.viewportTransform!
  vpt[4] = (targetWidth - contentWidth * zoom) / 2
  vpt[5] = (targetHeight - contentHeight * zoom) / 2

  canvas.setDimensions({
    width: targetWidth,
    height: targetHeight,
  })

  canvas.requestRenderAll()
}

// Preview functionality
const openPreview = () => {
  if (!props.preview) return
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

const initPreviewCanvas = async () => {
  if (!previewCanvasRef.value || !previewContainerRef.value) return

  try {
    previewCanvas = new fabric.StaticCanvas(previewCanvasRef.value, {
      renderOnAddRemove: false,
      selection: false,
    })

    let renderData = props.data
    if (!renderData && props.url) {
      const { data } = await axios.get(props.url)
      renderData = data
    }

    if (renderData) {
      await new Promise<void>((resolve) => {
        previewCanvas?.loadFromJSON(renderData, () => {
          resolve()
        })
      })
      fitPreviewToContainer()
    }
  } catch (e) {
    console.error('FabricView: error initializing preview canvas', e)
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

// Handle ESC key to close preview
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showPreview.value) {
    closePreview()
  }
}

// Watch for changes
watch(() => props.data, loadData, { deep: true })
watch(() => props.url, loadData)

// Resize handling
useResizeObserver(containerRef, () => {
  fitToContainer()
})

onMounted(() => {
  initCanvas()
  loadData()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (canvas) {
    canvas.dispose()
    canvas = null
  }
  if (previewCanvas) {
    previewCanvas.dispose()
    previewCanvas = null
  }
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    ref="containerRef"
    class="fabric-view-container"
    :class="{ 'is-clickable': props.preview }"
    :style="{
      backgroundColor: props.backgroundColor,
      width: props.width ? `${props.width}px` : '100%',
      height: props.height ? `${props.height}px` : '100%',
    }"
    @click="openPreview"
  >
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <canvas ref="canvasRef"></canvas>
  </div>

  <!-- Preview Modal -->
  <Teleport to="body">
    <div v-if="showPreview" class="preview-mask" @click="closePreview">
      <div ref="previewContainerRef" class="preview-container" @click.stop>
        <canvas ref="previewCanvasRef"></canvas>
      </div>
      <button class="preview-close" @click="closePreview">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.fabric-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.fabric-view-container.is-clickable {
  cursor: pointer;
}

.fabric-view-container.is-clickable:hover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(243, 244, 246, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

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
  width: 90vw;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-close {
  position: fixed;
  top: 20px;
  right: 20px;
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

.preview-close:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
