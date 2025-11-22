import { watch, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/modules/editor'
import { useTemplateStore } from '@/stores/modules/template'
import { globalTaskQueue } from '@/utils/taskQueue'
import { saveCanvasApi } from '@/api/mock'
import { debounce } from 'lodash-es'

export function useAutoSave() {
  const editorStore = useEditorStore()
  const templateStore = useTemplateStore()

  const getProjectCode = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('code')
  }

  const handleSave = async () => {
    const projectCode = getProjectCode()
    if (!projectCode) return

    const currentTemplate = templateStore.curTemplate
    if (!currentTemplate) return

    // Set saving state
    editorStore.setIsSaving(true)

    try {
      // Get current canvas data
      const canvasData = currentTemplate // Or specific data structure needed

      // Enqueue save task
      await globalTaskQueue.enqueue(async () => {
        await saveCanvasApi(projectCode, currentTemplate.id, canvasData)
      })
    } catch (error) {
      console.error('Auto save failed:', error)
    } finally {
      // Only reset if queue is empty (handled by queue processing, but for UI feedback we might want to keep it true if more tasks are pending)
      // For simplicity, we reset here, but in a real app we might check queue size
      if (globalTaskQueue.size === 0) {
        editorStore.setIsSaving(false)
      }
    }
  }

  // Debounce the save function to avoid too many requests
  const debouncedSave = debounce(handleSave, 2000)

  // Watch for changes in the current template/canvas
  // Note: This depends on how changes are tracked.
  // If we rely on fabric events, we should hook into those in Home.vue or similar.
  // If we rely on store state changes, we watch the store.
  // Given the requirement "Edit current canvas content", watching fabric object modifications is best.
  // But here we provide the save function to be called by event listeners.

  return {
    debouncedSave,
  }
}
