<script setup lang="ts">
import { ref, unref, computed, onDeactivated } from 'vue'
import { debounce } from 'lodash-es'
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
import { texts, shapes, DrawTypes, panels } from '@/enums/editor'
import { getPolygonVertices } from '@/utils/math'
import { storeToRefs } from 'pinia'
import AttributePosition from './AttributePosition/index.vue'
import useSelect from '@/hooks/select'

const editorStore = useEditorStore()
const { mixinState } = useSelect()
const editor = computed(() => editorStore.editor)

const { showPanel } = storeToRefs(editorStore)
// 绘制元素相关
const curDrawType = ref<DrawTypes | ''>('')
const isDrawingLineMode = ref(false)
const defaultPosition = { shadow: '', fontFamily: 'arial' }
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
const sizeList = ref([
  {
    id: 1,
    icon: RectangleVertical,
    name: '9:16',
    width: 1080,
    height: 1920,
    unit: 'px',
  },
  {
    id: 2,
    icon: RectangleHorizontal,
    name: '16:9',
    width: 1920,
    height: 1080,
    unit: 'px',
  },
  {
    id: 3,
    icon: Square,
    name: '1:1',
    width: 1080,
    height: 1080,
    unit: 'px',
  },
])

const handleAddText = debounce(function (type: texts) {
  let text: fabric.IText | null
  switch (type) {
    case texts.h1:
      text = new fabric.Textbox('双击编辑标题', {
        ...defaultPosition,
        fontWeight: 'bold',
        fontSize: 80,
        fill: '#000000',
      })
      break
    case texts.h2:
      text = new fabric.Textbox('双击编辑标题', {
        ...defaultPosition,
        fontWeight: 'bold',
        fontSize: 60,
        fill: '#000000',
      })
      break
    case texts.normal:
      text = new fabric.Textbox('双击编辑标题', {
        ...defaultPosition,
        fontSize: 48,
        fill: '#000000',
      })
      break
    default:
      break
  }
  text! && editorStore.editor.addBaseType(text, { center: true })
}, 250)

const handleAddShape = debounce(function (type: shapes) {
  switch (type) {
    case shapes.react:
      const rect = new fabric.Rect({
        ...defaultPosition,
        fill: '#F57274FF',
        width: 400,
        height: 400,
        name: '矩形',
      })
      editorStore.editor.addBaseType(rect, { center: true })
      break
    case shapes.triangle:
      const triangle = new fabric.Triangle({
        ...defaultPosition,
        width: 400,
        height: 400,
        fill: '#92706BFF',
        name: '三角形',
      })
      editorStore.editor.addBaseType(triangle, { center: true })
      break
    case shapes.around:
      const circle = new fabric.Circle({
        ...defaultPosition,
        radius: 150,
        fill: '#57606BFF',
        // id: uuid(),
        name: '圆形',
      })
      editorStore.editor.addBaseType(circle, { center: true })
      break
    case shapes.polygon:
      const polygon = new fabric.Polygon(getPolygonVertices(5, 200), {
        ...defaultPosition,
        fill: '#CCCCCCFF',
        name: '多边形',
      })
      polygon.set({
        // 创建完设置宽高，不然宽高会变成自动的值
        width: 400,
        height: 400,
        // 关闭偏移
        pathOffset: {
          x: 0,
          y: 0,
        },
      })
      editorStore.editor.addBaseType(polygon, { center: true })
      break
    case shapes.line:
      const line = new fabric.Line([100, 100, 10, 10], {
        ...defaultPosition,
        stroke: '#333',
        fill: '#333',
        name: '直线',
      })
      editorStore.editor.addBaseType(line, { center: true })
      break
    default:
      break
  }
}, 250)

const handleAddType = (type: panels) => {
  !unref(showPanel) && editorStore.setShowPanel(true)
  editorStore.setPanelType(type)
  // switch (type) {
  //   case 'text':
  //     handleAddText(texts.h1)
  //     break
  //   case 'shape':
  //     handleAddShape(shapes.react)
  //     break
  // }
}

function setColor(_color: string) {
  if (!_color) return

  editorStore.canvas?.setBackgroundColor(
    _color,
    editorStore.canvas.renderAll.bind(editorStore.canvas),
  )

  color.value = _color
}

const handleSetSize = (command: number) => {
  const item = sizeList.value.find((item) => item.id === command)
  if (item) {
    editorStore.editor?.setSize(item.width, item.height)
  }
}

function endConflictTools() {
  editorStore.editor.discardPolygon()
  editorStore.editor.endDraw()
  editorStore.editor.endTextPathDraw()
}

// 退出绘制状态
const cancelDraw = () => {
  if (!unref(isDrawingLineMode)) return
  isDrawingLineMode.value = false
  curDrawType.value = ''
  editorStore.editor.setMode(false)
  endConflictTools()
}

onDeactivated(() => {
  cancelDraw()
})
</script>

<template>
  <div class="flex justify-center gap-2">
    <el-dropdown placement="bottom-end" @command="handleAddType">
      <el-button>
        <el-icon><Plus /></el-icon>
      </el-button>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="panels.text"
            ><Type :size="16" class="mr-2" />文字</el-dropdown-item
          >
          <el-dropdown-item :command="panels.shape">
            <Shapes :size="16" class="mr-2" />形状
          </el-dropdown-item>
          <el-dropdown-item :command="panels.upload"
            ><Image :size="16" class="mr-2" />上传</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div v-show="!mixinState.mSelectMode">
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

      <el-dropdown placement="bottom-start" @command="handleSetSize">
        <el-button>
          <Proportions :size="16" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in sizeList" :key="item.id" :command="item.id">
              <component :is="item.icon" :size="16" class="mr-2" />{{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- <div v-show="mixinState.mSelectMode === 'one'"> -->
    <AttributePosition />
    <!-- </div> -->
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-button:focus-visible {
  outline: none;
}
</style>
