<script setup lang="ts">
import { shapeList } from '@/constants/editor'
import { debounce } from 'lodash-es'
import { shapes } from '@/enums/editor'
import { useEditorStore } from '@/stores/modules/editor'
import { getPolygonVertices } from '@/utils/math'

const editorStore = useEditorStore()
const defaultPosition = { shadow: '', fontFamily: 'arial' }

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
</script>

<template>
  <div>
    <ul class="flex flex-wrap gap-2">
      <li
        class="f-center flex-col p-10px select-none cursor-pointer w-88px h-full ml-10px mb-10px bg-#f1f2f4 rounded-12px editor-item"
        v-for="shape in shapeList"
        :key="shape.type"
        @click="handleAddShape(shape.type)"
      >
        <el-button class="py-8!">
          <div class="w-[40px] h-[40px]" v-html="shape.icon" />
        </el-button>
      </li>
    </ul>
  </div>
</template>
