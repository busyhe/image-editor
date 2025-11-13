<script setup lang="ts">
import { ref, unref, onBeforeUnmount, watch, nextTick } from 'vue'
import { uniqBy, throttle } from 'lodash-es'
import { LockKeyhole } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/modules/editor'
import useSelect from '@/hooks/select'

const editorStore = useEditorStore()
const { mixinState } = useSelect()
const list: any = ref([])

// 缩略图缓存，key 为 图层id + 修改时间戳
const thumbnailCache = new Map<string, string>()
// 待生成缩略图的队列
const pendingThumbnails = new Set<string>()
// 缩略图生成任务是否正在执行
let isGenerating = false
// 上一次的图层快照，用于对比变化
const previousObjectsSnapshot = new Map<string, string>()

// 获取对象的缓存键（基于对象的属性生成唯一标识）
const getCacheKey = (item: any) => {
  // 组合关键属性来生成缓存键
  // 注意：不包含 left/top/position 等位置信息，因为移动不影响缩略图内容
  const modified = item.modified || 0
  const angle = item.angle || 0
  const width = Math.round(item.width || 0)
  const height = Math.round(item.height || 0)
  const scaleX = Math.round((item.scaleX || 1) * 1000) / 1000 // 保留3位小数
  const scaleY = Math.round((item.scaleY || 1) * 1000) / 1000

  // 针对不同类型添加特定属性
  let typeSpecific = ''
  if (item.type === 'textbox' || item.type === 'i-text') {
    typeSpecific = `_${item.text || ''}_${item.fontSize || ''}_${item.fontFamily || ''}`
  } else if (item.type === 'image') {
    typeSpecific = `_${item.src || ''}`
  }

  const fill = typeof item.fill === 'string' ? item.fill : JSON.stringify(item.fill || '')
  const stroke = item.stroke || ''
  const strokeWidth = item.strokeWidth || 0
  const opacity = Math.round((item.opacity || 1) * 100) / 100

  return `${item.id}_${modified}_${width}_${height}_${scaleX}_${scaleY}_${angle}_${fill}_${stroke}_${strokeWidth}_${opacity}${typeSpecific}`
}

// 检查图层是否真正发生变化
const hasObjectChanged = (item: any): boolean => {
  const currentKey = getCacheKey(item)
  const previousKey = previousObjectsSnapshot.get(item.id)

  // 如果没有历史记录，说明是新对象
  if (!previousKey) {
    return true
  }

  // 对比缓存键是否变化
  return currentKey !== previousKey
}

// 是否选中元素
const isSelect = (item: any) => {
  return item.id === mixinState.mSelectId || mixinState.mSelectIds.includes(item.id)
}

// 图层类型图标
const _iconType: Record<string, string> = {
  group: 'layer-group',
  textbox: 'layer-textbox',
  'i-text': 'layer-iText',
  image: 'layer-image',
  rect: 'layer-rect',
  circle: 'layer-circle',
  triangle: 'layer-triangle',
  polygon: 'layer-polygon',
}

const iconType = (type: string) => {
  return _iconType[type] || 'layer-default'
}

// 选中元素
const select = (id: string) => {
  const info = editorStore.canvas?.getObjects().find((item: any) => item.id === id) as fabric.Object
  editorStore.canvas?.discardActiveObject()
  editorStore.canvas?.setActiveObject(info)
  editorStore.canvas?.requestRenderAll()
}

// 同步生成单个图层的缩略图（仅用于缓存命中）
const generateThumbnailSync = (item: any): string => {
  const cacheKey = getCacheKey(item)

  // 只返回缓存中的缩略图
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!
  }

  return '' // 如果没有缓存，返回空字符串，后续异步生成
}

