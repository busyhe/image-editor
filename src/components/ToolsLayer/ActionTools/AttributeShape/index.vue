<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { SquareDashed, Circle, Minus } from 'lucide-vue-next'
import useSelect from '@/hooks/select'
import { useEditorStore } from '@/stores/modules/editor'
import ColorPicker from '../ColorPicker/index.vue'

const { selectType, isOne } = useSelect()
const editorStore = useEditorStore()

const baseAttr = reactive({
  fill: '',
  stroke: '',
  strokeWidth: 0,
})

const getObjectAttr = () => {
  const activeObject = editorStore.canvas?.getActiveObject()
  if (activeObject) {
    baseAttr.fill = activeObject.get('fill') as string
    baseAttr.stroke = activeObject.get('stroke') as string
    baseAttr.strokeWidth = activeObject.get('strokeWidth') || 0
  }
}

const changeCommon = (key: string, value: any) => {
  const activeObject = editorStore.canvas?.getActiveObject()
  if (activeObject) {
    activeObject.set(key as any, value)
    editorStore.canvas?.requestRenderAll()
  }
}

onMounted(() => {
  nextTick(() => {
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
  <div v-if="isOne && selectType !== 'image' && selectType !== 'group'" class="flex items-center">
    <!-- Fill Color -->
    <el-popover placement="bottom" trigger="click" width="auto">
      <template #reference>
        <el-button title="填充颜色">
          <SquareDashed :size="16" :style="{ color: baseAttr.fill }" />
        </el-button>
      </template>
      <ColorPicker :model-value="baseAttr.fill" @change="(val: any) => changeCommon('fill', val)" />
    </el-popover>

    <!-- Stroke Color -->
    <el-popover placement="bottom" trigger="click" width="auto">
      <template #reference>
        <el-button title="描边颜色">
          <Circle :size="16" :style="{ color: baseAttr.stroke }" />
        </el-button>
      </template>
      <ColorPicker
        :model-value="baseAttr.stroke"
        @change="(val: any) => changeCommon('stroke', val)"
      />
    </el-popover>

    <!-- Stroke Width -->
    <el-popover placement="bottom" trigger="click" width="200">
      <template #reference>
        <el-button title="描边宽度">
          <Minus :size="16" />
        </el-button>
      </template>
      <div class="p-2">
        <div class="text-xs text-gray-500 mb-2">描边宽度</div>
        <el-slider
          v-model="baseAttr.strokeWidth"
          :min="0"
          :max="20"
          @input="(val: any) => changeCommon('strokeWidth', val)"
        />
      </div>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
