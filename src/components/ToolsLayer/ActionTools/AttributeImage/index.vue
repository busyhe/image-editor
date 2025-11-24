<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Layers2 } from 'lucide-vue-next'
import { fabric } from 'fabric'
import useSelect from '@/hooks/select'
import { useEditorStore } from '@/stores/modules/editor'
import { Utils } from '@/lib/core'
import { ElMessage } from 'element-plus'

interface IExtendImage {
  [x: string]: any
  originWidth?: number
  originHeight?: number
  originSrc?: string
}

const editorStore = useEditorStore()
const { isOne } = useSelect()
const isImage = ref(false)
const loading = ref(false)

const getActiveObject = (): (fabric.Image & IExtendImage) | undefined => {
  const activeObject = editorStore.canvas?.getActiveObject()
  if (!activeObject || !Utils.isImage(activeObject)) return
  return activeObject
}

const handleSelectOne = () => {
  isImage.value = !!getActiveObject()
}

// Mock Service Functions
const mockStartTask = () => Promise.resolve('task-' + Date.now())

const mockCheckStatus = (taskId: string) => {
  console.log('Checking status for', taskId)
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('COMPLETED')
    }, 1000) // Simulate polling delay
  })
}

const mockGetResult = () => {
  return Promise.resolve({
    version: '6.0.0',
    clipPath: {
      type: 'rect',
      version: '5.3.0',
      width: 900,
      height: 2000,
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
    ],
  })
}

