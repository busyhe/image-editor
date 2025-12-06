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
  LayoutTemplate,
} from 'lucide-vue-next'
import { fabric } from 'fabric'
import { useEditorStore } from '@/stores/modules/editor'
import { texts, shapes, DrawTypes, panels } from '@/enums/editor'
import { getPolygonVertices } from '@/utils/math'
import { storeToRefs } from 'pinia'
import AttributePosition from './AttributePosition/index.vue'
import AttributeFont from './AttributeFont/index.vue'
import AttributeShape from './AttributeShape/index.vue'
import AttributeImage from './AttributeImage/index.vue'
import ColorPicker from './ColorPicker/index.vue'

import { useTemplateStore } from '@/stores/modules/template'
import useSelect from '@/hooks/select'

const editorStore = useEditorStore()
const templateStore = useTemplateStore()
const { mixinState } = useSelect()
const editor = computed(() => editorStore.editor)

const { showPanel } = storeToRefs(editorStore)
// 绘制元素相关
const curDrawType = ref<DrawTypes | ''>('')
const isDrawingLineMode = ref(false)
const defaultPosition = { shadow: '', fontFamily: 'arial' }

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

const svgInputRef = ref<HTMLInputElement | null>(null)

const handleUploadSVG = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const url = URL.createObjectURL(file)
  fabric.loadSVGFromURL(url, (objects, options) => {
    const canvas = editorStore.canvas
    if (!canvas) {
      URL.revokeObjectURL(url)
      return
    }

    // Filter out null/undefined objects that Fabric.js couldn't parse
    const validObjects = objects.filter((obj) => obj !== null && obj !== undefined)

    if (validObjects.length === 0) {
      console.warn('No valid objects found in SVG')
      URL.revokeObjectURL(url)
      if (svgInputRef.value) {
        svgInputRef.value.value = ''
      }
      return
    }

    try {
      const group = fabric.util.groupSVGElements(validObjects, options)
      group.set({
        left: (canvas.width || 0) / 2,
        top: (canvas.height || 0) / 2,
        originX: 'center',
        originY: 'center',
      })
      editorStore.editor.addBaseType(group, { center: true })
      console.log('canvas json', canvas.toJSON())
    } catch (error) {
      console.error('Error processing SVG:', error)
    }

    URL.revokeObjectURL(url)
    // Clear input value to allow re-uploading the same file
    if (svgInputRef.value) {
      svgInputRef.value.value = ''
    }
  })
}

const handleAddArcText = () => {
  const path = new fabric.Path('M 0 100 Q 200 -50 400 100', {
    fill: '',
    stroke: '',
    visible: false,
  })
  const text = new fabric.IText('弧形文字', {
    ...defaultPosition,
    fontSize: 60,
    path: path,
    fill: '#000000',
    name: '弧形文字',
  } as any)
  editorStore.editor.addBaseType(text, { center: true })
}

const handleAddType = (type: panels) => {
  if (type === panels.svg) {
    svgInputRef.value?.click()
    return
  }
  if (type === panels.pathText) {
    editorStore.editor.startTextPathDraw()
    return
  }
  if (type === panels.arcText) {
    handleAddArcText()
    return
  }
  if (!unref(showPanel)) {
    editorStore.setShowPanel(true)
  }
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

  // Update template store
  templateStore.updateTemplate({ backgroundColor: _color })
  templateStore.updateThumbnail()
}

import { useAutoSave } from '@/hooks/useAutoSave'

const { debouncedSave } = useAutoSave()

const handleSetSize = (command: number) => {
  const item = sizeList.value.find((item) => item.id === command)
  if (item) {
    editorStore.editor?.setSize(item.width, item.height)
    debouncedSave()
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
  <div class="flex justify-center items-center gap-2">
    <input ref="svgInputRef" type="file" accept=".svg" class="hidden" @change="handleUploadSVG" />
    <el-dropdown placement="bottom-end" @command="handleAddType">
      <el-button title="新增">
        <el-icon><Plus /></el-icon>
      </el-button>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="panels.text"
            ><Type :size="16" class="mr-2" />文字</el-dropdown-item
          >
          <el-dropdown-item :command="panels.arcText"
            ><Type :size="16" class="mr-2" />弧形文字</el-dropdown-item
          >
          <el-dropdown-item :command="panels.pathText"
            ><Type :size="16" class="mr-2" />绘制路径文字</el-dropdown-item
          >
          <el-dropdown-item :command="panels.shape">
            <Shapes :size="16" class="mr-2" />形状
          </el-dropdown-item>
          <el-dropdown-item :command="panels.material">
            <Image :size="16" class="mr-2" />上传
          </el-dropdown-item>
          <el-dropdown-item :command="panels.svg">
            <Image :size="16" class="mr-2" />上传svg
          </el-dropdown-item>
          <el-dropdown-item :command="panels.template">
            <LayoutTemplate :size="16" class="mr-2" />模板
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div v-show="!mixinState.mSelectMode">
      <el-popover placement="bottom" trigger="hover" width="280">
        <template #reference>
          <el-button title="背景">
            <SquareDashed :size="16" />
          </el-button>
        </template>

        <ColorPicker :model-value="color" @change="setColor" />
      </el-popover>

      <el-dropdown placement="bottom-start" @command="handleSetSize">
        <el-button title="尺寸">
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

    <div v-show="mixinState.mSelectMode === 'one'" class="flex gap-2">
      <AttributeFont />
      <AttributeShape />
      <AttributeImage />
      <AttributePosition />
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-button:focus-visible) {
  outline: none;
}
</style>
