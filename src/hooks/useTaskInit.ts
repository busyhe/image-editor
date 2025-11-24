import { ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useTemplateStore } from '@/stores/modules/template'
import { ElMessage } from 'element-plus'

// Mock flag - set to false when real API is ready
const MOCK_MODE = true

export function useTaskInit() {
  const loading = ref(false)
  const templateStore = useTemplateStore()

  const route = useRoute()

  const getCodeFromUrl = () => {
    return route.query.code as string
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
            version: '6.0.0',
            clipPath: {
              type: 'rect',
              version: '5.3.0',
              width: 1024,
              height: 1024,
            },
            background: '#ffffff',
            objects: [
              {
                type: 'rect',
                left: 0,
                top: 0,
                width: 1024,
                height: 1024,
                fill: '#F4BA3A',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                metadata: {
                  layerName: 'Background',
                  confidence: 1,
                  description: 'Yellow background fill',
                },
                id: 'object-0',
              },
              {
                type: 'image',
                left: 47,
                top: 46,
                width: 222,
                height: 52,
                src: '',
                cropX: 0,
                cropY: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                metadata: {
                  layerName: 'Pulsar Logo',
                  confidence: 0.98,
                  description: 'Pulsar brand logo with blue circular icon and text',
                },
                id: 'object-1',
              },
              {
                type: 'textbox',
                left: 311,
                top: 149,
                width: 402,
                height: 40,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'Monto del préstamo',
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'center',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Header Text - Loan Amount',
                  confidence: 0.95,
                  description: "Header text reading 'Monto del préstamo'",
                },
                id: 'object-2',
              },
              {
                type: 'textbox',
                left: 315,
                top: 213,
                width: 394,
                height: 75,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'MXN $20,000',
                fontSize: 64,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'center',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Main Amount',
                  confidence: 0.95,
                  description: 'Large loan amount text displaying MXN $20,000',
                },
                id: 'object-3',
              },
              {
                type: 'rect',
                left: 133,
                top: 350,
                width: 758,
                height: 472,
                fill: '#FFFFFF',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                rx: 40,
                ry: 40,
                metadata: {
                  layerName: 'White Card Container',
                  confidence: 0.95,
                  description: 'White rounded rectangle container for table and button',
                },
                id: 'object-4',
              },
              {
                type: 'rect',
                left: 162,
                top: 388,
                width: 700,
                height: 73,
                fill: '#ECA860',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                rx: 10,
                ry: 10,
                metadata: {
                  layerName: 'Table Header Background',
                  confidence: 0.95,
                  description: 'Orange header row background for table',
                },
                id: 'object-5',
              },
              {
                type: 'textbox',
                left: 174,
                top: 410,
                width: 220,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'Monto del préstamo',
                fontSize: 20,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Table Header Column 1',
                  confidence: 0.95,
                  description: 'First column header text',
                },
                id: 'object-6',
              },
              {
                type: 'textbox',
                left: 436,
                top: 410,
                width: 180,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'plazos de pago',
                fontSize: 20,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Table Header Column 2',
                  confidence: 0.95,
                  description: 'Second column header text',
                },
                id: 'object-7',
              },
              {
                type: 'textbox',
                left: 659,
                top: 410,
                width: 180,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'Pago quincenal',
                fontSize: 20,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Table Header Column 3',
                  confidence: 0.95,
                  description: 'Third column header text',
                },
                id: 'object-8',
              },
              {
                type: 'rect',
                left: 162,
                top: 461,
                width: 700,
                height: 84,
                fill: '#FFFFFF',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                metadata: {
                  layerName: 'Table Row 1 Background',
                  confidence: 0.95,
                  description: 'First data row background',
                },
                id: 'object-9',
              },
              {
                type: 'textbox',
                left: 195,
                top: 489,
                width: 180,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'MXN $8,000',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 1 Col 1',
                  confidence: 0.95,
                  description: 'First row, first column data',
                },
                id: 'object-10',
              },
              {
                type: 'textbox',
                left: 444,
                top: 489,
                width: 170,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: '6 quincenas',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 1 Col 2',
                  confidence: 0.95,
                  description: 'First row, second column data',
                },
                id: 'object-11',
              },
              {
                type: 'textbox',
                left: 665,
                top: 489,
                width: 170,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'MXN $1,560',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 1 Col 3',
                  confidence: 0.95,
                  description: 'First row, third column data',
                },
                id: 'object-12',
              },
              {
                type: 'rect',
                left: 162,
                top: 548,
                width: 700,
                height: 81,
                fill: '#B4D899',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                metadata: {
                  layerName: 'Table Row 2 Background',
                  confidence: 0.95,
                  description: 'Second data row background (highlighted in green)',
                },
                id: 'object-13',
              },
              {
                type: 'textbox',
                left: 192,
                top: 574,
                width: 180,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'MXN $15,000',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 2 Col 1',
                  confidence: 0.95,
                  description: 'Second row, first column data',
                },
                id: 'object-14',
              },
              {
                type: 'textbox',
                left: 444,
                top: 574,
                width: 170,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: '8 quincenas',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 2 Col 2',
                  confidence: 0.95,
                  description: 'Second row, second column data',
                },
                id: 'object-15',
              },
              {
                type: 'textbox',
                left: 665,
                top: 574,
                width: 170,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'MXN $2,300',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 2 Col 3',
                  confidence: 0.95,
                  description: 'Second row, third column data',
                },
                id: 'object-16',
              },
              {
                type: 'rect',
                left: 162,
                top: 629,
                width: 700,
                height: 84,
                fill: '#FFFFFF',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                metadata: {
                  layerName: 'Table Row 3 Background',
                  confidence: 0.95,
                  description: 'Third data row background',
                },
                id: 'object-17',
              },
              {
                type: 'textbox',
                left: 195,
                top: 657,
                width: 180,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'MXN $2,000',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 3 Col 1',
                  confidence: 0.95,
                  description: 'Third row, first column data',
                },
                id: 'object-18',
              },
              {
                type: 'textbox',
                left: 444,
                top: 657,
                width: 170,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: '8 quincenas',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 3 Col 2',
                  confidence: 0.95,
                  description: 'Third row, second column data',
                },
                id: 'object-19',
              },
              {
                type: 'textbox',
                left: 665,
                top: 657,
                width: 170,
                height: 30,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'MXN $3,067',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'left',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'Row 3 Col 3',
                  confidence: 0.95,
                  description: 'Third row, third column data',
                },
                id: 'object-20',
              },
              {
                type: 'rect',
                left: 329,
                top: 738,
                width: 367,
                height: 57,
                fill: '#B4D899',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                rx: 30,
                ry: 30,
                metadata: {
                  layerName: 'CTA Button Background',
                  confidence: 0.95,
                  description: 'Green rounded button background',
                },
                id: 'object-21',
              },
              {
                type: 'textbox',
                left: 371,
                top: 750,
                width: 283,
                height: 33,
                fill: '#FFFFFF',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'Depositar en 3 minutos',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontStyle: 'normal',
                textAlign: 'center',
                lineHeight: 1.16,
                charSpacing: 0,
                metadata: {
                  layerName: 'CTA Button Text',
                  confidence: 0.95,
                  description: 'Call to action button text',
                },
                id: 'object-22',
              },
              {
                type: 'textbox',
                left: 103,
                top: 888,
                width: 818,
                height: 48,
                fill: '#000000',
                stroke: null,
                strokeWidth: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                text: 'Descargo de respainallicita: La aprovaión de solicadtad de préstamo, el limite de credite recal y el tiempo desembuso del préstamo dependen de las palificaciones individual y los resultos de la "revisión.',
                fontSize: 14,
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'center',
                lineHeight: 1.2,
                charSpacing: 0,
                metadata: {
                  layerName: 'Disclaimer Text',
                  confidence: 0.92,
                  description: 'Legal disclaimer text at bottom of image',
                },
                id: 'object-23',
              },
              {
                type: 'image',
                left: 945,
                top: 950,
                width: 50,
                height: 50,
                src: '',
                cropX: 0,
                cropY: 0,
                opacity: 1,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                metadata: {
                  layerName: 'Sparkle Icon',
                  confidence: 0.9,
                  description: 'Decorative sparkle icon in bottom right corner',
                },
                id: 'object-24',
              },
            ],
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

  const SOURCE_IMAGE_URL = 'https://i.mji.rip/2025/11/24/36a8b5d7d58e04128908fd2d54d7f182.png'

  const processCanvasJson = async (json: any) => {
    // Load source image once
    const sourceImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = SOURCE_IMAGE_URL
    })

    const processedObjects = await Promise.all(
      json.objects.map(async (obj: any) => {
        if (obj.type === 'image') {
          // Crop from original image
          const cropCanvas = document.createElement('canvas')
          cropCanvas.width = obj.width
          cropCanvas.height = obj.height
          const ctx = cropCanvas.getContext('2d')

          if (ctx) {
            // Draw the specific region from original image
            ctx.drawImage(
              sourceImage,
              obj.left,
              obj.top,
              obj.width,
              obj.height,
              0,
              0,
              obj.width,
              obj.height,
            )

            // Get background color from top-left pixel for removal
            const pixelData = ctx.getImageData(0, 0, 1, 1).data
            const base64 = cropCanvas.toDataURL()

            const newObj = {
              ...obj,
              src: base64,
              crossOrigin: 'anonymous',
            }

            // Check if not transparent and add filter
            if (pixelData[3] > 0) {
              const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`
              // Add RemoveColor filter configuration
              // Note: Fabric.js filters in JSON are usually objects with type and params
              // We need to match how fabric.js expects filters in JSON or how the editor loads them
              // Assuming standard fabric structure:
              if (!newObj.filters) {
                newObj.filters = []
              }
              newObj.filters.push({
                type: 'RemoveColor',
                color: color,
                distance: 0.1,
              })
            }
            return newObj
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
