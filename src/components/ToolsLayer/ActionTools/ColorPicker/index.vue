<script setup lang="ts">
import { ref } from 'vue'
import { Pipette, Ban } from 'lucide-vue-next'

defineProps<{
  modelValue?: string
}>()

const emits = defineEmits(['update:modelValue', 'change'])

// File colors (mock data based on image)
const fileColors = ref([
  '#FFFFFF',
  '#000000',
  '#FFD700', // Yellow
  '#FF4500', // Orange
  '#4A4A4A', // Dark Grey
  '#90EE90', // Light Green
  '#DC143C', // Red
])

// Preset solid colors
const presetColors = ref([
  '#FFFFFF',
  '#FFB6C1',
  '#FFC0CB',
  '#FFE4B5',
  '#98FB98',
  '#B0C4DE',
  '#E6E6FA',
  '#808080',
  '#F08080',
  '#FF69B4',
  '#FFA500',
  '#32CD32',
  '#6495ED',
  '#9370DB',
  '#191919',
  '#B22222',
  '#A52A2A',
  '#8B4500',
  '#008000',
  '#191970',
  '#4B0082',
  '#333333',
  '#8B8000',
  '#000080',
  '#90EE90',
  '#FF8C00',
  '#00BFFF',
  '#ADD8E6',
])

const handleColorClick = (color: string) => {
  emits('update:modelValue', color)
  emits('change', color)
}

const handleTransparent = () => {
  handleColorClick('transparent') // Or empty string depending on requirement
}

const handleEyeDropper = async () => {
  if (!(window as any).EyeDropper) {
    console.warn('EyeDropper API not supported')
    return
  }
  const eyeDropper = new (window as any).EyeDropper()
  try {
    const result = await eyeDropper.open()
    handleColorClick(result.sRGBHex)
  } catch {
    console.log('User canceled the selection')
  }
}

const customColor = ref('#000000')
const handleCustomColorChange = (val: string) => {
  handleColorClick(val)
}
</script>

<template>
  <div class="color-picker w-64 p-2">
    <!-- File Colors -->
    <div class="mb-4">
      <div class="text-xs text-gray-500 mb-2">背景颜色</div>
      <div class="flex flex-wrap gap-2">
        <!-- Transparent -->
        <div
          class="w-8 h-8 border rounded flex items-center justify-center cursor-pointer hover:bg-gray-100"
          @click="handleTransparent"
          title="无填充"
        >
          <Ban :size="16" class="text-gray-400" />
        </div>

        <!-- Eyedropper -->
        <div
          class="w-8 h-8 border rounded flex items-center justify-center cursor-pointer hover:bg-gray-100"
          @click="handleEyeDropper"
          title="吸管"
        >
          <Pipette :size="16" class="text-gray-600" />
        </div>

        <!-- Custom Color (Rainbow) -->
        <div class="w-8 h-8 border rounded relative cursor-pointer overflow-hidden">
          <div
            class="absolute inset-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-80"
          ></div>
          <input
            type="color"
            class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            v-model="customColor"
            @input="(e: any) => handleCustomColorChange(e.target.value)"
          />
        </div>

        <!-- File Colors List -->
        <div
          v-for="color in fileColors"
          :key="color"
          class="w-8 h-8 rounded border cursor-pointer"
          :style="{ background: color }"
          @click="handleColorClick(color)"
        ></div>
      </div>
    </div>

    <!-- Preset Colors -->
    <div>
      <div class="text-xs text-gray-500 mb-2">预设颜色</div>
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div
          v-for="color in presetColors"
          :key="color"
          class="w-6 h-6 rounded border cursor-pointer"
          :style="{ background: color }"
          @click="handleColorClick(color)"
        ></div>
      </div>

      <!-- Gradients -->
      <!-- <div class="grid grid-cols-7 gap-2">
        <div
          v-for="(color, index) in gradientColors"
          :key="index"
          class="w-6 h-6 rounded border cursor-pointer"
          :style="{ background: color }"
          @click="handleColorClick(color)"
        ></div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles if needed, mostly using Tailwind classes */
</style>
