<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { SquareSquare } from 'lucide-vue-next'
import useSelect from '@/hooks/select'
import {
  AlignCenterVertical,
  AlignCenterHorizontal,
  Square,
  ArrowDown,
  ArrowUp,
  ArrowDownToLine,
  ArrowUpToLine,
} from 'lucide-vue-next'
import { useEditorStore } from '@/stores/modules/editor'
// 可修改的元素
const baseType = [
  'text',
  'i-text',
  'textbox',
  'rect',
  'circle',
  'triangle',
  'polygon',
  'image',
  'group',
  'line',
  'arrow',
  'thinTailArrow',
]
const editorStore = useEditorStore()
const { isMatchType, isOne } = useSelect(baseType)

// 属性值
const baseAttr = reactive<Record<string, any>>({
  opacity: 0,
  angle: 0,
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  rx: 0,
  ry: 0,
})

// 属性获取
const getObjectAttr = (e?: any) => {
  const activeObject = editorStore.canvas?.getActiveObject()
  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return
  console.debug('[DEBUG__AttributePosition/index.vue-activeObject]', activeObject)

  if (activeObject && isMatchType) {
    baseAttr.opacity = (activeObject.get('opacity') ?? 0) * 100
    baseAttr.left = activeObject.get('left')
    baseAttr.top = activeObject.get('top')
    baseAttr.width = activeObject.get('width')
    baseAttr.height = activeObject.get('height')
    baseAttr.angle = activeObject.get('angle') || 0
  }
}

// 通用属性改变
const changeCommon = (key: any, value: any) => {
  const activeObject = editorStore.canvas?.getActiveObjects()[0]
  if (activeObject) {
    // 透明度特殊转换
    if (key === 'opacity') {
      activeObject && activeObject.set(key, value / 100)
      editorStore.canvas?.renderAll()
      return
    }
    // 旋转角度适配
    if (key === 'angle') {
      activeObject.rotate(value)
      editorStore.canvas?.renderAll()
      return
    }
    activeObject && activeObject.set(key, value)
    editorStore.canvas?.renderAll()
  }
}

const handleUp = () => {
  editorStore.editor.up()
}
const handleDown = () => {
  editorStore.editor.down()
}
const handleToFront = () => {
  editorStore.editor.toFront()
}
const handleToBack = () => {
  editorStore.editor.toBack()
}
const handleCenterVertical = () => {
  editorStore.editor.position('centerH')
}
const handleCenterSquare = () => {
  editorStore.editor.position('center')
}
const handleCenterHorizontal = () => {
  editorStore.editor.position('centerV')
}

onMounted(() => {
  console.debug('[DEBUG__AttributePosition/index.vue-onMounted]')
  nextTick(() => {
    // 获取字体数据
    getObjectAttr()
    editorStore.editor?.on('selectOne', getObjectAttr)
    editorStore.canvas?.on('object:modified', getObjectAttr)
  })
})

onBeforeUnmount(() => {
  editorStore.editor?.off('selectOne', getObjectAttr)
  editorStore.canvas?.off('object:modified', getObjectAttr)
})
</script>

<template>
  <div>
    <el-popover placement="bottom" :width="400" trigger="hover">
      <template #reference>
        <el-button>
          <SquareSquare :size="16" />
        </el-button>
      </template>

      <main class="p-2!">
        <h2 class="text-14px font-bold">排列</h2>
        <el-divider class="my-4!" />

        <el-button-group class="w-full flex">
          <el-tooltip content="上一个">
            <el-button class="flex-1" @click="handleUp">
              <ArrowUp :size="16" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="下一个">
            <el-button class="flex-1" @click="handleDown">
              <ArrowDown :size="16" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="置顶">
            <el-button class="flex-1" @click="handleToFront">
              <ArrowUpToLine :size="16" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="置底">
            <el-button class="flex-1" @click="handleToBack">
              <ArrowDownToLine :size="16" />
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider class="my-4!" />

        <el-button-group class="w-full flex">
          <el-tooltip content="垂直居中">
            <el-button class="flex-1" @click="handleCenterVertical">
              <AlignCenterVertical :size="16" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="垂直水平居中">
            <el-button class="flex-1" @click="handleCenterSquare">
              <Square :size="16" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="水平居中">
            <el-button class="flex-1" @click="handleCenterHorizontal">
              <AlignCenterHorizontal :size="16" />
            </el-button>
          </el-tooltip>
        </el-button-group>
        <el-divider class="my-4!" />

        <p class="text-14px text-[#15293c80] mb-2">大小</p>
        <el-space>
          <el-input-number
            v-model="baseAttr.width"
            controls-position="right"
            :precision="2"
            :step="1"
            @change="(value: any) => changeCommon('width', value)"
          >
            <template #prefix>
              <span>宽度</span>
            </template>
          </el-input-number>
          <el-input-number
            v-model="baseAttr.height"
            controls-position="right"
            :precision="2"
            :step="1"
            @change="(value: any) => changeCommon('height', value)"
          >
            <template #prefix>
              <span>高度</span>
            </template>
          </el-input-number>
        </el-space>
        <p class="text-14px text-[#15293c80] my-2">位置</p>
        <el-space>
          <el-input-number
            v-model="baseAttr.left"
            controls-position="right"
            :precision="2"
            :step="1"
            @change="(value: any) => changeCommon('left', value)"
          >
            <template #prefix>
              <span>X轴</span>
            </template>
          </el-input-number>
          <el-input-number
            v-model="baseAttr.top"
            controls-position="right"
            :precision="2"
            :step="1"
            @change="(value: any) => changeCommon('top', value)"
          >
            <template #prefix>
              <span>Y轴</span>
            </template>
          </el-input-number>
        </el-space>

        <p class="text-14px text-[#15293c80] mt-2">旋转</p>
        <el-slider
          v-model="baseAttr.angle"
          :max="360"
          @input="(value: any) => changeCommon('angle', value)"
        />

        <p class="text-14px text-[#15293c80] mt-2">透明</p>
        <el-slider
          v-model="baseAttr.opacity"
          :max="100"
          @input="(value: any) => changeCommon('opacity', value)"
        />
      </main>
    </el-popover>
  </div>
</template>
