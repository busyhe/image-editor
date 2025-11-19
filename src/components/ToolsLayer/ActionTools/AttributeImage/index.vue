<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Layers2 } from 'lucide-vue-next'
import { fabric } from 'fabric'
import useSelect from '@/hooks/select'
import { useEditorStore } from '@/stores/modules/editor'
import { Utils } from '@/lib/core'

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
  const activeObject = getActiveObject()
  if (!activeObject) return

  // Canvas Loading Indicator
  const canvas = editorStore.canvas
  if (!canvas) return

  const loadingText = new fabric.Text('Loading...', {
    left: activeObject.left,
    top: activeObject.top,
    originX: 'center',
    originY: 'center',
    fontSize: 20,
    fill: 'white',
    backgroundColor: 'rgba(0,0,0,0.7)',
    selectable: false,
    evented: false,
  })

  canvas.add(loadingText)
  canvas.requestRenderAll()

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
            // Copy other properties if needed
          })
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
          fontWeight: obj.fontWeight,
          fontStyle: obj.fontStyle as any,
          textAlign: obj.textAlign,
          lineHeight: obj.lineHeight,
          charSpacing: obj.charSpacing,
        })
      }

      if (fabricObj) {
        // Adjust origin to center for Group calculation later?
        // The JSON has originX: 'left', originY: 'top'.
        // We keep them as is for now, and will adjust when grouping.
        newObjects.push(fabricObj)
      }
    }

    if (newObjects.length > 0) {
      // Create a group of the new objects
      // The objects are currently positioned relative to (0,0) of the "virtual" original image space.
      // We need to center this group around the center of the original image content.

      // 1. Calculate the bounding box of the new objects?
      // Or assume the "virtual space" matches the original image size?
      // The JSON background rect is 1024x1024.
      // If the original image is different, we might need to scale.
      // For this mock, let's assume we just group them.

      const group = new fabric.Group(newObjects, {
        originX: 'center',
        originY: 'center',
      })

      // The group's center (0,0 inside group) will be the center of the bounding box of all objects.
      // We need to position this Group such that it aligns with the ActiveObject.

      // Strategy:
      // 1. Create group.
      // 2. Set group transform to match activeObject.
      // BUT: The internal relative positions of objects in the group matter.
      // If the JSON coordinates are (0,0) based, and we want (0,0) to be the top-left of the activeObject.

      // Let's try:
      // 1. Find the center of the "virtual canvas" (e.g. 1024/2 = 512).
      // 2. Shift all objects so their coordinates are relative to that center.
      // OR: Use fabric.Group to auto-calculate.

      // If we just do `new fabric.Group(newObjects)`, Fabric calculates the width/height and center.
      // We want the Top-Left of this Group (unrotated) to match the Top-Left of the ActiveObject (unrotated).

      // Let's calculate the center of the original image in its own coordinate space.
      // width/2, height/2.

      // We want to place the group at the ActiveObject's center.
      const center = activeObject.getCenterPoint()

      group.set({
        left: center.x,
        top: center.y,
        angle: activeObject.angle,
        scaleX: activeObject.scaleX, // Assuming 1:1 mapping for now, or we might need to adjust scale if pixel density differs
        scaleY: activeObject.scaleY,
        originX: 'center',
        originY: 'center',
      })

      // If the JSON content (1024x1024) is different size than the original image's natural size,
      // we might need to adjust scale.
      // For this mock, let's assume the JSON *is* the decomposition of the image, so it should match.
      // If naturalWidth is 1024, then scale is 1.
      // If naturalWidth is 500, and JSON is 1024, we might need to scale down the group?
      // Let's compute a scale factor.

      // Find the "background" object or use the max bounds?
      // The JSON has a background rect 1024x1024.
      // Let's assume the JSON canvas size corresponds to naturalWidth/Height.
      // But the JSON has explicit 1024.
      // If naturalWidth != 1024, we should scale the group.

      // Actually, simpler:
      // We replaced the content. If the content is larger/smaller, we should probably scale it to fit the original visual bounds?
      // Or just respect the original scaleX/scaleY.
      // If I have a 100x100 image displayed at 200x200 (scale=2).
      // And I replace it with 100x100 content. Scale=2 works.
      // If I replace it with 1000x1000 content. Scale=2 makes it 2000x2000.
      // So we need to adjust scale.

      // Let's calculate scale factor based on the first object (Background) or overall bounds?
      // Let's use the group's width/height.

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
  } finally {
    canvas.remove(loadingText)
    canvas.requestRenderAll()
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
