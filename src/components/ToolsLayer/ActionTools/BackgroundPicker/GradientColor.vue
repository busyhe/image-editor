<script setup lang="ts">
import { fabric } from 'fabric'

const emit = defineEmits(['change'])

const gradientPresets = [
  {
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
    colorStops: [
      { offset: 0, color: '#ff9a9e' },
      { offset: 1, color: '#fecfef' },
    ],
  },
  {
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
    colorStops: [
      { offset: 0, color: '#a18cd1' },
      { offset: 1, color: '#fbc2eb' },
    ],
  },
  {
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
    colorStops: [
      { offset: 0, color: '#84fab0' },
      { offset: 1, color: '#8fd3f4' },
    ],
  },
  {
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
    colorStops: [
      { offset: 0, color: '#e0c3fc' },
      { offset: 1, color: '#8ec5fc' },
    ],
  },
  {
    type: 'radial',
    coords: { r1: 0, r2: 1, x1: 0.5, y1: 0.5, x2: 0.5, y2: 0.5 },
    colorStops: [
      { offset: 0, color: '#ff9a9e' },
      { offset: 1, color: '#fad0c4' },
    ],
  },
  {
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
    colorStops: [
      { offset: 0, color: '#43e97b' },
      { offset: 1, color: '#38f9d7' },
    ],
  },
  {
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
    colorStops: [
      { offset: 0, color: '#fa709a' },
      { offset: 1, color: '#fee140' },
    ],
  },
  {
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
    colorStops: [
      { offset: 0, color: '#30cfd0' },
      { offset: 1, color: '#330867' },
    ],
  },
]

const renderCssGradient = (preset: any) => {
  const { type, colorStops, coords } = preset
  const stops = colorStops.map((s: any) => `${s.color} ${s.offset * 100}%`).join(', ')

  if (type === 'linear') {
    const dx = coords.x2 - coords.x1
    const dy = coords.y2 - coords.y1
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    return `linear-gradient(${angle}deg, ${stops})`
  } else {
    return `radial-gradient(circle, ${stops})`
  }
}

const handlePresetClick = (preset: any) => {
  const gradient = new fabric.Gradient({
    type: preset.type,
    coords: preset.coords,
    colorStops: preset.colorStops,
    gradientUnits: 'percentage', // Enable relative coordinates
  })

  emit('change', gradient)
}
</script>

<template>
  <div class="p-2">
    <div class="text-xs text-gray-500 mb-2">预设渐变</div>
    <div class="grid grid-cols-4 gap-2">
      <div
        v-for="(preset, idx) in gradientPresets"
        :key="idx"
        class="h-8 w-8 rounded border cursor-pointer hover:border-blue-500 transition-colors"
        :style="{ background: renderCssGradient(preset) }"
        @click="handlePresetClick(preset)"
      ></div>
    </div>
  </div>
</template>
