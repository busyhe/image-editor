<script setup lang="ts">
import { onMounted, onUnmounted, provide } from 'vue'
import { fabric } from 'fabric'
import { throttle } from 'lodash-es'
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
  CopyPlugin,
  MoveHotKeyPlugin,
  FlipPlugin,
  FontPlugin,
  DeleteHotKeyPlugin,
  ControlsRotatePlugin,
  GroupPlugin,
  GroupAlignPlugin,
  GroupTextEditorPlugin,
  ImageStroke,
  LockPlugin,
  MaskPlugin,
  SimpleClipImagePlugin,
} from '@/lib/core'
import { useEditorStore } from '@/stores/modules/editor'
import { useTemplateStore } from '@/stores/modules/template'
import { useTaskInit } from '@/hooks/useTaskInit'
import { useAutoSave } from '@/hooks/useAutoSave'

const editorStore = useEditorStore()
const templateStore = useTemplateStore()
const canvasEditor = new Editor()
const { debouncedSave } = useAutoSave()

onMounted(async () => {
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
  canvasEditor.use(HistoryPlugin as any)
  canvasEditor.use(LayerPlugin)
  canvasEditor.use(RulerPlugin)
  canvasEditor.use(WorkspacePlugin, { width: 1080, height: 1920 })
  canvasEditor.use(CopyPlugin)
  canvasEditor.use(MoveHotKeyPlugin)
  canvasEditor.use(FlipPlugin)
  canvasEditor.use(FontPlugin, { repoSrc: 'https://api.kuaitu.cc' })
  canvasEditor.use(DeleteHotKeyPlugin)
  canvasEditor.use(ControlsRotatePlugin)
  canvasEditor.use(GroupPlugin)
  canvasEditor.use(GroupAlignPlugin)
  canvasEditor.use(GroupTextEditorPlugin)
  canvasEditor.use(ImageStroke)
  canvasEditor.use(LockPlugin)
  canvasEditor.use(MaskPlugin)
  canvasEditor.use(SimpleClipImagePlugin)

  editorStore.setEditor(canvasEditor)
  editorStore.setCanvas(canvas)

  // 尝试从 URL code 初始化
  const { init: initTask } = useTaskInit()
  // const isTaskInit = await initTask()
  const isTaskInit = false

  // 初始化默认模板（如果没有模板且不是任务初始化）
  if (!isTaskInit && templateStore.templateList.length === 0) {
    const { v4: uuidv4 } = await import('uuid')
    const defaultTemplate = {
      id: uuidv4(),
      width: 1080,
      height: 1920,
      zoom: 1,
      objects: [
        {
          type: 'rect',
          id: 'workspace',
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          fill: 'transparent',
          selectable: false,
          hasControls: false,
          evented: false,
        } as any,
      ],
      backgroundColor: '#ffffff',
      workSpace: {
        width: 1080,
        height: 1920,
        fill: '#ffffff',
        fillType: 0,
      },
    }
    templateStore.templateList.push(defaultTemplate)
    templateStore.curTempIdx = 0
    await templateStore.renderTemplate()
  }

  // 创建节流的缩略图更新函数
  const throttledUpdateThumbnail = throttle(
    () => {
      templateStore.syncCanvasToTemplate()
    },
    500,
    { leading: false, trailing: true },
  )

  // 监听画布变化，自动同步到模板并更新缩略图
  canvas.on('object:added', (e) => {
    // 排除 workspace 对象 和 loading-mask
    if (e.target && e.target.id !== 'workspace' && e.target.id !== 'loading-mask') {
      throttledUpdateThumbnail()
      debouncedSave()
    }
  })

  canvas.on('object:modified', () => {
    throttledUpdateThumbnail()
    debouncedSave()
  })

  canvas.on('object:removed', (e) => {
    // 排除 workspace 对象 和 loading-mask
    if (e.target && e.target.id !== 'workspace' && e.target.id !== 'loading-mask') {
      throttledUpdateThumbnail()
      debouncedSave()
    }
  })

  // 监听画布大小变化事件（由 WorkspacePlugin 触发）
  const handleSizeChange = (width: number, height: number) => {
    // 更新当前模板的尺寸
    if (templateStore.curTemplate) {
      const workspace = canvas.getObjects().find((item) => item.id === 'workspace')
      if (workspace) {
        // 同步更新模板数据
        templateStore.updateTemplate({
          width: width * templateStore.curTemplate.zoom,
          height: height * templateStore.curTemplate.zoom,
        })
        // 立即同步并更新缩略图
        templateStore.syncCanvasToTemplate()
        debouncedSave()
      }
    }
  }

  canvasEditor.on('sizeChange', handleSizeChange)

  // 清理函数
  onUnmounted(() => {
    throttledUpdateThumbnail.cancel()
    canvas.off('object:added')
    canvas.off('object:modified')
    canvas.off('object:removed')
    canvasEditor.off('sizeChange', handleSizeChange)
  })
})

onUnmounted(() => canvasEditor.destroy())

provide('fabric', fabric)
provide('canvasEditor', canvasEditor)
</script>

<template>
  <GraphicEditorRender />
  <ToolsLayer />
</template>
