<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Plus,
  Type,
  Image,
  Shapes,
  Proportions,
  SquareDashed,
  RectangleVertical,
  RectangleHorizontal,
  Square,
} from 'lucide-vue-next'
import { fabric } from 'fabric'
import { useEditorStore } from '@/stores/modules/editor'

const defaultPosition = { shadow: '', fontFamily: 'arial' }
const editorStore = useEditorStore()
const colorList = ref([
  '#5F2B63',
  '#B23554',
  '#F27E56',
  '#FCE766',
  '#86DCCD',
  '#E7FDCB',
  '#FFDC84',
  '#F57677',
  '#5FC2C7',
  '#98DFE5',
  '#C2EFF3',
  '#DDFDFD',
  '#9EE9D3',
  '#2FC6C8',
  '#2D7A9D',
  '#48466d',
  '#61c0bf',
  '#bbded6',
  '#fae3d9',
  '#ffb6b9',
  '#ffaaa5',
  '#ffd3b6',
  '#dcedc1',
  '#a8e6cf',
])
const color = ref('rgba(255, 255, 255, 1)')

const handleAddShape = (command: string) => {
  if (!editorStore.editor) return

  let object: fabric.Object

  switch (command) {
    case 'text':
      object = new fabric.Textbox('双击编辑文字', {
        ...defaultPosition,
        width: 200,
        fontSize: 24,
        fill: '#000000',
      })
      break
    case 'shape':
      object = new fabric.Rect({
        ...defaultPosition,
        fill: '#F57274FF',
        width: 400,
        height: 400,
        name: '矩形',
      })
      break
    case 'image':
      // 创建图片占位符或触发图片上传
      object = new fabric.Rect({
        ...defaultPosition,
        fill: '#E0E0E0',
        width: 400,
        height: 300,
        name: '图片占位符',
      })
      break
    default:
      return
  }

  editorStore.editor.addBaseType(object, { center: true })
}

function setColor(_color: string) {
  if (!_color) return

  editorStore.canvas?.setBackgroundColor(
    _color,
    editorStore.canvas.renderAll.bind(editorStore.canvas),
  )

  color.value = _color
}

onMounted(() => {})
</script>

<template>
  <div class="flex justify-center gap-2">
    <el-dropdown placement="bottom-end" @command="handleAddShape">
      <el-button>
        <el-icon><Plus /></el-icon>
      </el-button>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="text"><Type :size="16" class="mr-2" />文字</el-dropdown-item>
          <el-dropdown-item command="shape">
            <Shapes :size="16" class="mr-2" />形状
          </el-dropdown-item>
          <el-dropdown-item command="image"><Image :size="16" class="mr-2" />图片</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div>
      <el-popover placement="bottom" trigger="hover">
        <template #reference>
          <el-button>
            <SquareDashed :size="16" />
          </el-button>
        </template>

        <main class="palette-color-list flex flex-wrap gap-2">
          <template v-for="(item, i) in colorList" :key="item + i">
            <span
              class="inline-block w-6 h-6 rounded-sm cursor-pointer"
              :style="`background:${item}`"
              @click="setColor(item)"
            ></span>
          </template>
        </main>
      </el-popover>

      <el-dropdown placement="bottom-start" @command="handleAddShape">
        <el-button>
          <Proportions :size="16" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="shape">
              <RectangleVertical :size="16" class="mr-2" />9:16
            </el-dropdown-item>
            <el-dropdown-item command="shape">
              <RectangleHorizontal :size="16" class="mr-2" />16:9
            </el-dropdown-item>
            <el-dropdown-item command="image">
              <Square :size="16" class="mr-2" />1:1
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-button:focus-visible {
  outline: none;
}
</style>
