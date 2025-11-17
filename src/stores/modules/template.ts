import { defineStore } from 'pinia'
import store from '@/stores'
import { isUrl, src2blob } from '@/utils/common'
import { useEditorStoreWithOut } from '@/stores/modules/editor'
import type { Template, CanvasElement } from '@/types/template'
import { fabric } from 'fabric'
import { ElMessage } from 'element-plus'

interface IState {
  templateList: Template[] // 所有的模板
  curTempIdx: number // 当前页面索引
  templateCanvas: Map<string, fabric.StaticCanvas> // 缩略图画布缓存
}

const editorStore = useEditorStoreWithOut()

export const useTemplateStore = defineStore({
  id: 'Template',
  state: (): IState => ({
    templateList: [],
    curTempIdx: -1,
    templateCanvas: new Map(),
  }),
  getters: {
    curTemplate: (state) => state.templateList[state.curTempIdx] as Template,

    currentTemplateWidth(state) {
      const currentTemplate = state.templateList[state.curTempIdx]
      return currentTemplate ? currentTemplate.width / currentTemplate.zoom : 0
    },

    currentTemplateHeight(state) {
      const currentTemplate = state.templateList[state.curTempIdx]
      return currentTemplate ? currentTemplate.height / currentTemplate.zoom : 0
    },
  },
  actions: {
    // 设置当前模板的下标
    setTemplateIndex(index: number) {
      this.curTempIdx = index
    },

    // 切换到指定索引的模板页面
    async switchTemplate(index: number) {
      // 索引越界直接忽略
      if (index < 0 || index >= this.templateList.length) return
      // 与当前索引相同则不处理
      if (index === this.curTempIdx) return

      this.curTempIdx = index
      await this.renderTemplate()
    },

    // 添加模板
    async addTemplate(template: Template | Template[]) {
      const templates = Array.isArray(template) ? template : [template]
      const addIndex = this.curTempIdx >= 0 ? this.curTempIdx + 1 : 0

      // 在当前位置后插入
      this.templateList.splice(addIndex, 0, ...templates)
      this.curTempIdx = addIndex

      await this.renderTemplate()
    },

    // 复制当前模板
    async duplicateTemplate(templateId?: string) {
      const canvas = editorStore.canvas
      if (!canvas) return

      const targetId = templateId || this.curTemplate?.id
      const targetTemplate = this.templateList.find((t) => t.id === targetId)
      if (!targetTemplate) return

      // 深拷贝模板并生成新 ID
      const newTemplate: Template = JSON.parse(JSON.stringify(targetTemplate))
      const { v4: uuidv4 } = await import('uuid')
      newTemplate.id = uuidv4()

      // 为所有对象生成新 ID（除了 workspace）
      newTemplate.objects = newTemplate.objects.map((obj: any) => ({
        ...obj,
        id: obj.id === 'workspace' ? 'workspace' : uuidv4(),
      }))

      const addIndex = this.curTempIdx + 1
      this.templateList.splice(addIndex, 0, newTemplate)
      this.curTempIdx = addIndex

      await this.renderTemplate()
    },

    // 渲染模板到主画布
    async renderTemplate() {
      const canvas = editorStore.canvas
      if (!canvas || !this.curTemplate) return

      try {
        // 清除当前选中对象
        canvas.discardActiveObject()

        // 加载模板数据
        await canvas.loadFromJSON(this.curTemplate, () => {
          // 确保 workspace 对象不可选中
          const workspace = canvas.getObjects().find((item) => item.id === 'workspace')
          if (workspace) {
            workspace.set('selectable', false)
            workspace.set('hasControls', false)
            workspace.set('evented', false)
          }

          canvas.renderAll()

          // 通知 workspace 插件更新尺寸
          const workspacePlugin = editorStore.editor?.getPlugin('WorkspacePlugin')
          if (workspacePlugin && workspace) {
            workspacePlugin.setSize(workspace.width, workspace.height)
          }
        })
      } catch (error) {
        console.error('渲染模板失败:', error)
      }
    },

    // 更新模板
    updateTemplate(props: Partial<Template>) {
      const templateIdx = this.curTempIdx
      if (templateIdx < 0 || !this.templateList[templateIdx]) return

      this.templateList[templateIdx] = {
        ...this.templateList[templateIdx],
        ...props,
      }
    },

    async setTemplatePreview(src: string) {
      const currentTemplate = this.templateList[this.curTempIdx]
      if (this.curTempIdx < 0 || !currentTemplate) return

      if (!isUrl(src)) {
        src = `${window.location.origin}/${src}`
      }
      const blob = await src2blob(src)
      if (!blob) return
      currentTemplate.preview = blob
    },

    // 删除模板
    async deleteTemplate(templateId?: string | string[]) {
      const len = this.templateList.length
      if (len === 1) {
        ElMessage.warning('删除失败，至少要有一个模板')
        return
      }

      let templateIds: string[]
      if (!templateId) {
        // 删除当前模板
        if (this.curTempIdx < 0) return
        templateIds = [this.curTemplate.id]
      } else {
        templateIds = Array.isArray(templateId) ? templateId : [templateId]
      }

      const deleteIndices: number[] = []
      for (const id of templateIds) {
        const index = this.templateList.findIndex((item) => item.id === id)
        if (index >= 0) {
          deleteIndices.push(index)
          // 删除对应的缩略图画布缓存
          this.templateCanvas.delete(id)
        }
      }

      if (deleteIndices.length === 0) return

      let newIndex = Math.min(...deleteIndices)
      const maxIndex = this.templateList.length - templateIds.length - 1
      if (newIndex > maxIndex) newIndex = maxIndex

      // 删除模板
      this.templateList = this.templateList.filter((item) => !templateIds.includes(item.id))
      this.curTempIdx = newIndex

      // 重新渲染当前页面
      if (this.templateList.length > 0 && this.curTempIdx >= 0) {
        await this.renderTemplate()
      }
    },

    // 清空当前模板（保留 workspace）
    clearTemplate() {
      const currentTemplate = this.templateList[this.curTempIdx]
      if (this.curTempIdx < 0 || !currentTemplate) return

      const objects = currentTemplate.objects.filter((item: any) => item.id === 'workspace')
      currentTemplate.objects = objects
      this.renderTemplate()
      this.updateThumbnail()
    },

    /**
     * 更新当前页面的缩略图
     * 通过重新加载当前模板到缩略图画布来更新预览
     */
    async updateThumbnail() {
      if (!this.curTemplate) return

      const thumbCanvas = this.templateCanvas.get(this.curTemplate.id)
      if (!thumbCanvas) return

      try {
        await thumbCanvas.loadFromJSON(this.curTemplate, () => {
          // 隐藏辅助元素
          thumbCanvas.getObjects().forEach((item: any) => {
            if (item.id === 'workspace') {
              item.visible = true
            }
          })

          const workspace = thumbCanvas.getObjects().find((item: any) => item.id === 'workspace')
          const width = this.curTemplate.width / this.curTemplate.zoom
          const thumbSize = 120 // 缩略图尺寸
          const viewportRatio = this.curTemplate.height / this.curTemplate.width
          const thumbZoom = thumbSize / width

          thumbCanvas.setDimensions({
            width: thumbSize,
            height: thumbSize * viewportRatio,
          })
          thumbCanvas.setZoom(thumbZoom)

          const thumbViewportTransform = thumbCanvas.viewportTransform
          if (thumbViewportTransform && workspace) {
            const left = workspace.left || 0
            const top = workspace.top || 0
            thumbViewportTransform[4] = -left * thumbZoom
            thumbViewportTransform[5] = -top * thumbZoom
            thumbCanvas.setViewportTransform(thumbViewportTransform)
          }

          thumbCanvas.renderAll()
        })
      } catch (error) {
        console.error('更新缩略图失败:', error)
      }
    },

    // 同步当前画布状态到模板
    syncCanvasToTemplate() {
      const canvas = editorStore.canvas
      if (!canvas || this.curTempIdx < 0 || !this.curTemplate) return

      const templateData = canvas.toJSON(['id'])
      const workspace = canvas.getObjects().find((item: any) => item.id === 'workspace')

      // 同步画布数据，包括 workspace 的尺寸
      const updatedTemplate: Template = {
        ...this.templateList[this.curTempIdx],
        ...templateData,
        id: this.curTemplate.id, // 保留原始 id
        zoom: this.curTemplate.zoom, // 保留缩放比例
        workSpace: this.curTemplate.workSpace, // 保留工作区配置
        // 确保尺寸信息正确同步
        width: workspace ? workspace.width! * this.curTemplate.zoom : this.curTemplate.width,
        height: workspace ? workspace.height! * this.curTemplate.zoom : this.curTemplate.height,
      }

      this.templateList[this.curTempIdx] = updatedTemplate
      this.updateThumbnail()
    },
  },
})

export function useTemplateStoreWithOut() {
  return useTemplateStore(store)
}
