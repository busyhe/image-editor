import { ref } from 'vue'
import axios from 'axios'
import { useTemplateStore } from '@/stores/modules/template'
import { ElMessage } from 'element-plus'

// Mock flag - set to false when real API is ready
const MOCK_MODE = true

export function useTaskInit() {
  const loading = ref(false)
  const templateStore = useTemplateStore()

  const getCodeFromUrl = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('code')
  }

  // Mock API calls
  const mockApi = {
    getDetail: async (code: string) => {
      console.log('Mock API: Getting detail for code', code)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Return a project structure with multiple pages (templates)
      return {
        id: 'project-' + Date.now(),
        name: 'Mock Project',
        templates: [
          {
            id: 'page-1',
            width: 1080,
            height: 1920,
            zoom: 1,
            objects: [
              {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                fill: '#ffffff',
                id: 'workspace',
                selectable: false,
                hasControls: false,
              },
              {
                type: 'textbox',
                left: 100,
                top: 100,
                width: 300,
                fontSize: 40,
                text: 'Page 1 Content',
                fill: '#000000',
                id: 'text-p1',
              },
            ],
            workSpace: {
              width: 1080,
              height: 1920,
              fill: '#ffffff',
              fillType: 0,
            },
          },
          {
            id: 'page-2',
            width: 1080,
            height: 1920,
            zoom: 1,
            objects: [
              {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1080,
                height: 1920,
                fill: '#f0f0f0',
                id: 'workspace',
                selectable: false,
                hasControls: false,
              },
              {
                type: 'textbox',
                left: 100,
                top: 300,
                width: 300,
                fontSize: 40,
                text: 'Page 2 Content',
                fill: '#ff0000',
                id: 'text-p2',
              },
            ],
            workSpace: {
              width: 1080,
              height: 1920,
              fill: '#f0f0f0',
              fillType: 0,
            },
          },
        ],
      }
    },
  }

  const fetchDetail = async (code: string) => {
    if (MOCK_MODE) return mockApi.getDetail(code)
    const res = await axios.get(`/api/project/detail?code=${code}`)
    return res.data.data
  }

  const processCanvasJson = async (json: any) => {
    // If there are images that need cropping from a source image, handle it here.
    // For now, we assume the objects are already in a renderable state or don't need complex processing
    // unless the API returns a specific structure requiring it (like the previous single-task flow).
    // Preserving the structure for future image processing if needed.

    const processedObjects = await Promise.all(
      json.objects.map(async (obj: any) => {
        if (obj.type === 'image' && obj.src) {
          // Ensure crossOrigin is set for images
          return { ...obj, crossOrigin: 'anonymous' }
        }
        return obj
      }),
    )

    return { ...json, objects: processedObjects }
  }

  const init = async () => {
    const code = getCodeFromUrl()
    if (!code) return false // No code, proceed with normal init

    loading.value = true
    try {
      // 1. Get Project Detail
      const projectData = await fetchDetail(code)

      if (!projectData || !projectData.templates || projectData.templates.length === 0) {
        throw new Error('No templates found in project')
      }

      // 2. Process all templates
      const processedTemplates = []
      for (const tpl of projectData.templates) {
        const processed = await processCanvasJson(tpl)
        processedTemplates.push({
          ...processed,
          // Ensure essential fields exist
          id: tpl.id || `page-${Date.now()}-${Math.random()}`,
          width: tpl.width || 1080,
          height: tpl.height || 1920,
          workSpace: tpl.workSpace || {
            width: tpl.width || 1080,
            height: tpl.height || 1920,
            fill: tpl.backgroundColor || '#ffffff',
            fillType: 0,
          },
        })
      }

      // 3. Update Template Store
      templateStore.templateList = []
      // Add all templates
      templateStore.templateList.push(...processedTemplates)

      // Set current index to 0
      templateStore.curTempIdx = 0

      // 4. Render the first template
      await templateStore.renderTemplate()

      ElMessage.success('Project loaded successfully')
      return true
    } catch (error) {
      console.error('Project init failed:', error)
      ElMessage.error('Failed to load project data')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    init,
    loading,
  }
}
