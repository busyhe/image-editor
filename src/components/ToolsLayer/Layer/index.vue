<script setup lang="ts">
import { ref, unref, onBeforeUnmount, watch } from 'vue'
import { uniqBy, debounce } from 'lodash-es'
import { LockKeyhole } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/modules/editor'
import useSelect from '@/hooks/select'

const editorStore = useEditorStore()
const { mixinState } = useSelect()
const list: any = ref([])

// 缩略图缓存，key 为 图层id + 修改时间戳
const thumbnailCache = new Map<string, string>()

// 获取对象的缓存键（基于对象的属性生成唯一标识）
const getCacheKey = (item: any) => {
  // 组合关键属性来生成缓存键
  const modified = item.modified || Date.now()
  return `${item.id}_${modified}_${item.width}_${item.height}_${item.scaleX}_${item.scaleY}`
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
const textType = (type: string, item: any) => {
  if (type.includes('text')) {
    return item.name || item.text
  }
  const typeText: Record<string, string> = {
    group: '组合',
    image: '图片',
    rect: '矩形',
    circle: '圆形',
    triangle: '三角形',
    polygon: '多边形',
    path: '路径',
  }
  return typeText[type] || '默认元素'
}
// 选中元素
const select = (id: string) => {
  const info = editorStore.canvas?.getObjects().find((item: any) => item.id === id) as fabric.Object
  editorStore.canvas?.discardActiveObject()
  editorStore.canvas?.setActiveObject(info)
  editorStore.canvas?.requestRenderAll()
}

// 生成单个图层的缩略图（带缓存）
const generateThumbnail = (item: any): string => {
  const cacheKey = getCacheKey(item)

  // 检查缓存
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!
  }

  // 生成新的缩略图
  let thumbnail = ''
  try {
    thumbnail = item.toDataURL({
      format: 'jpeg', // 使用 jpeg 格式，文件更小
      quality: 0.6, // 降低质量以提升性能
      multiplier: 0.2, // 进一步缩小到 20%
    })

    // 存入缓存，限制缓存大小
    if (thumbnailCache.size > 100) {
      // 删除最旧的缓存项
      const firstKey = thumbnailCache.keys().next().value
      if (firstKey) {
        thumbnailCache.delete(firstKey)
      }
    }
    thumbnailCache.set(cacheKey, thumbnail)
  } catch (e) {
    console.warn('生成缩略图失败:', e)
  }

  return thumbnail
}

const getList = () => {
  console.debug('[DEBUG__layer/index.vue-getList]')
  const objects =
    editorStore.canvas?.getObjects().filter((item: any) => {
      return !(item instanceof fabric.GuideLine || item.id === 'workspace')
    }) || []

  list.value = [...objects].reverse().map((item: any) => {
    const { type, id, name, text, selectable } = item

    // 使用缓存机制生成缩略图
    const thumbnail = generateThumbnail(item)

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
}

// 使用防抖优化，减少更新频率
const debouncedGetList = debounce(getList, 150)

const doLock = (item: any) => {
  select(item.id)
  item.isLock ? editorStore.editor.unLock() : editorStore.editor.lock()
  editorStore.canvas?.discardActiveObject()
}

// 监听 canvas 的初始化，确保 canvas 存在后再添加事件监听
watch(
  () => editorStore.canvas,
  (newCanvas, oldCanvas) => {
    // 移除旧 canvas 的事件监听
    if (oldCanvas) {
      oldCanvas.off('after:render', debouncedGetList)
    }
    // 添加新 canvas 的事件监听
    if (newCanvas) {
      console.debug('[DEBUG__layer/index.vue] Canvas initialized, adding after:render listener')
      // 使用防抖版本的 getList
      newCanvas.on('after:render', debouncedGetList)
      // 首次加载立即执行（不防抖）
      getList()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  // 组件卸载时移除事件监听和取消防抖
  if (editorStore.canvas) {
    editorStore.canvas.off('after:render', debouncedGetList)
  }
  // 取消待执行的防抖函数
  debouncedGetList.cancel()
  // 清理缓存
  thumbnailCache.clear()
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
  border: 1px solid #00cae0;
}
</style>