const handleLayering = async () => {
  if (editorStore.isLayering) {
    ElMessage.warning('Only one layer can be parsed at a time.')
    return
  }

  const activeObject = getActiveObject()
  if (!activeObject) return

  const canvas = editorStore.canvas
  if (!canvas) return

  // Lock the object
  activeObject.set({
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    selectable: false,
    evented: false,
  })

  // Create Overlay
  // Copy transform from activeObject to overlayRect to ensure exact match
  const overlayRect = new fabric.Rect({
    left: activeObject.left,
    top: activeObject.top,
    width: activeObject.width,
    height: activeObject.height,
    scaleX: activeObject.scaleX,
    scaleY: activeObject.scaleY,
    angle: activeObject.angle,
    skewX: activeObject.skewX,
    skewY: activeObject.skewY,
    flipX: activeObject.flipX,
    flipY: activeObject.flipY,
    originX: activeObject.originX,
    originY: activeObject.originY,
    fill: 'rgba(255, 255, 255, 0.8)',
    selectable: false,
    evented: false,
    excludeFromExport: true,
    id: 'loading-mask',
  })

  const center = activeObject.getCenterPoint()
  const loadingText = new fabric.Text('Loading...', {
    left: center.x,
    top: center.y,
    originX: 'center',
    originY: 'center',
    fontSize: 20,
    fill: '#333',
    selectable: false,
    evented: false,
    excludeFromExport: true,
    id: 'loading-mask',
  })

  // Group needs correct positioning if created from objects
  // But creating a group from existing objects on canvas vs new objects
  // If we just add rect and text separately, it's easier to manage z-index?
  // But we want to remove them together.
  // Let's just add them to a group and position the group?
  // No, if we add them to a group, their coordinates become relative to the group center.
  // It's easier to just add them as a group but we need to calculate group position.

  // Alternative: Add them separately to canvas and track them.
  // Let's try adding them separately to be safe about positioning.

  canvas.add(overlayRect)
  canvas.add(loadingText)
  canvas.requestRenderAll()

  // Use direct assignment to avoid potential action missing error
  editorStore.isLayering = true
  loading.value = true

  try {
    const taskId = await mockStartTask()

    // Loop get task status
    while (true) {
      const status = await mockCheckStatus(taskId)
      if (status === 'COMPLETED') break
      await new Promise((r) => setTimeout(r, 500))
    }

    const result = await mockGetResult()
    const objects = result.objects

    const originalElement = activeObject.getElement() as HTMLImageElement

    const newObjects: fabric.Object[] = []

    for (const obj of objects) {
      let fabricObj: fabric.Object | null = null

      if (obj.type === 'image') {
        // Crop from original image
        const cropCanvas = document.createElement('canvas')
        cropCanvas.width = obj.width
        cropCanvas.height = obj.height
        const ctx = cropCanvas.getContext('2d')

        if (ctx) {
          // Draw the specific region from original image
          ctx.drawImage(
            originalElement,
            obj.left,
            obj.top,
            obj.width,
            obj.height,
            0,
            0,
            obj.width,
            obj.height,
          )

          const base64 = cropCanvas.toDataURL()
          const imgEl = await new Promise<HTMLImageElement>((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.src = base64
          })

          fabricObj = new fabric.Image(imgEl, {
            left: obj.left,
            top: obj.top,
            width: obj.width,
            height: obj.height,
            id: obj.id,
          })

          // Get background color from top-left pixel
          const pixelData = ctx.getImageData(0, 0, 1, 1).data
          // Check if not transparent
          if (pixelData[3] > 0) {
            const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`
            const filter = new (fabric.Image.filters as any).RemoveColor({
              color: color,
              distance: 0.1, // Tolerance
            })
            if (!(fabricObj as fabric.Image).filters) {
              ;(fabricObj as fabric.Image).filters = []
            }
            ;(fabricObj as fabric.Image).filters!.push(filter)
            ;(fabricObj as fabric.Image).applyFilters()
          }
        }
      } else if (obj.type === 'rect') {
        fabricObj = new fabric.Rect({
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          fill: obj.fill,
          stroke: obj.stroke || undefined,
          strokeWidth: obj.strokeWidth,
          opacity: obj.opacity,
          id: obj.id,
        })
      } else if (obj.type === 'textbox') {
        fabricObj = new fabric.Textbox(obj.text || '', {
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          fill: obj.fill,
          stroke: obj.stroke || undefined,
          strokeWidth: obj.strokeWidth,
          opacity: obj.opacity,
          angle: obj.angle,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          flipX: obj.flipX,
          flipY: obj.flipY,
          originX: obj.originX,
          originY: obj.originY,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          fontWeight: 'bold',
          fontStyle: obj.fontStyle as any,
          textAlign: obj.textAlign,
          lineHeight: obj.lineHeight,
          charSpacing: obj.charSpacing,
          id: obj.id,
        })
      }

      if (fabricObj) {
        newObjects.push(fabricObj)
      }
    }

    if (newObjects.length > 0) {
      const group = new fabric.Group(newObjects, {
        originX: 'center',
        originY: 'center',
      })

      const center = activeObject.getCenterPoint()

      group.set({
        left: center.x,
        top: center.y,
        angle: activeObject.angle,
        scaleX: activeObject.scaleX,
        scaleY: activeObject.scaleY,
        originX: 'center',
        originY: 'center',
      })

      const scaleX = (activeObject.width! * activeObject.scaleX!) / group.width!
      const scaleY = (activeObject.height! * activeObject.scaleY!) / group.height!

      group.set({
        scaleX: scaleX,
        scaleY: scaleY,
      })

      const index = canvas.getObjects().indexOf(activeObject)
      canvas.remove(activeObject)
      canvas.insertAt(group, index, false)

      // Ungroup to get individual layers
      group.toActiveSelection()
      canvas.requestRenderAll()
      editorStore.editor?.emit('layering-complete')
    }
  } catch (e) {
    console.error('Layering failed:', e)
    // Unlock if failed
    activeObject.set({
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      selectable: true,
      evented: true,
    })
  } finally {
    canvas.remove(overlayRect)
    canvas.remove(loadingText)
    canvas.requestRenderAll()
    editorStore.isLayering = false
    loading.value = false
  }
}

onMounted(() => {
  nextTick(() => {
    editorStore.editor?.on('selectOne', handleSelectOne)
  })
})

onBeforeUnmount(() => {
  editorStore.editor?.off('selectOne', handleSelectOne)
})
</script>

<template>
  <div v-if="isOne && isImage" class="inline-block">
    <el-button title="编辑元素" @click="handleLayering" :loading="loading">
      <Layers2 :size="16" />
    </el-button>
  </div>
</template>
