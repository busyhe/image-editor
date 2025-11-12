<script setup lang="ts">
import { ref, unref, onMounted, onBeforeUnmount } from 'vue'
import { uniqBy } from 'lodash-es'
import { LockKeyhole } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/modules/editor'
import useSelect from '@/hooks/select'

const editorStore = useEditorStore()
const { isOne, mixinState } = useSelect()
const list: any = ref([])

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

const getList = () => {
  console.log('1111111111')
  // 不改原数组 反转
  list.value = [
    ...(editorStore.canvas?.getObjects().filter((item: any) => {
      return !(item instanceof fabric.GuideLine || item.id === 'workspace')
    }) || []),
  ]
    .reverse()
    .map((item: any) => {
      const { type, id, name, text, selectable } = item
      return {
        type,
        id,
        name,
        text,
        isLock: !selectable,
      }
    })
  list.value = uniqBy(unref(list), 'id')
}

const doLock = (item: any) => {
  select(item.id)
  item.isLock ? editorStore.editor.unLock() : editorStore.editor.lock()
  editorStore.canvas?.discardActiveObject()
}

onMounted(() => {
  getList()
  editorStore.canvas?.on('after:render', getList)
})

// onBeforeUnmount(() => {
//   editorStore.canvas?.off('after:render', getList)
// })
</script>

<template>
  <div class="layer-container">
    <div class="layer-box">
      <div
        v-for="item in list"
        @click="select(item.id)"
        :key="item.id"
        :class="isSelect(item) && 'active'"
      >
        <el-row class="ellipsis">
          <el-col :span="22">
            <el-tooltip :content="item.name || item.text || item.type" placement="left">
              <div>
                {{ textType(item.type, item) }}
              </div>
            </el-tooltip>
          </el-col>
          <el-col :span="2">
            <LockKeyhole />
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