// 异步生成单个缩略图（用于后台处理）
const generateThumbnailAsync = (item: any, cacheKey: string): string => {
  try {
    const thumbnail = item.toDataURL({
      format: 'jpeg',
      quality: 0.5, // 进一步降低质量
      multiplier: 0.15, // 更小的尺寸
    })

    // 存入缓存，限制缓存大小
    if (thumbnailCache.size > 150) {
      const firstKey = thumbnailCache.keys().next().value
      if (firstKey) {
        thumbnailCache.delete(firstKey)
      }
    }
    thumbnailCache.set(cacheKey, thumbnail)

    return thumbnail
  } catch (e) {
    console.warn('生成缩略图失败:', e)
    return ''
  }
}

// 分批处理缩略图生成（使用 requestIdleCallback 或 requestAnimationFrame）
const processThumbnailQueue = () => {
  if (isGenerating || pendingThumbnails.size === 0) {
    return
  }

  isGenerating = true

  const process = () => {
    const startTime = Date.now()
    const maxTime = 16 // 每批处理最多 16ms，保证 60fps

    // 将 Set 转换为数组以便迭代
    const itemsToProcess = Array.from(pendingThumbnails)

    for (const itemId of itemsToProcess) {
      // 检查是否超时
      if (Date.now() - startTime > maxTime) {
        break
      }

      // 从待处理队列中移除
      pendingThumbnails.delete(itemId)

      // 找到对应的图层对象和列表项
      const canvasItem = editorStore.canvas?.getObjects().find((obj: any) => obj.id === itemId)
      if (!canvasItem) continue

      const cacheKey = getCacheKey(canvasItem)

      // 如果已经有缓存，跳过
      if (thumbnailCache.has(cacheKey)) continue

      // 生成缩略图
      const thumbnail = generateThumbnailAsync(canvasItem, cacheKey)

      // 更新列表中对应项的缩略图
      const listItem = list.value.find((item: any) => item.id === itemId)
      if (listItem && thumbnail) {
        listItem.thumbnail = thumbnail
      }
    }

    // 如果还有待处理的项，继续下一批
    if (pendingThumbnails.size > 0) {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(process, { timeout: 100 })
      } else {
        requestAnimationFrame(() => process())
      }
    } else {
      isGenerating = false
    }
  }

  // 启动处理
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(process, { timeout: 100 })
  } else {
    requestAnimationFrame(() => process())
  }
}

// 快速更新列表结构（不生成缩略图）
const getList = () => {
  console.debug('[DEBUG__layer/index.vue-getList]')
  const objects =
    editorStore.canvas?.getObjects().filter((item: any) => {
      return !(item instanceof fabric.GuideLine || item.id === 'workspace')
    }) || []

  // 获取当前所有对象的 ID 集合
  const currentObjectIds = new Set(objects.map((obj: any) => obj.id))

  // 清理已删除对象的快照和缓存
  for (const [id] of previousObjectsSnapshot) {
    if (!currentObjectIds.has(id)) {
      previousObjectsSnapshot.delete(id)
      // 删除所有相关的缓存
      for (const [cacheKey] of thumbnailCache) {
        if (cacheKey.startsWith(`${id}_`)) {
          thumbnailCache.delete(cacheKey)
        }
      }
    }
  }

  // 快速构建列表，智能判断是否需要重新生成缩略图
  list.value = [...objects].reverse().map((item: any) => {
    const { type, id, name, text, selectable } = item
    const cacheKey = getCacheKey(item)

    // 检查对象是否真正发生了变化
    const hasChanged = hasObjectChanged(item)

    let thumbnail = ''

    if (hasChanged) {
      // 对象发生了变化
      console.debug(`[Layer] 对象 ${id} 发生变化，需要重新生成缩略图`)

      // 先尝试从缓存获取
      thumbnail = generateThumbnailSync(item)

      // 如果没有缓存，添加到待生成队列
      if (!thumbnail) {
        pendingThumbnails.add(id)
      }

      // 更新快照
      previousObjectsSnapshot.set(id, cacheKey)
    } else {
      // 对象没有变化，直接使用缓存的缩略图
      thumbnail = generateThumbnailSync(item)

      // 如果缓存丢失（比如缓存满了被清理），重新生成
      if (!thumbnail) {
        console.debug(`[Layer] 对象 ${id} 缓存丢失，重新生成`)
        pendingThumbnails.add(id)
        previousObjectsSnapshot.set(id, cacheKey)
      }
    }

    return {
      type,
      id,
      name,
      text,
      isLock: !selectable,
      thumbnail,
    }
  })

  list.value = uniqBy(unref(list), 'id')

  // 只有在有待生成的缩略图时才启动异步处理
  if (pendingThumbnails.size > 0) {
    console.debug(`[Layer] 队列中有 ${pendingThumbnails.size} 个缩略图待生成`)
    nextTick(() => {
      processThumbnailQueue()
    })
  }
}

