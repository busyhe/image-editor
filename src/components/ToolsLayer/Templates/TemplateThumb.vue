<template>
  <div
    class="thumbnail-slide"
    :class="{ 'is-active': props.active }"
    :style="{
      width: props.size + 'px',
      height: height + 'px',
    }"
    @mousedown="(event: MouseEvent) => emit('click', event)"
  >
    <div v-if="visible">
      <canvas ref="thumbnailTemplate"></canvas>
    </div>
    <div class="placeholder" v-else>加载中...</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { fabric } from 'fabric'
import type { Template } from '@/types/template'
import { useTemplateStore } from '@/stores/modules/template'

const props = defineProps({
  template: {
    type: Object as () => Template,
    required: true,
  },
  size: {
    type: Number,
    default: 120,
  },
  visible: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const templateStore = useTemplateStore()
const viewportRatio = computed(() => props.template.height / props.template.width)
const height = computed(() => props.size * viewportRatio.value)
const thumbnailTemplate = ref<HTMLCanvasElement>()
let thumbCanvas: fabric.StaticCanvas | undefined

onMounted(() => {
  if (!thumbnailTemplate.value) return

  thumbCanvas = new fabric.StaticCanvas(thumbnailTemplate.value, {
    width: props.size,
    height: props.size * viewportRatio.value,
    backgroundColor: props.template.backgroundColor || '#fff',
  })

  // 将缩略图画布保存到 store
  templateStore.templateCanvas.set(props.template.id, thumbCanvas)

  setThumbnailElement()
})

onUnmounted(() => {
  // 清理画布
  if (thumbCanvas) {
    thumbCanvas.dispose()
  }
})

// 监听模板变化
watch(
  () => props.template,
  () => {
    if (!thumbCanvas) return
    setThumbnailElement()
  },
  { deep: true },
)

// 监听模板尺寸变化，立即更新画布尺寸
watch(
  () => [props.template.width, props.template.height],
  () => {
    if (!thumbCanvas) return
    // 当尺寸变化时，先更新画布尺寸，再重新渲染
    const newHeight = props.size * viewportRatio.value
    thumbCanvas.setDimensions({
      width: props.size,
      height: newHeight,
    })
    setThumbnailElement()
  },
)

const setThumbnailElement = async () => {
  if (!thumbCanvas) return

  try {
    await thumbCanvas.loadFromJSON(props.template, () => {
      // 确保 workspace 可见，其他辅助元素可以隐藏
      thumbCanvas!.getObjects().forEach((item: any) => {
        if (item.id === 'workspace') {
          item.visible = true
        }
      })

      const workspace = thumbCanvas!.getObjects().find((item: any) => item.id === 'workspace')
      const width = props.template.width / props.template.zoom
      const thumbZoom = props.size / width

      thumbCanvas!.setDimensions({
        width: props.size,
        height: props.size * viewportRatio.value,
      })
      thumbCanvas!.setZoom(thumbZoom)

      const thumbViewportTransform = thumbCanvas!.viewportTransform
      if (thumbViewportTransform && workspace) {
        const left = workspace.left || 0
        const top = workspace.top || 0
        thumbViewportTransform[4] = -left * thumbZoom
        thumbViewportTransform[5] = -top * thumbZoom
        thumbCanvas!.setViewportTransform(thumbViewportTransform)
      }

      thumbCanvas!.renderAll()
    })
  } catch (error) {
    console.error('设置缩略图失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.thumbnail-slide {
  background-color: #fff;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  border: 2px solid #0732470f;

  &:hover {
    border-color: rgba(64, 158, 255, 0.3);
  }

  &.is-active {
    border-color: rgba(64, 158, 255, 1);
  }
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #999;
}
</style>
