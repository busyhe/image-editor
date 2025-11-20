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
      return {
        taskId: 'mock-task-' + Date.now(),
        // Using a placeholder image that is CORS-friendly or local if possible.
        // For now using a placeholder service.
        sourceImageUrl:
          'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      }
    },
    checkStatus: async (taskId: string) => {
      console.log('Mock API: Checking status for', taskId)
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Randomly succeed after a few tries or immediately for demo
      return {
        status: 'SUCCESS',
        data: {
          version: '5.3.0',
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
              type: 'image',
              version: '5.3.0',
              originX: 'left',
              originY: 'top',
              left: 100,
              top: 100,
              width: 300,
              height: 300,
              fill: 'rgb(0,0,0)',
              stroke: null,
              strokeWidth: 0,
              strokeDashArray: null,
              strokeLineCap: 'butt',
              strokeDashOffset: 0,
              strokeLineJoin: 'miter',
              strokeUniform: false,
              strokeMiterLimit: 4,
              scaleX: 1,
              scaleY: 1,
              angle: 0,
              flipX: false,
              flipY: false,
              opacity: 1,
              shadow: null,
              visible: true,
              backgroundColor: '',
              fillRule: 'nonzero',
              paintFirst: 'fill',
              globalCompositeOperation: 'source-over',
              skewX: 0,
              skewY: 0,
              cropX: 0,
              cropY: 0,
              src: '', // Will be filled by processing
              crossOrigin: 'anonymous',
              filters: [],
              id: 'image-1',
            },
            {
              type: 'textbox',
              version: '5.3.0',
              originX: 'left',
              originY: 'top',
              left: 100,
              top: 500,
              width: 300,
              height: 50,
              fill: '#000000',
              text: 'Generated Text',
              fontSize: 40,
              fontFamily: 'Arial',
              id: 'text-1',
            },
          ],
          background: '#ffffff',
        },
      }
    },
  }

  const fetchDetail = async (code: string) => {
    if (MOCK_MODE) return mockApi.getDetail(code)
    const res = await axios.get(`/api/detail?code=${code}`)
    return res.data.data
  }

  const checkTaskStatus = async (taskId: string) => {
    if (MOCK_MODE) return mockApi.checkStatus(taskId)
    const res = await axios.get(`/api/task/status?taskId=${taskId}`)
    return res.data.data
  }

  const processCanvasJson = async (json: any, sourceImageUrl: string) => {
    // Load source image first
    const sourceImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = sourceImageUrl
    })

    const processedObjects = await Promise.all(
      json.objects.map(async (obj: any) => {
        if (obj.type === 'image') {
          // Create a temporary canvas to crop the image
          const canvas = document.createElement('canvas')
          canvas.width = obj.width
          canvas.height = obj.height
          const ctx = canvas.getContext('2d')

          if (ctx) {
            // Assuming obj.left/top/width/height in the JSON corresponds to the coordinates in the source image
            // If the JSON coordinates are canvas coordinates, we need the source coordinates separately.
            // For this implementation, I'm assuming the JSON object properties (left, top, width, height)
            // ARE the crop coordinates from the source image, AND also the position on the destination canvas.
            // If they are different, the JSON needs to provide sourceCrop coordinates.

            // Let's assume for now we crop from the source image at (obj.left, obj.top) with size (obj.width, obj.height)
            // And place it at (obj.left, obj.top) on the canvas.

            ctx.drawImage(
              sourceImage,
              obj.left,
              obj.top,
              obj.width,
              obj.height, // Source crop
              0,
              0,
              obj.width,
              obj.height, // Destination on temp canvas
            )

            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve))
            if (blob) {
              const url = URL.createObjectURL(blob)
              return { ...obj, src: url }
            }
          }
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
      // 1. Get Detail
      const { taskId, sourceImageUrl } = await fetchDetail(code)

      // 2. Poll Status
      let resultJson = null
      while (!resultJson) {
        const res = await checkTaskStatus(taskId)
        if (res.status === 'SUCCESS') {
          resultJson = res.data
        } else if (res.status === 'FAILED') {
          throw new Error('Task failed')
        } else {
          await new Promise((resolve) => setTimeout(resolve, 5000)) // 5s polling
        }
      }

      // 3. Process JSON (Crop images)
      const finalJson = await processCanvasJson(resultJson, sourceImageUrl)

      // 4. Render to Canvas
      // Clear existing template/canvas
      templateStore.templateList = []

      // Create a new template from the JSON
      const newTemplate = {
        id: taskId,
        width: 1080, // Should come from JSON
        height: 1080, // Should come from JSON
        zoom: 1,
        objects: finalJson.objects,
        backgroundColor: finalJson.background || '#ffffff',
        workSpace: {
          width: 1080,
          height: 1080,
          fill: '#ffffff',
          fillType: 0,
        },
      }

      templateStore.templateList.push(newTemplate)
      templateStore.curTempIdx = 0

      // We need to wait for the editor to be ready if it isn't already,
      // but this init is called in onMounted, so it should be fine to set data.
      // However, templateStore.renderTemplate() relies on editorStore.canvas

      await templateStore.renderTemplate()

      ElMessage.success('Task loaded successfully')
      return true
    } catch (error) {
      console.error('Task init failed:', error)
      ElMessage.error('Failed to load task data')
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
