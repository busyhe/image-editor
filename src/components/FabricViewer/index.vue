```
<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { fabric } from 'fabric'
import axios from 'axios'

export interface FabricViewerItem {
  data?: any
  url?: string
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    items: FabricViewerItem[]
    initialIndex?: number
  }>(),
  {
    initialIndex: 0,
  },
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'change', index: number): void
}>()

const currentIndex = ref(props.initialIndex)
const containerRef = ref<HTMLElement | null>(null)
const loading = ref(false)

// Canvas instances cache (key: index, value: canvas instance)
const canvasCache = new Map<number, fabric.StaticCanvas>()
// Loading state per item
const loadedItems = ref<Set<number>>(new Set())

// Compute total items
const totalItems = computed(() => props.items.length)

// Watch for visible changes
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      currentIndex.value = props.initialIndex
      nextTick(() => {
        loadCanvas(currentIndex.value)
        // Preload adjacent items
        preloadAdjacent()
      })
    }
  },
)

// Watch for initialIndex changes
watch(
  () => props.initialIndex,
  (index) => {
    if (props.visible) {
      currentIndex.value = index
      nextTick(() => {
        loadCanvas(index)
        preloadAdjacent()
      })
    }
  },
)

// Clear cache when items change
watch(
  () => props.items,
  () => {
    disposeAllCanvases()
    loadedItems.value.clear()
  },
  { deep: true },
)

const close = () => {
  emit('update:visible', false)
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('change', currentIndex.value)
    nextTick(() => {
      loadCanvas(currentIndex.value)
      preloadAdjacent()
    })
  }
}

const next = () => {
  if (currentIndex.value < props.items.length - 1) {
    currentIndex.value++
    emit('change', currentIndex.value)
    nextTick(() => {
      loadCanvas(currentIndex.value)
      preloadAdjacent()
    })
  }
}

// Preload adjacent items for smooth navigation
const preloadAdjacent = () => {
  const prevIndex = currentIndex.value - 1
  const nextIndex = currentIndex.value + 1
  if (prevIndex >= 0 && !loadedItems.value.has(prevIndex)) {
    loadCanvas(prevIndex, true)
  }
  if (nextIndex < props.items.length && !loadedItems.value.has(nextIndex)) {
    loadCanvas(nextIndex, true)
  }
}

const disposeAllCanvases = () => {
  canvasCache.forEach((canvas) => {
    canvas.dispose()
  })
  canvasCache.clear()
}

const getCanvasElement = (index: number): HTMLCanvasElement | null => {
  return containerRef.value?.querySelector(`canvas[data-index="${index}"]`) || null
}

const loadCanvas = async (index: number, isPreload = false) => {
  const item = props.items[index]
  if (!item) return

  // Already loaded
  if (loadedItems.value.has(index)) {
    fitCanvas(index)
    return
  }

  const canvasEl = getCanvasElement(index)
  if (!canvasEl) return

  if (!isPreload) {
    loading.value = true
  }

  try {
    // Get or create canvas instance
    let canvas = canvasCache.get(index)
    if (!canvas) {
      canvas = new fabric.StaticCanvas(canvasEl, {
        renderOnAddRemove: false,
        selection: false,
      })
      canvasCache.set(index, canvas)
    }

    // Load data
    let renderData = item.data
    if (!renderData && item.url) {
      const { data } = await axios.get(item.url)
      renderData = data
    }

    if (renderData) {
      await new Promise<void>((resolve) => {
        canvas!.loadFromJSON(renderData, () => {
          resolve()
        })
      })
      loadedItems.value.add(index)
      fitCanvas(index)
    }
  } catch (e) {
    console.error('FabricViewer: error loading canvas', e)
  } finally {
    if (!isPreload) {
      loading.value = false
    }
  }
}

const fitCanvas = (index: number) => {
  const canvas = canvasCache.get(index)
  if (!canvas || !containerRef.value) return

  const targetWidth = containerRef.value.clientWidth
  const targetHeight = containerRef.value.clientHeight

  const workspace = canvas.getObjects().find((obj: any) => obj.id === 'workspace')

  let contentWidth = canvas.getWidth()
  let contentHeight = canvas.getHeight()

  if (workspace) {
    contentWidth = workspace.width! * workspace.scaleX!
    contentHeight = workspace.height! * workspace.scaleY!
  }

  if (!contentWidth || !contentHeight) return

  const scaleX = targetWidth / contentWidth
  const scaleY = targetHeight / contentHeight
  const zoom = Math.min(scaleX, scaleY) * 0.9

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

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  disposeAllCanvases()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="viewer-mask" @click="close">
      <!-- Prev Button -->
      <button v-show="currentIndex > 0" class="viewer-nav viewer-prev" @click.stop="prev">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <!-- Canvas Container -->
      <div ref="containerRef" class="viewer-container" @click.stop>
        <div v-if="loading" class="viewer-loading">
          <div class="viewer-spinner"></div>
        </div>
        <!-- Multiple canvas elements, only show current one -->
        <canvas
          v-for="(_, index) in items"
          :key="index"
          :data-index="index"
          :class="{
            'canvas-visible': index === currentIndex,
            'canvas-hidden': index !== currentIndex,
          }"
        ></canvas>
      </div>

      <!-- Next Button -->
      <button
        v-show="currentIndex < totalItems - 1"
        class="viewer-nav viewer-next"
        @click.stop="next"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>

      <!-- Close Button -->
      <button class="viewer-close" @click="close">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>

      <!-- Counter -->
      <div v-if="totalItems > 1" class="viewer-counter">
        {{ currentIndex + 1 }} / {{ totalItems }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.viewer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.viewer-container {
  width: 80vw;
  height: 85vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.canvas-visible {
  display: block;
}

.canvas-hidden {
  display: none;
}

.viewer-nav {
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

.viewer-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.viewer-prev {
  left: 20px;
}

.viewer-next {
  right: 20px;
}

.viewer-close {
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

.viewer-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.viewer-counter {
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

.viewer-loading {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.viewer-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: viewer-spin 0.8s linear infinite;
}

@keyframes viewer-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