// 使用节流优化，减少更新频率（节流比防抖更合适，保证定期更新）
const throttledGetList = throttle(getList, 300, { leading: true, trailing: true })

// 监听 canvas 的初始化，确保 canvas 存在后再添加事件监听
watch(
  () => editorStore.canvas,
  (newCanvas, oldCanvas) => {
    // 移除旧 canvas 的事件监听
    if (oldCanvas) {
      oldCanvas.off('object:added', throttledGetList)
      oldCanvas.off('object:removed', throttledGetList)
      oldCanvas.off('object:modified', throttledGetList)
    }
    // 添加新 canvas 的事件监听
    if (newCanvas) {
      console.debug('[DEBUG__layer/index.vue] Canvas initialized, adding event listeners')
      // 只监听关键事件，而不是 after:render
      newCanvas.on('object:added', throttledGetList)
      newCanvas.on('object:removed', throttledGetList)
      newCanvas.on('object:modified', throttledGetList)
      // 首次加载立即执行
      getList()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  // 组件卸载时移除事件监听和取消节流
  if (editorStore.canvas) {
    editorStore.canvas.off('object:added', throttledGetList)
    editorStore.canvas.off('object:removed', throttledGetList)
    editorStore.canvas.off('object:modified', throttledGetList)
  }
  // 取消待执行的节流函数
  throttledGetList.cancel()
  // 清理所有缓存和状态
  thumbnailCache.clear()
  pendingThumbnails.clear()
  previousObjectsSnapshot.clear()
  isGenerating = false
})
</script>

<template>
  <div class="layer-container">
    <div class="layer-box">
      <div v-for="item in list" @click="select(item.id)" :key="item.id">
        <div class="thumbnail-wrapper mb-2" :class="isSelect(item) && 'active'">
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            class="layer-thumbnail"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="thumbnail-placeholder">
            <i :class="iconType(item.type)" />
          </div>
          <LockKeyhole v-show="item.isLock" :size="12" class="absolute right-1 bottom-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layer-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  // 启用硬件加速
  will-change: transform;
}

.thumbnail-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  overflow: hidden;
  // 使用 GPU 加速
  transform: translateZ(0);
  backface-visibility: hidden;
  background-image:
    linear-gradient(45deg, #ebeff1 25%, #0000 0, #0000 75%, #ebeff1 0, #ebeff1),
    linear-gradient(45deg, #ebeff1 25%, #dadfe1 0, #dadfe1 75%, #ebeff1 0, #ebeff1);
  background-position:
    0 0,
    8px 8px;
  background-size: 16px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.layer-thumbnail {
  max-width: 44px;
  max-height: 44px;
  object-fit: contain;
  display: block;
  // 优化图片渲染
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20px;
}

.layer-text {
  padding-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  // 禁用文本选择，提升性能
  user-select: none;
}

.locked {
  color: #f56c6c;
  cursor: pointer;
  transition: color 0.2s ease;
}

.active {
  border: 2px solid #00cae0;
}
</style>
