<script setup lang="ts">
import { onMounted, onUnmounted, provide } from 'vue'
import { fabric } from 'fabric'
import GraphicEditorRender from '@/components/GraphicEditorRender/index.vue'
import ToolsLayer from '@/components/ToolsLayer/index.vue'
import Editor, {
  AddBaseTypePlugin,
  AlignGuidLinePlugin,
  CenterAlignPlugin,
  ControlsPlugin,
  DringPlugin,
  HistoryPlugin,
  LayerPlugin,
  RulerPlugin,
  WorkspacePlugin,
} from '@/lib/core'
import { useEditorStore } from '@/stores/modules/editor'

const canvasEditor = new Editor()

onMounted(() => {
  const editorStore = useEditorStore()

  // 初始化fabric
  const canvas = new fabric.Canvas('canvas', {
    fireRightClick: true, // 启用右键，button的数字为3
    stopContextMenu: true, // 禁止默认右键菜单
    controlsAboveOverlay: true, // 超出clipPath后仍然展示控制条
    // imageSmoothingEnabled: false, // 解决文字导出后不清晰问题
    preserveObjectStacking: true, // 当选择画布中的对象时，让对象不在顶层。
  })

  canvasEditor.init(canvas)

  canvasEditor.use(AddBaseTypePlugin)
  canvasEditor.use(AlignGuidLinePlugin)
  canvasEditor.use(CenterAlignPlugin)
  canvasEditor.use(ControlsPlugin)
  canvasEditor.use(DringPlugin)
  canvasEditor.use(HistoryPlugin)
  canvasEditor.use(LayerPlugin)
  canvasEditor.use(RulerPlugin)
  canvasEditor.use(WorkspacePlugin)

  editorStore.setEditor(canvasEditor)
  editorStore.setCanvas(canvas)
})

onUnmounted(() => canvasEditor.destroy())

provide('fabric', fabric)
provide('canvasEditor', canvasEditor)
</script>

<template>
  <GraphicEditorRender />
  <ToolsLayer />
</template>
