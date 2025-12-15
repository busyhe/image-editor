```
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
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
  }>(),
  {
    fit: 'contain',
    backgroundColor: '#f3f4f6',
  },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const loading = ref(false)
let canvas: fabric.StaticCanvas | null = null

console.log('FabricView: setup', { fabric })

// Initialize canvas
const initCanvas = () => {
  console.log('FabricView: initCanvas', { canvasRef: canvasRef.value, fabricAvailable: !!fabric })
  if (!canvasRef.value || canvas) return

  if (!fabric) {
    console.error('FabricView: fabric not found')
    return
  }

  try {
    canvas = new fabric.StaticCanvas(canvasRef.value, {
      renderOnAddRemove: false,
      selection: false,
    })
    console.log('FabricView: canvas initialized', canvas)
  } catch (e) {
    console.error('FabricView: error initializing canvas', e)
  }
}

const loadData = async () => {
  console.log('FabricView: loadData started', { data: !!props.data, url: props.url })
  if (!canvas) initCanvas()
  if (!canvas) return

  loading.value = true
  try {
    let renderData = props.data

    // Fetch data if URL is provided and no data prop
    if (!renderData && props.url) {
      console.log('FabricView: fetching URL', props.url)
      const { data } = await axios.get(props.url)
      renderData = data
    }

    if (renderData) {
      console.log('FabricView: calling loadFromJSON')
      await new Promise<void>((resolve) => {
        canvas?.loadFromJSON(renderData, () => {
          console.log('FabricView: loadFromJSON callback fired')
          resolve()
        })
      })

      // Auto fit after loading
      console.log('FabricView: fitting to container')
      fitToContainer()
    }
  } catch (error) {
    console.error('Failed to load fabric data:', error)
  } finally {
    loading.value = false
    canvas.requestRenderAll()
    console.log('FabricView: loadData finished')
  }
}

const fitToContainer = () => {
  if (!canvas || !containerRef.value) return

  // Use props width/height or container dimensions
  const targetWidth = props.width || containerRef.value.clientWidth
  const targetHeight = props.height || containerRef.value.clientHeight

  // Get workspace object if exists (assumed usage pattern from template.json)
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
      // Fit entirely within container, preserving aspect ratio
      zoom = Math.min(scaleX, scaleY)
      break
    case 'cover':
      // Cover entire container, preserving aspect ratio (may crop)
      zoom = Math.max(scaleX, scaleY)
      break
    case 'fill':
      // Stretch to fill container (ignores aspect ratio)
      // For fill mode, we need to handle differently - scale canvas dimensions
      canvas.setZoom(1)
      canvas.setDimensions({ width: targetWidth, height: targetHeight })
      // Adjust each object's scale proportionally
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
      // Handle workspace separately
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
      // No scaling, use original size
      zoom = 1
      break
    default:
      zoom = Math.min(scaleX, scaleY)
  }

  canvas.setZoom(zoom)

  // Center the content
  const vpt = canvas.viewportTransform!
  vpt[4] = (targetWidth - contentWidth * zoom) / 2
  vpt[5] = (targetHeight - contentHeight * zoom) / 2

  // Set canvas dimensions
  canvas.setDimensions({
    width: targetWidth,
    height: targetHeight,
  })

  canvas.requestRenderAll()
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
})

onUnmounted(() => {
  if (canvas) {
    canvas.dispose()
    canvas = null
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="fabric-view-container"
    :style="{
      backgroundColor: props.backgroundColor,
      width: props.width ? `${props.width}px` : '100%',
      height: props.height ? `${props.height}px` : '100%',
    }"
  >
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <canvas ref="canvasRef"></canvas>
  </div>
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
</style>
